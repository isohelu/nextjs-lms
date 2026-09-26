const http = require('http');

const routes = [
  '/student',
  '/student/courses',
  '/student/exams',
  '/student/products',
  '/student/wishlist',
  '/student/certificates',
  '/student/become-instructor'
];

async function check() {
  console.log('Checking student portal routes...');
  for (const r of routes) {
    await new Promise((resolve) => {
      http.get('http://localhost:3000' + r, {
        headers: { 'Cookie': 'demo_user=student' }
      }, (resp) => {
        console.log(`[${resp.statusCode}] ${r}`);
        resolve();
      }).on('error', (err) => {
        console.error(`Error on ${r}:`, err.message);
        resolve();
      });
    });
  }
}

check();
