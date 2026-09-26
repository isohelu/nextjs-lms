const fs = require('fs');
const path = require('path');

const controllersAuditPath = path.join(__dirname, 'laravel_controllers_audit.json');
const laravelControllers = JSON.parse(fs.readFileSync(controllersAuditPath, 'utf8'));

console.log('================================================================');
console.log('   DEEP BACKEND PARITY AUDIT: LARAVEL vs NEXT.JS 15 FULL-STACK');
console.log('================================================================');
console.log(`Total Laravel Controllers Analyzed: ${Object.keys(laravelControllers).length}`);

// Inspect all API route directories and handlers in Next.js
const apiDir = path.resolve(__dirname, '../src/app/api');
function getAllRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllRouteFiles(fullPath));
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      results.push(fullPath);
    }
  }
  return results;
}

const nextApiRoutes = getAllRouteFiles(apiDir).map(f => {
  const rel = path.relative(apiDir, f);
  const routeUri = '/api/' + path.dirname(rel).replace(/\\/g, '/');
  const content = fs.readFileSync(f, 'utf8');
  const methods = [];
  if (/export\s+async\s+function\s+GET/i.test(content) || /export\s+function\s+GET/i.test(content)) methods.push('GET');
  if (/export\s+async\s+function\s+POST/i.test(content) || /export\s+function\s+POST/i.test(content)) methods.push('POST');
  if (/export\s+async\s+function\s+PUT/i.test(content) || /export\s+function\s+PUT/i.test(content)) methods.push('PUT');
  if (/export\s+async\s+function\s+PATCH/i.test(content) || /export\s+function\s+PATCH/i.test(content)) methods.push('PATCH');
  if (/export\s+async\s+function\s+DELETE/i.test(content) || /export\s+function\s+DELETE/i.test(content)) methods.push('DELETE');
  return { file: rel, uri: routeUri, methods };
});

console.log(`Total Next.js API Route Handlers: ${nextApiRoutes.length}`);

// Inspect Repositories in Next.js
const repoDir = path.resolve(__dirname, '../src/lib/repositories');
const repoFiles = fs.readdirSync(repoDir).filter(f => f.endsWith('.ts'));
const repositories = {};
repoFiles.forEach(f => {
  const content = fs.readFileSync(path.join(repoDir, f), 'utf8');
  const repoName = f.replace('.ts', '');
  const functions = [];
  const regex = /([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?::\s*[^\{]+)?\s*\{/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
      functions.push(match[1]);
    }
  }
  repositories[repoName] = functions;
});

console.log(`Total Repositories: ${repoFiles.length}`);
for (const [repo, fns] of Object.entries(repositories)) {
  console.log(` - ${repo}: ${fns.length} methods (${fns.slice(0, 5).join(', ')}...)`);
}

// Categorize all 101 controllers into domains
const domainMap = {
  Public_Auth: [],
  Student: [],
  Instructor: [],
  Admin_System: [],
  Payment_Gateways: []
};

for (const [ctrl, routes] of Object.entries(laravelControllers)) {
  const c = ctrl.toLowerCase();
  if (c.includes('payment') || c.includes('payout')) {
    domainMap.Payment_Gateways.push({ ctrl, routes });
  } else if (c.includes('admin') || c.includes('setting') || c.includes('system') || c.includes('backup') || c.includes('updater') || c.includes('installer') || c.includes('plugin') || c.includes('language') || c.includes('userscontroller') || c.includes('templat')) {
    domainMap.Admin_System.push({ ctrl, routes });
  } else if (c.includes('student') || c.includes('player') || c.includes('attempt') || c.includes('wishlist') || c.includes('review') || c.includes('enrollment') || c.includes('submission') || c.includes('forum') || c.includes('order')) {
    domainMap.Student.push({ ctrl, routes });
  } else if (c.includes('instructor') || c.includes('curriculum') || c.includes('bunny') || c.includes('chunk') || c.includes('coupon') || c.includes('faq') || c.includes('outcome') || c.includes('requirement') || c.includes('resource') || c.includes('question') || c.includes('quiz') || c.includes('specification') || c.includes('file')) {
    domainMap.Instructor.push({ ctrl, routes });
  } else {
    domainMap.Public_Auth.push({ ctrl, routes });
  }
}

console.log('\n================================================================');
console.log('   DOMAIN CATEGORIZATION OF ALL 101 LARAVEL CONTROLLERS');
console.log('================================================================');
for (const [domain, list] of Object.entries(domainMap)) {
  console.log(`\n### ${domain.toUpperCase()} (${list.length} Controllers)`);
  list.forEach(item => {
    console.log(` * ${item.ctrl} (${item.routes.length} actions)`);
  });
}

// Next, verify mapping coverage
console.log('\n================================================================');
console.log('   NEXT.JS API ROUTE MATRIX');
console.log('================================================================');
nextApiRoutes.sort((a, b) => a.uri.localeCompare(b.uri)).forEach(r => {
  console.log(`[${r.methods.join(',')}] ${r.uri}`);
});
