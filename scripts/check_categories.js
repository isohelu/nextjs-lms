const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
const children = db.prepare('SELECT * FROM course_category_children').all();
console.log('Category children:', children);
