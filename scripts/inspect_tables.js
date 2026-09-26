const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
console.log('certificate_templates columns:', db.prepare("PRAGMA table_info(certificate_templates)").all());
console.log('marksheet_templates columns:', db.prepare("PRAGMA table_info(marksheet_templates)").all());
console.log('newsletters columns:', db.prepare("PRAGMA table_info(newsletters)").all());
console.log('languages count & sample:', db.prepare("SELECT * FROM languages LIMIT 3").all());
console.log('certificate_templates count & sample:', db.prepare("SELECT * FROM certificate_templates LIMIT 3").all());
console.log('marksheet_templates count & sample:', db.prepare("SELECT * FROM marksheet_templates LIMIT 3").all());
