const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables count:', tables.length);

const targetTables = [
  'exams', 'exam_categories', 'exam_questions', 'exam_question_options', 'exam_enrollments', 'exam_attempts', 'exam_attempt_answers', 'exam_reviews', 'exam_wishlists',
  'products', 'product_categories', 'product_orders', 'product_files', 'product_reviews', 'product_wishlists', 'product_faqs', 'product_specifications',
  'settings', 'subscribes', 'contact_messages', 'course_enrollments', 'course_progresses', 'watch_histories', 'course_sections', 'course_lessons', 'course_quizzes', 'course_reviews', 'course_wishlists'
];

for (const t of targetTables) {
  const exists = tables.some(x => x.name === t);
  if (exists) {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => `${c.name} (${c.type})`);
    console.log(`\nTable [${t}]:`);
    console.log('  ', cols.join(', '));
  } else {
    console.log(`\nTable [${t}] NOT FOUND`);
  }
}
