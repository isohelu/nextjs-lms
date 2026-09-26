const BASE_URL = 'http://localhost:3000';

async function testRoutingStructure() {
  console.log('=== VERIFYING NEW LMS ROUTING ARCHITECTURE ===\n');
  let failures = 0;

  // 1. Check GET /auth/login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`);
    console.log(`1. GET /auth/login: HTTP ${res.status}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  } catch (err) {
    console.error('❌ /auth/login failed:', err.message);
    failures++;
  }

  // 2. Check GET /student/dashboard
  try {
    const res = await fetch(`${BASE_URL}/student/dashboard`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    console.log(`2. GET /student/dashboard: HTTP ${res.status}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  } catch (err) {
    console.error('❌ /student/dashboard failed:', err.message);
    failures++;
  }

  // 3. Check GET /instructor/dashboard
  try {
    const res = await fetch(`${BASE_URL}/instructor/dashboard`, {
      headers: { 'Cookie': 'demo_user=instructor' }
    });
    console.log(`3. GET /instructor/dashboard: HTTP ${res.status}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  } catch (err) {
    console.error('❌ /instructor/dashboard failed:', err.message);
    failures++;
  }

  // 4. Check GET /admin/dashboard
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Cookie': 'demo_user=admin' }
    });
    console.log(`4. GET /admin/dashboard: HTTP ${res.status}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  } catch (err) {
    console.error('❌ /admin/dashboard failed:', err.message);
    failures++;
  }

  // 5. Test Role-Based Login Redirects
  console.log('\n--- Testing Role-Based Login Redirects ---');

  // 5a. Admin Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin.com', password: 'password123' })
    });
    const json = await res.json();
    console.log(`5a. Admin Login: HTTP ${res.status}, Redirect: ${json.redirect}`);
    if (!json.success || json.redirect !== '/admin/dashboard') {
      throw new Error(`Expected redirect /admin/dashboard, got ${json.redirect}`);
    }
  } catch (err) {
    console.error('❌ Admin login redirect failed:', err.message);
    failures++;
  }

  // 5b. Instructor Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'instructor@mentor.test', password: 'password123' })
    });
    const json = await res.json();
    console.log(`5b. Instructor Login: HTTP ${res.status}, Redirect: ${json.redirect}`);
    if (!json.success || json.redirect !== '/instructor/dashboard') {
      throw new Error(`Expected redirect /instructor/dashboard, got ${json.redirect}`);
    }
  } catch (err) {
    console.error('❌ Instructor login redirect failed:', err.message);
    failures++;
  }

  // 5c. Student Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@mentor.test', password: 'password123' })
    });
    const json = await res.json();
    console.log(`5c. Student Login: HTTP ${res.status}, Redirect: ${json.redirect}`);
    if (!json.success || json.redirect !== '/student/dashboard') {
      throw new Error(`Expected redirect /student/dashboard, got ${json.redirect}`);
    }
  } catch (err) {
    console.error('❌ Student login redirect failed:', err.message);
    failures++;
  }

  // 6. Check Legacy Routes
  console.log('\n--- Checking Legacy Routes Compatibility ---');
  const legacyRoutes = [
    { path: '/login', cookie: '' },
    { path: '/auth', cookie: '' },
    { path: '/dashboard', cookie: 'demo_user=admin' },
    { path: '/student', cookie: 'demo_user=student' },
    { path: '/student/courses', cookie: 'demo_user=student' }
  ];

  for (const lr of legacyRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${lr.path}`, {
        headers: lr.cookie ? { 'Cookie': lr.cookie } : {}
      });
      console.log(`6. GET ${lr.path}: HTTP ${res.status}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    } catch (err) {
      console.error(`❌ Legacy route ${lr.path} failed:`, err.message);
      failures++;
    }
  }

  console.log(`\n=== ROUTING STRUCTURE VERIFICATION: ${failures === 0 ? 'ALL PASSED (0 failures)!' : failures + ' failures'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

testRoutingStructure();
