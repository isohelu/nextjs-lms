const http = require('http');

async function testNextAdminDashboard() {
  console.log('Testing Next.js Admin Dashboard...');

  // 1. First test login to get session cookie
  const loginPayload = JSON.stringify({
    email: 'admin@admin.com',
    password: 'password123'
  });

  const loginReq = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  }, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log('Login Response Status:', res.statusCode);
      console.log('Login Response Body:', raw);

      const setCookie = res.headers['set-cookie'];
      console.log('Set-Cookie:', setCookie);

      const cookies = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : '';

      // 2. Test fetching /api/admin/dashboard with cookie
      const apiReq = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/admin/dashboard',
        method: 'GET',
        headers: {
          'Cookie': cookies
        }
      }, (apiRes) => {
        let apiRaw = '';
        apiRes.on('data', c => apiRaw += c);
        apiRes.on('end', () => {
          console.log('\n--- API /api/admin/dashboard ---');
          console.log('Status:', apiRes.statusCode);
          try {
            const parsed = JSON.parse(apiRaw);
            console.log('Statistics:', parsed.statistics);
            console.log('RevenueData sample:', Object.entries(parsed.revenueData || {}).slice(0, 3));
            console.log('CourseStatusDistribution:', parsed.courseStatusDistribution);
            console.log('PendingWithdrawals length:', (parsed.pendingWithdrawals || []).length);
          } catch(e) {
            console.log('Raw body:', apiRaw);
          }

          // 3. Test fetching page HTML /admin/dashboard with cookie
          const pageReq = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: '/admin/dashboard',
            method: 'GET',
            headers: {
              'Cookie': cookies
            }
          }, (pageRes) => {
            let pageRaw = '';
            pageRes.on('data', c => pageRaw += c);
            pageRes.on('end', () => {
              console.log('\n--- Page /admin/dashboard ---');
              console.log('Status:', pageRes.statusCode);
              console.log('Has "Admin Revenue This Year":', pageRaw.includes('Admin Revenue This Year'));
              console.log('Has "Courses":', pageRaw.includes('Courses'));
              console.log('Has "Main Menu":', pageRaw.includes('Main Menu'));
              console.log('Has "Dashboard":', pageRaw.includes('Dashboard'));
              console.log('Has "Course Status":', pageRaw.includes('Course Status'));
            });
          });
          pageReq.end();
        });
      });
      apiReq.end();
    });
  });

  loginReq.write(loginPayload);
  loginReq.end();
}

testNextAdminDashboard();
