const http = require('http');

async function testAllDashboards() {
  console.log('--- TESTING ALL DASHBOARDS & AUTH ME ---');

  // Helper to make request
  function request(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  // 1. Test Login as Admin
  const adminLoginPayload = JSON.stringify({ email: 'admin@admin.com', password: 'password123' });
  const adminRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(adminLoginPayload) }
  }, adminLoginPayload);

  const adminCookies = (adminRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  console.log('1. Admin Login Status:', adminRes.status);

  // 2. Test /api/auth/me with admin cookie
  const meRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Cookie': adminCookies }
  });
  console.log('2. Admin /api/auth/me Status:', meRes.status, 'Body:', meRes.body);

  // 3. Test /admin/dashboard HTML
  const adminPage = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/admin/dashboard',
    method: 'GET',
    headers: { 'Cookie': adminCookies }
  });
  console.log('3. /admin/dashboard Status:', adminPage.status);
  console.log('   - Has Settings:', adminPage.body.includes('Settings'));
  console.log('   - Has Translation:', adminPage.body.includes('Translation'));
  console.log('   - Has Maintenance:', adminPage.body.includes('Maintenance'));
  console.log('   - Does NOT have public "Sign up" in header:', !adminPage.body.includes('>Sign up<'));

  // 4. Test Login as Instructor
  const instLoginPayload = JSON.stringify({ email: 'instructor@mentor.test', password: 'password123' });
  const instRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(instLoginPayload) }
  }, instLoginPayload);

  const instCookies = (instRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  console.log('4. Instructor Login Status:', instRes.status);

  // 5. Test /instructor/dashboard HTML
  const instPage = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/instructor/dashboard',
    method: 'GET',
    headers: { 'Cookie': instCookies }
  });
  console.log('5. /instructor/dashboard Status:', instPage.status);
  console.log('   - Has Courses:', instPage.body.includes('Courses'));
  console.log('   - Has Instructor Revenue:', instPage.body.includes('Instructor Revenue This Year'));
  console.log('   - Does NOT have public "Sign up" in header:', !instPage.body.includes('>Sign up<'));

  // 6. Test Login as Student
  const studLoginPayload = JSON.stringify({ email: 'student@mentor.test', password: 'password123' });
  const studRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(studLoginPayload) }
  }, studLoginPayload);

  const studCookies = (studRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  console.log('6. Student Login Status:', studRes.status);

  // 7. Test /student HTML
  const studPage = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/student',
    method: 'GET',
    headers: { 'Cookie': studCookies }
  });
  console.log('7. /student Status:', studPage.status);
  console.log('   - Has Enrolled Courses:', studPage.body.includes('Enrolled Courses'));
}

testAllDashboards().catch(console.error);
