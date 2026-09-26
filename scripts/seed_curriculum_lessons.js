const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

const courses = db.prepare('SELECT id, title FROM courses').all();
console.log(`Found ${courses.length} courses to check/seed curriculum.`);

const insertSection = db.prepare(`
  INSERT INTO course_sections (title, sort, course_id, created_at, updated_at)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`);

const insertLesson = db.prepare(`
  INSERT INTO section_lessons (
    title, sort, status, lesson_type, lesson_src, lesson_provider,
    embed_source, thumbnail, duration, is_free, description, summary,
    lesson_number, course_id, course_section_id, created_at, updated_at
  ) VALUES (
    ?, ?, 1, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, datetime('now'), datetime('now')
  )
`);

let sectionsCreated = 0;
let lessonsCreated = 0;

for (const course of courses) {
  const existingSection = db.prepare('SELECT id FROM course_sections WHERE course_id = ?').get(course.id);
  if (existingSection) continue;

  // Create Section 1: Introduction & Foundations
  const sec1 = insertSection.run('Module 1: Architecture Overview & Setup', 1, course.id);
  const sec1Id = Number(sec1.lastInsertRowid);
  sectionsCreated++;

  insertLesson.run(
    '01. Course Overview & Prerequisites',
    1,
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'system',
    null,
    null,
    '12:45',
    1,
    'High level breakdown of core topics, dependencies, and environment preparation.',
    'Introduction to architecture.',
    1,
    course.id,
    sec1Id
  );
  lessonsCreated++;

  insertLesson.run(
    '02. Core Theoretical Foundations & Principles',
    2,
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'system',
    null,
    null,
    '18:20',
    0,
    'Deep dive into theoretical concepts, specifications, and modern practices.',
    'Core foundations.',
    2,
    course.id,
    sec1Id
  );
  lessonsCreated++;

  // Create Section 2: Practical Implementation
  const sec2 = insertSection.run('Module 2: Practical Hands-On Implementation', 2, course.id);
  const sec2Id = Number(sec2.lastInsertRowid);
  sectionsCreated++;

  insertLesson.run(
    '03. Building Production Components Step-by-Step',
    1,
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'system',
    null,
    null,
    '24:10',
    0,
    'Hands-on implementation of responsive, scalable enterprise components.',
    'Implementation walkthrough.',
    3,
    course.id,
    sec2Id
  );
  lessonsCreated++;

  insertLesson.run(
    '04. Final Review, Testing & Deployment',
    2,
    'document',
    null,
    'system',
    null,
    null,
    '15:00',
    0,
    'Comprehensive checklist for testing, performance audit, and production deployment.',
    'Deployment guide.',
    4,
    course.id,
    sec2Id
  );
  lessonsCreated++;
}

console.log(`Successfully created ${sectionsCreated} sections and ${lessonsCreated} lessons!`);
