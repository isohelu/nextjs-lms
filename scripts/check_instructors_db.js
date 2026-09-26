const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
const instructors = db.prepare(`
  SELECT i.id, i.user_id, u.name, u.email 
  FROM instructors i 
  JOIN users u ON i.user_id = u.id 
  WHERE i.status = 'approved'
`).all();
console.log('Approved instructors in Next.js dev.db:', instructors);
