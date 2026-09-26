const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../prisma/dev.db'));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

console.log('--- DATABASE TABLES & ROW COUNTS ---');
for (const t of tables) {
  if (t.name.startsWith('sqlite_') || t.name.startsWith('_prisma')) continue;
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`${t.name.padEnd(30)}: ${count.c}`);
  } catch (err) {
    console.log(`${t.name.padEnd(30)}: ERROR (${err.message})`);
  }
}
