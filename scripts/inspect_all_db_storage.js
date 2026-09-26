const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('=====================================================');
console.log('   AUDITING ALL DATABASE TABLES & STORAGE COVERAGE   ');
console.log('=====================================================\n');

// 1. Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();

const domainCategories = {
  'Users & Authentication': ['users', 'instructors', 'password_reset_tokens', 'personal_access_tokens', 'sessions'],
  'Courses & Learning': [
    'courses', 'course_categories', 'course_sections', 'section_lessons', 'lesson_contents',
    'course_enrollments', 'course_progress', 'watch_histories', 'course_reviews',
    'course_wishlists', 'course_forum_questions', 'course_forum_replies', 'course_live_classes',
    'course_assignments', 'course_assignment_submissions'
  ],
  'Exams & Quizzes': [
    'exams', 'exam_categories', 'exam_questions', 'exam_question_options',
    'exam_enrollments', 'exam_attempts', 'exam_attempt_answers', 'exam_reviews', 'exam_wishlists'
  ],
  'Products & Store': [
    'products', 'product_categories', 'product_files', 'product_specifications',
    'product_faqs', 'product_orders', 'product_reviews', 'product_wishlists'
  ],
  'Certificates & Marksheets': [
    'course_certificates', 'certificate_templates', 'marksheets', 'marksheet_templates'
  ],
  'Finance & Payments': [
    'payment_histories', 'payout_histories', 'withdraw_methods', 'coupons'
  ],
  'Content & Communications': [
    'blogs', 'blog_categories', 'blog_comments', 'jobs', 'notifications',
    'newsletter_subscribers', 'subscribes', 'contact_messages'
  ],
  'Platform & Settings': [
    'settings', 'system_settings', 'languages', 'custom_pages'
  ]
};

const tableRows = {};
let totalRows = 0;

for (const t of tables) {
  try {
    const res = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
    tableRows[t.name] = res.count;
    totalRows += res.count;
  } catch (err) {
    tableRows[t.name] = `ERR: ${err.message}`;
  }
}

console.log(`Total active tables: ${tables.length}`);
console.log(`Total database records across all tables: ${totalRows}\n`);

console.log('--- Domain Breakdown ---');
const categorized = new Set();

for (const [domain, dTables] of Object.entries(domainCategories)) {
  console.log(`\n📂 [${domain}]`);
  for (const dt of dTables) {
    categorized.add(dt);
    const count = tableRows[dt];
    if (count !== undefined) {
      console.log(`  - ${dt.padEnd(32)} : ${String(count).padStart(5)} rows`);
    } else {
      console.log(`  - ${dt.padEnd(32)} : NOT IN SCHEMA`);
    }
  }
}

const uncategorized = tables.filter(t => !categorized.has(t.name));
if (uncategorized.length > 0) {
  console.log(`\n📂 [Other Platform Tables (${uncategorized.length} tables)]`);
  for (const ut of uncategorized) {
    console.log(`  - ${ut.name.padEnd(32)} : ${String(tableRows[ut.name]).padStart(5)} rows`);
  }
}
