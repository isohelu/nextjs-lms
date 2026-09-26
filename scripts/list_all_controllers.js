const fs = require('fs');
const path = require('path');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'laravel_controllers_audit.json'), 'utf8'));

console.log('All Laravel Controllers List (Count: ' + Object.keys(audit).length + '):');
for (const [ctrl, endpoints] of Object.entries(audit)) {
  console.log(`- ${ctrl}: ${endpoints.length} routes`);
}
