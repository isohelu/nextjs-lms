const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../prisma/dev.db'));

const tables = [
  'course_enrollments',
  'watch_histories',
  'course_certificates',
  'course_coupons',
  'course_reviews',
  'exams',
  'exam_enrollments',
  'exam_attempts',
  'exam_coupons',
  'products',
  'product_orders',
  'product_coupons',
  'blogs',
  'blog_comments',
  'payment_histories',
  'payout_histories',
  'course_wishlists',
  'exam_wishlists',
  'product_wishlists',
  'subscribes',
  'newsletters'
];

for (const t of tables) {
  try {
    const cols = db.prepare(`PRAGMA table_info("${t}")`).all();
    console.log(`\n=== Table: ${t} ===`);
    console.log(cols.map(c => `${c.name} (${c.type}${c.notnull ? ' NOT NULL' : ''}${c.dflt_value ? ` DEFAULT ${c.dflt_value}` : ''})`).join(', '));
  } catch (err) {
    console.log(`Table ${t} error: ${err.message}`);
  }
}
