const http = require('http');

const ROUTES = [
  // Dashboard Core
  '/dashboard',
  // Courses
  '/dashboard/courses/categories',
  '/dashboard/courses',
  '/dashboard/courses/create',
  '/dashboard/courses/course/coupons',
  '/dashboard/courses/course/enrollments',
  // Exams
  '/dashboard/exams/categories',
  '/dashboard/exams',
  '/dashboard/exams/create',
  '/dashboard/exams/exam/coupons',
  '/dashboard/exams/exam/enrollments',
  // Store
  '/dashboard/store/categories',
  '/dashboard/store/products',
  '/dashboard/store/products/create',
  '/dashboard/store/products/product/coupons',
  '/dashboard/store/products/product/sales',
  // Blogs
  '/dashboard/blogs/categories',
  '/dashboard/blogs/create',
  '/dashboard/blogs',
  // Frontend
  '/dashboard/frontend/pages',
  '/dashboard/frontend/api',
  // Job Circulars
  '/dashboard/job-circulars',
  '/dashboard/job-circulars/create',
  // Instructors
  '/dashboard/instructors/applications',
  '/dashboard/instructors',
  '/dashboard/instructors/create',
  // Billings
  '/dashboard/billings/payment',
  '/dashboard/billings/payment-reports/online',
  '/dashboard/billings/payment-reports/offline',
  '/dashboard/billings/payouts/request',
  '/dashboard/billings/payouts/history',
  '/dashboard/billings/payouts',
  '/dashboard/billings/payouts/settings',
  // Certification
  '/dashboard/certification/certificate',
  '/dashboard/certification/marksheet',
  // Newsletters
  '/dashboard/newsletters',
  // Users
  '/dashboard/users',
  // Language
  '/dashboard/language',
  // Settings
  '/dashboard/settings',
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
  '/dashboard/settings/maintenance',
  // Student Portal
  '/student',
  '/student/courses',
  '/student/courses/1',
  '/student/courses/1/modules',
  '/student/courses/1/live_classes',
  '/student/courses/1/assignments',
  '/student/courses/1/quizzes',
  '/student/courses/1/resources',
  '/student/courses/1/certificate',
  '/student/exams',
  '/student/exams/1',
  '/student/exams/1/attempts',
  '/student/exams/1/resources',
  '/student/exams/1/certificate',
  '/student/exams/1/result',
  '/student/products',
  '/student/wishlist',
  '/student/certificates',
  '/student/profile',
  '/student/settings',
  '/student/become-instructor',
];

function checkRoute(path, retries = 2) {
  return new Promise((resolve) => {
    const tryReq = (attempt) => {
      const req = http.get({
        hostname: 'localhost',
        port: 3000,
        path: path,
        headers: {
          'Cookie': 'demo_user=' + encodeURIComponent(JSON.stringify({
            id: 1,
            name: 'Super Admin',
            email: 'admin@admin.com',
            role: 'admin'
          }))
        }
      }, (res) => {
        resolve({ path, statusCode: res.statusCode, location: res.headers.location });
      });
      req.on('error', (err) => {
        if (attempt < retries) {
          setTimeout(() => tryReq(attempt + 1), 300);
        } else {
          resolve({ path, error: err.message });
        }
      });
    };
    tryReq(0);
  });
}

async function run() {
  console.log(`Auditing ${ROUTES.length} routes against Next.js on port 3000...\n`);
  let passed = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const res = await checkRoute(route);
    if (res.error) {
      console.log(`❌ ${route} -> ERROR: ${res.error}`);
      failed++;
    } else if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302) {
      const redirectMsg = res.location ? ` -> ${res.location}` : '';
      console.log(`✅ [${res.statusCode}] ${route}${redirectMsg}`);
      passed++;
    } else {
      console.log(`⚠️ [${res.statusCode}] ${route}`);
      failed++;
    }
  }

  console.log(`\nAudit Complete: ${passed} passed, ${failed} failed out of ${ROUTES.length} routes.`);
}

run();
