const BASE_URL = 'http://localhost:3000';

async function testDynamic() {
  console.log('=== VERIFYING STUDENT & ADMIN DYNAMIC DATA ENDPOINTS ===\n');
  let failures = 0;

  // 1. Student Courses
  try {
    const res = await fetch(`${BASE_URL}/api/student/courses`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    const data = await res.json();
    console.log(`1. Student Courses: HTTP ${res.status}, Count: ${data.courses?.length || 0}`);
    if (!res.ok || !data.courses || data.courses.length === 0) throw new Error('Student courses empty or failed');
    console.log('   Sample course:', data.courses[0].title, `(${data.courses[0].progress_percent}% progress)`);
  } catch (err) {
    console.error('❌ Student courses test failed:', err.message);
    failures++;
  }

  // 2. Student Exams
  try {
    const res = await fetch(`${BASE_URL}/api/student/exams`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    const data = await res.json();
    console.log(`2. Student Exams: HTTP ${res.status}, Count: ${data.exams?.length || 0}`);
    if (!res.ok || !data.exams || data.exams.length === 0) throw new Error('Student exams empty or failed');
    console.log('   Sample exam:', data.exams[0].title, `(Attempts: ${data.exams[0].total_attempts})`);
  } catch (err) {
    console.error('❌ Student exams test failed:', err.message);
    failures++;
  }

  // 3. Student Purchases (Digital Store)
  try {
    const res = await fetch(`${BASE_URL}/api/student/purchases`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    const data = await res.json();
    console.log(`3. Student Purchases: HTTP ${res.status}, Count: ${data.purchases?.length || 0}`);
    if (!res.ok || !data.purchases || data.purchases.length === 0) throw new Error('Student purchases empty or failed');
    console.log('   Sample purchase:', data.purchases[0].title, `(Total: $${data.purchases[0].total})`);
  } catch (err) {
    console.error('❌ Student purchases test failed:', err.message);
    failures++;
  }

  // 4. Student Wishlist
  try {
    const res = await fetch(`${BASE_URL}/api/student/wishlist`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    const data = await res.json();
    const count = Array.isArray(data.wishlist) ? data.wishlist.length : (data.wishlist?.totalCount || 0);
    console.log(`4. Student Wishlist: HTTP ${res.status}, Count: ${count}`);
    if (!res.ok || count === 0) throw new Error('Student wishlist empty or failed');
  } catch (err) {
    console.error('❌ Student wishlist test failed:', err.message);
    failures++;
  }

  // 5. Student Certificates
  try {
    const res = await fetch(`${BASE_URL}/api/student/certificates`, {
      headers: { 'Cookie': 'demo_user=student' }
    });
    const data = await res.json();
    console.log(`5. Student Certificates: HTTP ${res.status}, Count: ${data.certificates?.length || 0}`);
    if (!res.ok || !data.certificates || data.certificates.length === 0) throw new Error('Student certificates empty or failed');
    console.log('   Sample cert:', data.certificates[0].identifier, 'for course:', data.certificates[0].course_title);
  } catch (err) {
    console.error('❌ Student certificates test failed:', err.message);
    failures++;
  }

  // 6. Admin Course Enrollments
  try {
    const res = await fetch(`${BASE_URL}/api/admin/enrollments/courses`, {
      headers: { 'Cookie': 'demo_user=admin' }
    });
    const data = await res.json();
    console.log(`6. Admin Course Enrollments: HTTP ${res.status}, Count: ${data.enrollments?.length || 0}`);
    if (!res.ok || !data.enrollments || data.enrollments.length === 0) throw new Error('Admin course enrollments empty or failed');
  } catch (err) {
    console.error('❌ Admin course enrollments test failed:', err.message);
    failures++;
  }

  // 7. Admin Instructor Applications
  try {
    const res = await fetch(`${BASE_URL}/api/admin/instructors/applications`, {
      headers: { 'Cookie': 'demo_user=admin' }
    });
    const data = await res.json();
    console.log(`7. Admin Instructor Applications: HTTP ${res.status}, Count: ${data.applications?.length || 0}`);
    if (!res.ok || !data.applications || data.applications.length === 0) throw new Error('Instructor applications empty or failed');
  } catch (err) {
    console.error('❌ Admin instructor applications test failed:', err.message);
    failures++;
  }

  // 8. Admin Users List
  try {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Cookie': 'demo_user=admin' }
    });
    const data = await res.json();
    console.log(`8. Admin Users: HTTP ${res.status}, Count: ${data.users?.length || data.length || 0}`);
    if (!res.ok) throw new Error('Admin users list failed');
  } catch (err) {
    console.error('❌ Admin users test failed:', err.message);
    failures++;
  }

  // 9. All Blogs Listing
  try {
    const res = await fetch(`${BASE_URL}/api/blogs?status=all`);
    const data = await res.json();
    console.log(`9. Blogs List: HTTP ${res.status}, Count: ${data.blogs?.length || 0}`);
    if (!res.ok || !data.blogs || data.blogs.length === 0) throw new Error('Blogs list empty or failed');
  } catch (err) {
    console.error('❌ Blogs list test failed:', err.message);
    failures++;
  }

  // 10. All Store Products Listing
  try {
    const res = await fetch(`${BASE_URL}/api/products?status=all`);
    const data = await res.json();
    console.log(`10. Products List: HTTP ${res.status}, Count: ${data.products?.length || 0}`);
    if (!res.ok || !data.products || data.products.length === 0) throw new Error('Products list empty or failed');
  } catch (err) {
    console.error('❌ Products list test failed:', err.message);
    failures++;
  }

  console.log(`\n=== DYNAMIC VERIFICATION FINISHED: ${failures === 0 ? 'ALL PASSED (0 failures)!' : failures + ' failures'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

testDynamic();
