const http = require('http');

const fullDashboardRoutes = [
  '/dashboard',
  '/dashboard/courses/categories',
  '/dashboard/courses',
  '/dashboard/courses/create',
  '/dashboard/courses/course/coupons',
  '/dashboard/courses/course/enrollments',
  '/dashboard/exams/categories',
  '/dashboard/exams',
  '/dashboard/exams/create',
  '/dashboard/exams/exam/coupons',
  '/dashboard/exams/exam/enrollments',
  '/dashboard/store/categories',
  '/dashboard/store/products',
  '/dashboard/store/products/create',
  '/dashboard/store/products/product/coupons',
  '/dashboard/store/products/product/sales',
  '/dashboard/blogs/categories',
  '/dashboard/blogs/create',
  '/dashboard/blogs',
  '/dashboard/frontend/pages',
  '/dashboard/frontend/api',
  '/dashboard/job-circulars',
  '/dashboard/job-circulars/create',
  '/dashboard/instructors/applications',
  '/dashboard/instructors',
  '/dashboard/instructors/create',
  '/dashboard/billings/payment',
  '/dashboard/billings/payment-reports/online',
  '/dashboard/billings/payment-reports/offline',
  '/dashboard/billings/payouts/request',
  '/dashboard/billings/payouts/history',
  '/dashboard/billings/payouts',
  '/dashboard/billings/payouts/settings',
  '/dashboard/certification/certificate',
  '/dashboard/certification/marksheet',
  '/dashboard/newsletters',
  '/dashboard/users',
  '/dashboard/language',
  '/dashboard/settings/account',
  '/dashboard/settings/system',
  '/dashboard/settings/pages',
  '/dashboard/settings/storage',
  '/dashboard/settings/smtp',
  '/dashboard/settings/plugins',
  '/dashboard/settings/auth0',
  '/dashboard/settings/live-class',
  '/dashboard/settings/meta-pixel',
  '/dashboard/settings/google-analytics',
  '/dashboard/settings/maintenance'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${route}`, {
      headers: {
        'Cookie': 'demo_user=admin'
      }
    }, (res) => {
      resolve({ route, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ route, status: 'ERROR: ' + err.message });
    });
    req.setTimeout(10000, () => {
      req.abort();
      resolve({ route, status: 'TIMEOUT' });
    });
  });
}

async function run() {
  console.log('Checking all', fullDashboardRoutes.length, 'dashboard routes...');
  const results = [];
  for (const r of fullDashboardRoutes) {
    const res = await checkRoute(r);
    results.push(res);
    console.log(`${res.status === 200 ? '✅' : '❌'} [${res.status}] ${res.route}`);
  }
  const failed = results.filter(r => r.status !== 200);
  console.log(`\nFinished: ${results.length - failed.length} passed, ${failed.length} failed/error.`);
  if (failed.length > 0) {
    console.log('Failed routes:', failed);
  }
}

run();
