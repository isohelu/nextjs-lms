const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('================================================================');
console.log('   FULL DATABASE VERIFICATION & STORAGE AUDIT SUITE             ');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// TEST 1: Database Health & Pragmas
// -------------------------------------------------------------
console.log('--- TEST 1: SQLite Health & Integrity Checks ---');
const integrity = db.prepare('PRAGMA integrity_check').all();
assert(integrity.length === 1 && integrity[0].integrity_check === 'ok', 'PRAGMA integrity_check returns "ok"');

const quickCheck = db.prepare('PRAGMA quick_check').all();
assert(quickCheck.length === 1 && quickCheck[0].quick_check === 'ok', 'PRAGMA quick_check returns "ok"');

const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
assert(fkViolations.length === 0, `Zero foreign key violations across all tables (found ${fkViolations.length})`);

const journalMode = db.prepare('PRAGMA journal_mode').get();
assert(journalMode.journal_mode === 'wal', `Write-Ahead Logging (WAL) is active (current: ${journalMode.journal_mode})`);

// -------------------------------------------------------------
// TEST 2: Users & Profiles Persistence
// -------------------------------------------------------------
console.log('\n--- TEST 2: Users, Credentials & Profile Storage ---');
const testEmail = `test_audit_${Date.now()}@example.com`;
const testHash = bcrypt.hashSync('SecurePassword123!', 10);
const now = new Date().toISOString();

// Create user
const userInsert = db.prepare(`
  INSERT INTO users (name, email, password, role, status, photo, social_links, created_at, updated_at)
  VALUES (?, ?, ?, 'student', 1, '/uploads/test.png', '{"github":"https://github.com/test"}', ?, ?)
`).run('Test Auditor', testEmail, testHash, now, now);
const testUserId = Number(userInsert.lastInsertRowid);
assert(testUserId > 0, `User stored in users table (ID: ${testUserId})`);

// Verify read
const readUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
assert(readUser.email === testEmail, 'User record retrieved matching email');
assert(bcrypt.compareSync('SecurePassword123!', readUser.password), 'Password hash verifies successfully via bcrypt');
assert(readUser.social_links.includes('github'), 'User social links persisted as JSON string');

// Update user profile & password
const newHash = bcrypt.hashSync('NewSecurePassword456!', 10);
db.prepare(`
  UPDATE users SET name = ?, password = ?, updated_at = ? WHERE id = ?
`).run('Test Auditor Updated', newHash, new Date().toISOString(), testUserId);

const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
assert(updatedUser.name === 'Test Auditor Updated', 'User name update persisted to database');
assert(bcrypt.compareSync('NewSecurePassword456!', updatedUser.password), 'Updated password hash verified');

// -------------------------------------------------------------
// TEST 3: Instructor Profile & Bio Persistence
// -------------------------------------------------------------
console.log('\n--- TEST 3: Instructor Profile, Bio & Skills Storage ---');
const instInsert = db.prepare(`
  INSERT INTO instructors (skills, biography, resume, designation, status, payout_methods, user_id, created_at, updated_at)
  VALUES (?, ?, '', ?, 'approved', '[]', ?, ?, ?)
`).run(JSON.stringify(['Next.js', 'PostgreSQL', 'AI']), 'Lead Instructor & Systems Architect', 'Senior Engineer', testUserId, now, now);
const testInstId = Number(instInsert.lastInsertRowid);
assert(testInstId > 0, `Instructor profile stored in instructors table (ID: ${testInstId})`);

const readInst = db.prepare('SELECT * FROM instructors WHERE id = ?').get(testInstId);
assert(readInst.designation === 'Senior Engineer', 'Instructor designation persisted');
assert(readInst.skills.includes('Next.js'), 'Instructor skills JSON array persisted');

// -------------------------------------------------------------
// TEST 4: Courses, Curriculum Sections & Lessons Persistence
// -------------------------------------------------------------
console.log('\n--- TEST 4: Courses, Sections & Lessons Storage ---');
const testCourseSlug = `test-course-${Date.now()}`;
const courseInsert = db.prepare(`
  INSERT INTO courses (
    title, slug, course_type, level, price, discount_price, pricing_type, status, instructor_id,
    course_category_id, short_description, description, created_at, updated_at
  ) VALUES (?, ?, 'general', 'All Levels', 49.99, 29.99, 'paid', 'approved', ?, 1, 'Short desc', 'Full description', ?, ?)
`).run('Test LMS Database Course', testCourseSlug, testInstId, now, now);
const testCourseId = Number(courseInsert.lastInsertRowid);
assert(testCourseId > 0, `Course stored in courses table (ID: ${testCourseId})`);

// Create section
const secInsert = db.prepare(`
  INSERT INTO course_sections (title, sort, course_id, created_at, updated_at)
  VALUES ('Module 1: Foundations', 1, ?, ?, ?)
`).run(testCourseId, now, now);
const testSecId = Number(secInsert.lastInsertRowid);
assert(testSecId > 0, `Course section stored in course_sections table (ID: ${testSecId})`);

// Create lessons
const les1 = db.prepare(`
  INSERT INTO section_lessons (
    title, sort, status, lesson_type, lesson_src, duration, is_free,
    lesson_number, course_id, course_section_id, created_at, updated_at
  ) VALUES ('Lesson 1.1: Architecture', 1, 1, 'video', 'https://youtu.be/sample1', '10:00', 1, 1, ?, ?, ?, ?)
`).run(testCourseId, testSecId, now, now);
const testLes1Id = Number(les1.lastInsertRowid);

const les2 = db.prepare(`
  INSERT INTO section_lessons (
    title, sort, status, lesson_type, lesson_src, duration, is_free,
    lesson_number, course_id, course_section_id, created_at, updated_at
  ) VALUES ('Lesson 1.2: Database Persistence', 2, 1, 'video', 'https://youtu.be/sample2', '15:00', 0, 2, ?, ?, ?, ?)
`).run(testCourseId, testSecId, now, now);
const testLes2Id = Number(les2.lastInsertRowid);

assert(testLes1Id > 0 && testLes2Id > 0, 'Section lessons stored in section_lessons table');

// -------------------------------------------------------------
// TEST 5: Enrollment, Watch History & Automated Certification
// -------------------------------------------------------------
console.log('\n--- TEST 5: Enrollment, Progress & Certificate Issuance ---');
// Enroll student
const enroll = db.prepare(`
  INSERT INTO course_enrollments (user_id, course_id, enrollment_type, entry_date, created_at, updated_at)
  VALUES (?, ?, 'paid', ?, ?, ?)
`).run(testUserId, testCourseId, now, now, now);
assert(Number(enroll.lastInsertRowid) > 0, 'Student enrollment recorded in course_enrollments');

// Watch lesson 1
db.prepare(`
  INSERT INTO watch_histories (
    current_section_id, current_watching_id, current_watching_type,
    completed_watching, user_id, course_id, created_at, updated_at
  ) VALUES (?, ?, 'lesson', ?, ?, ?, ?, ?)
`).run(String(testSecId), String(testLes1Id), JSON.stringify([testLes1Id]), testUserId, testCourseId, now, now);

// Complete lesson 2 -> 100% completion
db.prepare(`
  UPDATE watch_histories SET
    completed_watching = ?,
    updated_at = ?
  WHERE user_id = ? AND course_id = ?
`).run(JSON.stringify([testLes1Id, testLes2Id]), now, testUserId, testCourseId);

const watchRow = db.prepare('SELECT completed_watching FROM watch_histories WHERE user_id = ? AND course_id = ?').get(testUserId, testCourseId);
const completedLessons = JSON.parse(watchRow.completed_watching);
assert(completedLessons.length === 2, 'Watch history accurately recorded all completed lessons');

// Progress table upsert
db.prepare(`
  INSERT INTO course_progress (total_lessons, completed_lessons, progress_percentage, user_id, course_id, created_at, updated_at)
  VALUES (2, 2, 100, ?, ?, ?, ?)
`).run(testUserId, testCourseId, now, now);

const progressRow = db.prepare('SELECT progress_percentage FROM course_progress WHERE user_id = ? AND course_id = ?').get(testUserId, testCourseId);
assert(progressRow.progress_percentage === 100, 'Course progress persisted at 100%');

// Certificate issuance
const certCode = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
const certInsert = db.prepare(`
  INSERT INTO course_certificates (identifier, user_id, course_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run(certCode, testUserId, testCourseId, now, now);
assert(Number(certInsert.lastInsertRowid) > 0, `Certificate issued and stored in course_certificates (${certCode})`);

const certQuery = db.prepare(`
  SELECT cc.identifier, c.title, u.name
  FROM course_certificates cc
  JOIN courses c ON cc.course_id = c.id
  JOIN users u ON cc.user_id = u.id
  WHERE cc.identifier = ?
`).get(certCode);
assert(certQuery.identifier === certCode && certQuery.title === 'Test LMS Database Course', 'Certificate verified via relational JOIN query');

// -------------------------------------------------------------
// TEST 6: Exams, Questions, Options & Attempt Grading
// -------------------------------------------------------------
console.log('\n--- TEST 6: Exams, Questions & Attempt Answers Storage ---');
const examSlug = `test-exam-${Date.now()}`;
const examInsert = db.prepare(`
  INSERT INTO exams (
    title, slug, level, duration_hours, duration_minutes, pass_mark, total_marks,
    max_attempts, total_questions, price, discount_price, pricing_type, status,
    short_description, description, instructor_id, exam_category_id, created_at, updated_at
  ) VALUES (?, ?, 'intermediate', 1, 0, 50, 100, 3, 2, 19.99, 14.99, 'paid', 'approved', 'Short', 'Desc', ?, 1, ?, ?)
`).run('Test Database Architecture Exam', examSlug, testInstId, now, now);
const testExamId = Number(examInsert.lastInsertRowid);
assert(testExamId > 0, `Exam stored in exams table (ID: ${testExamId})`);

// Question 1
const q1Insert = db.prepare(`
  INSERT INTO exam_questions (title, description, question_type, marks, sort, exam_id, created_at, updated_at)
  VALUES ('Which SQLite mode enables non-blocking concurrent reads?', 'Database concurrency question', 'single_choice', 50, 1, ?, ?, ?)
`).run(testExamId, now, now);
const testQ1Id = Number(q1Insert.lastInsertRowid);

// Options for Q1
const opt1A = db.prepare(`
  INSERT INTO exam_question_options (option_text, is_correct, sort, exam_question_id, created_at, updated_at)
  VALUES ('WAL Mode (Write-Ahead Logging)', 1, 1, ?, ?, ?)
`).run(testQ1Id, now, now);
const opt1B = db.prepare(`
  INSERT INTO exam_question_options (option_text, is_correct, sort, exam_question_id, created_at, updated_at)
  VALUES ('DELETE Mode', 0, 2, ?, ?, ?)
`).run(testQ1Id, now, now);

assert(Number(opt1A.lastInsertRowid) > 0 && Number(opt1B.lastInsertRowid) > 0, 'Exam question options stored in exam_question_options table');

// Start Exam Attempt
const attemptInsert = db.prepare(`
  INSERT INTO exam_attempts (
    user_id, exam_id, attempt_number, start_time, total_marks, obtained_marks,
    correct_answers, incorrect_answers, is_passed, status, created_at, updated_at
  ) VALUES (?, ?, 1, ?, 100, 0, 0, 0, 0, 'in_progress', ?, ?)
`).run(testUserId, testExamId, now, now, now);
const testAttemptId = Number(attemptInsert.lastInsertRowid);
assert(testAttemptId > 0, `Exam attempt started and stored in exam_attempts (ID: ${testAttemptId})`);

// Record Student Answer
db.prepare(`
  INSERT INTO exam_attempt_answers (
    exam_attempt_id, exam_question_id, answer_data, is_correct, marks_obtained, created_at, updated_at
  ) VALUES (?, ?, ?, 1, 50, ?, ?)
`).run(testAttemptId, testQ1Id, JSON.stringify({ selectedOptionId: Number(opt1A.lastInsertRowid) }), now, now);

// Submit and grade attempt
db.prepare(`
  UPDATE exam_attempts SET
    end_time = ?,
    obtained_marks = 50,
    correct_answers = 1,
    incorrect_answers = 0,
    is_passed = 1,
    status = 'completed',
    updated_at = ?
  WHERE id = ?
`).run(now, now, testAttemptId);

const gradedAttempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(testAttemptId);
assert(gradedAttempt.status === 'completed' && gradedAttempt.is_passed === 1, 'Exam attempt graded, passed, and persisted in SQLite');

// -------------------------------------------------------------
// TEST 7: Digital Products & Product Orders
// -------------------------------------------------------------
console.log('\n--- TEST 7: Digital Products, Specs & Orders Storage ---');
const prodSlug = `test-prod-${Date.now()}`;
const prodInsert = db.prepare(`
  INSERT INTO products (
    title, slug, price, discount_price, pricing_type, inventory, unlimited_inventory,
    status, instructor_id, product_category_id, summary, description, created_at, updated_at
  ) VALUES (?, ?, 15.00, 10.00, 'paid', 10, 0, 'approved', ?, 1, 'Short summary', 'Long description', ?, ?)
`).run('Test Digital Asset Kit', prodSlug, testInstId, now, now);
const testProdId = Number(prodInsert.lastInsertRowid);
assert(testProdId > 0, `Digital product stored in products table (ID: ${testProdId})`);

// Specifications
const specInsert = db.prepare(`
  INSERT INTO product_specifications (title, value, product_id, created_at, updated_at)
  VALUES ('Compatibility', 'Next.js 15 & Node.js 22+', ?, ?, ?)
`).run(testProdId, now, now);
assert(Number(specInsert.lastInsertRowid) > 0, 'Product specification stored in product_specifications table');

// Product Order
const orderInsert = db.prepare(`
  INSERT INTO product_orders (
    quantity, unit_price, subtotal, discount, tax, total, user_id, product_id, instructor_id, created_at, updated_at
  ) VALUES (1, 10.00, 10.00, 0, 0, 10.00, ?, ?, ?, ?, ?)
`).run(testUserId, testProdId, testInstId, now, now);
assert(Number(orderInsert.lastInsertRowid) > 0, 'Product order stored in product_orders table');

// Decrement inventory
db.prepare('UPDATE products SET inventory = MAX(0, inventory - 1) WHERE id = ?').run(testProdId);
const updatedProd = db.prepare('SELECT inventory FROM products WHERE id = ?').get(testProdId);
assert(updatedProd.inventory === 9, 'Product inventory decremented and saved in products table');

// -------------------------------------------------------------
// TEST 8: Reviews & Wishlists Storage
// -------------------------------------------------------------
console.log('\n--- TEST 8: Reviews & Wishlist Storage ---');
// Course Review
const reviewInsert = db.prepare(`
  INSERT INTO course_reviews (user_id, course_id, rating, review, likes, dislikes, created_at, updated_at)
  VALUES (?, ?, 5, 'Outstanding course with rigorous database structure!', '[]', '[]', ?, ?)
`).run(testUserId, testCourseId, now, now);
assert(Number(reviewInsert.lastInsertRowid) > 0, 'Course review stored in course_reviews table');

// Wishlist
const wishInsert = db.prepare(`
  INSERT INTO course_wishlists (user_id, course_id, created_at, updated_at)
  VALUES (?, ?, ?, ?)
`).run(testUserId, testCourseId, now, now);
assert(Number(wishInsert.lastInsertRowid) > 0, 'Course wishlisted in course_wishlists table');

// -------------------------------------------------------------
// TEST 9: Blogs & Blog Comments Storage
// -------------------------------------------------------------
console.log('\n--- TEST 9: Blogs & Blog Comments Storage ---');
const blogSlug = `test-blog-${Date.now()}`;
const blogInsert = db.prepare(`
  INSERT INTO blogs (uuid, user_id, title, slug, description, blog_category_id, status, created_at, updated_at)
  VALUES (?, ?, 'Next.js 15 Database Architecture', ?, 'Deep dive into SQLite persistence', 1, 'published', ?, ?)
`).run('uuid-' + Date.now(), testUserId, blogSlug, now, now);
const testBlogId = Number(blogInsert.lastInsertRowid);
assert(testBlogId > 0, `Blog post stored in blogs table (ID: ${testBlogId})`);

const commentInsert = db.prepare(`
  INSERT INTO blog_comments (content, blog_id, user_id, created_at, updated_at)
  VALUES ('Terrific engineering overview!', ?, ?, ?, ?)
`).run(testBlogId, testUserId, now, now);
assert(Number(commentInsert.lastInsertRowid) > 0, 'Blog comment stored in blog_comments table');

// -------------------------------------------------------------
// TEST 10: Payments, Payouts & System Settings Storage
// -------------------------------------------------------------
console.log('\n--- TEST 10: Payments, Payouts & Settings Storage ---');
const payInsert = db.prepare(`
  INSERT INTO payment_histories (
    payment_type, amount, admin_revenue, instructor_revenue, tax,
    invoice, transaction_id, user_id, course_id, purchase_type, purchase_id, meta, created_at, updated_at
  ) VALUES (
    'stripe', 29.99, 5.99, 24.00, 1.50,
    ?, ?, ?, ?, 'course', ?, '{"status":"completed"}', ?, ?
  )
`).run('INV-AUDIT-' + Date.now(), 'TXN-AUDIT-' + Date.now(), testUserId, testCourseId, testCourseId, now, now);
assert(Number(payInsert.lastInsertRowid) > 0, 'Payment recorded in payment_histories table');

const payoutInsert = db.prepare(`
  INSERT INTO payout_histories (payout_method, amount, status, user_id, created_at, updated_at)
  VALUES ('paypal', 50.00, 'pending', ?, ?, ?)
`).run(testUserId, now, now);
assert(Number(payoutInsert.lastInsertRowid) > 0, 'Instructor payout withdrawal stored in payout_histories table');

// Settings upsert
const settingKey = 'audit_test_config_' + Date.now();
db.prepare(`
  INSERT INTO settings (type, sub_type, title, fields, created_at, updated_at)
  VALUES ('system', 'audit', 'Audit Test Config', ?, ?, ?)
`).run(JSON.stringify({ database_verified: true, tested_at: now }), now, now);

const readSetting = db.prepare("SELECT fields FROM settings WHERE type = 'system' AND sub_type = 'audit'").get();
assert(readSetting && JSON.parse(readSetting.fields).database_verified === true, 'Platform settings JSON persisted and read from settings table');

// Newsletter subscription
const subInsert = db.prepare(`
  INSERT INTO subscribes (email, created_at, updated_at)
  VALUES (?, ?, ?)
`).run(`subscriber_${Date.now()}@test.com`, now, now);
assert(Number(subInsert.lastInsertRowid) > 0, 'Newsletter subscriber stored in subscribes table');

// -------------------------------------------------------------
// CLEANUP TEST FIXTURES
// -------------------------------------------------------------
console.log('\n--- Cleaning Up Temporary Test Fixtures ---');
const delTx = db.transaction(() => {
  db.prepare('DELETE FROM subscribes WHERE email LIKE ?').run('subscriber_%@test.com');
  db.prepare("DELETE FROM settings WHERE sub_type = 'audit'").run();
  db.prepare('DELETE FROM payout_histories WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM payment_histories WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM blog_comments WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM blogs WHERE id = ?').run(testBlogId);
  db.prepare('DELETE FROM course_wishlists WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM course_reviews WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM product_orders WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM product_specifications WHERE product_id = ?').run(testProdId);
  db.prepare('DELETE FROM products WHERE id = ?').run(testProdId);
  db.prepare('DELETE FROM exam_attempt_answers WHERE exam_attempt_id = ?').run(testAttemptId);
  db.prepare('DELETE FROM exam_attempts WHERE id = ?').run(testAttemptId);
  db.prepare('DELETE FROM exam_question_options WHERE exam_question_id = ?').run(testQ1Id);
  db.prepare('DELETE FROM exam_questions WHERE id = ?').run(testQ1Id);
  db.prepare('DELETE FROM exams WHERE id = ?').run(testExamId);
  db.prepare('DELETE FROM course_certificates WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM course_progress WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM watch_histories WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM course_enrollments WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM section_lessons WHERE course_id = ?').run(testCourseId);
  db.prepare('DELETE FROM course_sections WHERE course_id = ?').run(testCourseId);
  db.prepare('DELETE FROM courses WHERE id = ?').run(testCourseId);
  db.prepare('DELETE FROM instructors WHERE user_id = ?').run(testUserId);
  db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
});
delTx();
console.log('✅ All temporary test records safely rolled back/cleaned up.');

// Final Integrity Check after cleanup
const postCheck = db.prepare('PRAGMA integrity_check').all();
assert(postCheck[0].integrity_check === 'ok', 'Post-test database integrity remains "ok"');

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
