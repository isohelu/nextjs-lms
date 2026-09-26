const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('=== RUNNING SQLITE DATABASE INTEGRITY & HEALTH CHECKS ===\n');

// 1. PRAGMA integrity_check
console.log('1. Checking Database Integrity...');
const integrity = db.prepare('PRAGMA integrity_check').all();
console.log('Integrity Result:', integrity);

// 2. PRAGMA foreign_key_check
console.log('\n2. Checking Foreign Key Constraints...');
const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
console.log('Foreign Key Violations Count:', fkCheck.length);
if (fkCheck.length > 0) {
  console.log('Violations:', fkCheck.slice(0, 10));
} else {
  console.log('✅ Zero foreign key violations!');
}

// 3. PRAGMA quick_check
console.log('\n3. Running Quick Check...');
const quick = db.prepare('PRAGMA quick_check').all();
console.log('Quick Check Result:', quick);

// 4. Database Pragmas
console.log('\n4. Database Pragmas & Configuration:');
const journalMode = db.prepare('PRAGMA journal_mode').get();
const foreignKeys = db.prepare('PRAGMA foreign_keys').get();
const userVersion = db.prepare('PRAGMA user_version').get();
const pageSize = db.prepare('PRAGMA page_size').get();
const pageCount = db.prepare('PRAGMA page_count').get();
console.log({
  journal_mode: journalMode.journal_mode,
  foreign_keys: foreignKeys.foreign_keys,
  user_version: userVersion.user_version,
  page_size: pageSize.page_size,
  page_count: pageCount.page_count,
  db_size_mb: ((pageSize.page_size * pageCount.page_count) / (1024 * 1024)).toFixed(2) + ' MB'
});

// 5. Table inventory
console.log('\n5. Inspecting All Tables...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
console.log(`Total active tables: ${tables.length}`);
