const db = require('better-sqlite3')('prisma/dev.db');

console.log('--- EXAM & PRODUCT TABLES IN DEV.DB ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
const relevant = tables.filter(t => t.name.includes('exam') || t.name.includes('product') || t.name.includes('order'));
console.log(relevant.map(t => t.name));

console.log('\n--- QUESTIONS COUNT ---');
try {
  console.log('exam_questions:', db.prepare('SELECT count(*) as c FROM exam_questions').get());
  console.log('exam_question_options:', db.prepare('SELECT count(*) as c FROM exam_question_options').get());
} catch(e) { console.log(e.message); }

console.log('\n--- PRODUCT SPECS & FAQS COUNT ---');
try {
  console.log('product_specifications:', db.prepare('SELECT count(*) as c FROM product_specifications').get());
  console.log('product_faqs:', db.prepare('SELECT count(*) as c FROM product_faqs').get());
} catch(e) { console.log(e.message); }
