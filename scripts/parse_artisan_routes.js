const fs = require('fs');
const path = require('path');

const logFile = path.resolve('C:/Users/mehed/.gemini/antigravity-ide/brain/408a155a-a66f-4807-9105-7bb6b779fe6d/.system_generated/tasks/task-5025.log');
const raw = fs.readFileSync(logFile, 'utf8');

let routes = [];
try {
  routes = JSON.parse(raw);
} catch (e) {
  // If there is preamble text before JSON array, find first '['
  const startIdx = raw.indexOf('[');
  const endIdx = raw.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1) {
    routes = JSON.parse(raw.substring(startIdx, endIdx + 1));
  }
}

console.log('Total registered routes in Laravel:', routes.length);

// Extract distinct controllers and actions
const controllerMap = {};
routes.forEach(r => {
  const action = r.action || 'Closure';
  if (action.includes('@')) {
    const [ctrl, method] = action.split('@');
    if (!controllerMap[ctrl]) controllerMap[ctrl] = [];
    controllerMap[ctrl].push({ method, uri: r.uri, httpMethod: r.method, name: r.name });
  }
});

const controllers = Object.keys(controllerMap);
console.log('Total distinct controllers:', controllers.length);

console.log('\n--- LARAVEL CONTROLLERS AUDIT ---');
for (const [ctrl, methods] of Object.entries(controllerMap)) {
  console.log(`\n${ctrl} (${methods.length} endpoints):`);
  methods.forEach(m => {
    console.log(`   [${m.httpMethod}] ${m.uri} -> ${m.method} (${m.name || 'unnamed'})`);
  });
}

// Save to file for further inspection
fs.writeFileSync(
  path.join(__dirname, 'laravel_controllers_audit.json'),
  JSON.stringify(controllerMap, null, 2)
);
