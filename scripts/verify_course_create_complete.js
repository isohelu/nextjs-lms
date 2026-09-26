const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  console.log('=== 1. VERIFY LARAVEL SERVER (/dashboard/courses/create) ===');
  try {
    const laravelRes = await request({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/dashboard/courses/create',
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    console.log(`Laravel Status Code: ${laravelRes.statusCode}`);
    const hasInertia = laravelRes.body.includes('data-page') || laravelRes.body.includes('Course/dashboard/create');
    console.log(`Laravel renders Inertia page properly: ${hasInertia ? 'YES' : 'NO'}`);
  } catch (err) {
    console.error('Laravel request error:', err.message);
  }

  console.log('\n=== 2. VERIFY NEXT.JS API: /api/instructors ===');
  const instRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/instructors',
    method: 'GET',
  });
  console.log(`Instructors API Status: ${instRes.statusCode}`);
  const instructors = JSON.parse(instRes.body);
  console.log(`Instructors Count: ${instructors.length}`);
  if (instructors.length > 0) {
    console.log(`Sample Instructor: ID=${instructors[0].id}, Name="${instructors[0].name}"`);
  }

  console.log('\n=== 3. VERIFY NEXT.JS API: /api/course-categories ===');
  const catRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/course-categories',
    method: 'GET',
  });
  console.log(`Categories API Status: ${catRes.statusCode}`);
  const categories = JSON.parse(catRes.body);
  console.log(`Categories Count: ${categories.length}`);
  const withChildren = categories.filter((c) => c.category_children && c.category_children.length > 0);
  console.log(`Categories with children: ${withChildren.length}`);
  if (withChildren.length > 0) {
    console.log(`Sample Category: "${withChildren[0].title}" has ${withChildren[0].category_children.length} subcategories (e.g. "${withChildren[0].category_children[0].title}", ID=${withChildren[0].category_children[0].id})`);
  }

  console.log('\n=== 4. TEST ADMIN LOGIN & COURSE CREATION (NEXT.JS) ===');
  // First, login as admin to get auth cookie
  const loginPayload = JSON.stringify({
    email: 'admin@admin.com',
    password: 'password123',
  });

  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload),
      },
    },
    loginPayload
  );

  console.log(`Login Status: ${loginRes.statusCode}`);
  const setCookie = loginRes.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || '');

  // Choose a test instructor and subcategory
  const targetInstructorId = instructors.length > 0 ? instructors[0].id : 1;
  const targetParentCat = withChildren.length > 0 ? withChildren[0] : categories[0];
  const targetChildCatId = targetParentCat.category_children && targetParentCat.category_children.length > 0
    ? targetParentCat.category_children[0].id
    : null;

  const testCourseTitle = `Admin Full Flow Test Course ${Date.now()}`;
  const coursePayload = JSON.stringify({
    title: testCourseTitle,
    short_description: 'Testing 1:1 reproduction of course creation with instructor and child category.',
    description: '<p>Comprehensive course creation test description.</p>',
    course_category_id: String(targetParentCat.id),
    course_category_child_id: targetChildCatId ? String(targetChildCatId) : '',
    instructor_id: String(targetInstructorId),
    level: 'Beginner',
    language: 'English',
    pricing_type: 'paid',
    price: '49.99',
    discount: true,
    discount_price: '29.99',
    expiry_type: 'lifetime',
    drip_content: '1',
  });

  const createRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/courses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(coursePayload),
        'Cookie': cookieHeader,
      },
    },
    coursePayload
  );

  console.log(`Create Course API Status: ${createRes.statusCode}`);
  const createData = JSON.parse(createRes.body);
  console.log('Create Response:', createData);

  if (createData.success && createData.id) {
    const row = db.prepare('SELECT id, title, instructor_id, course_category_id, course_category_child_id, price, discount_price, drip_content FROM courses WHERE id = ?').get(createData.id);
    console.log('\nVerified Course in SQLite Database:');
    console.log(row);
  }

  console.log('\n=== 5. VERIFY NEXT.JS PAGE: /dashboard/courses/create ===');
  const pageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/dashboard/courses/create',
    method: 'GET',
    headers: {
      'Cookie': cookieHeader,
    },
  });
  console.log(`Next.js Course Create Page Status: ${pageRes.statusCode}`);
  console.log(`Contains "Create Course": ${pageRes.body.includes('Create Course')}`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
