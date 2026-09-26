const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

const home2Sections = db.prepare("SELECT id, slug, title, sub_title, description, properties, thumbnail FROM page_sections WHERE page_id = 2 ORDER BY sort ASC").all();
console.log('Home-2 Sections:', JSON.stringify(home2Sections, null, 2));
