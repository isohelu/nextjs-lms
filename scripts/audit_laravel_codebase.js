const fs = require('fs');
const path = require('path');

const laravelDir = path.resolve(__dirname, '../../mentor-lms-learning-management-system');

// Find all route files
const routeFiles = [
  path.join(laravelDir, 'routes/web.php'),
  path.join(laravelDir, 'routes/auth.php'),
  path.join(laravelDir, 'routes/admin.php'),
  path.join(laravelDir, 'routes/instructor.php'),
  path.join(laravelDir, 'routes/student.php'),
  path.join(laravelDir, 'routes/plugin.php'),
];

// Add Modules route files
const modulesDir = path.join(laravelDir, 'Modules');
if (fs.existsSync(modulesDir)) {
  const modules = fs.readdirSync(modulesDir);
  for (const m of modules) {
    const modRoutes = path.join(modulesDir, m, 'routes');
    if (fs.existsSync(modRoutes)) {
      const files = fs.readdirSync(modRoutes);
      for (const f of files) {
        if (f.endsWith('.php')) {
          routeFiles.push(path.join(modRoutes, f));
        }
      }
    }
  }
}

console.log('Total route files found in Laravel:', routeFiles.length);

const allRoutes = [];

for (const rf of routeFiles) {
  if (!fs.existsSync(rf)) continue;
  const content = fs.readFileSync(rf, 'utf8');
  const relPath = path.relative(laravelDir, rf);
  
  // Match Route::get/post/put/patch/delete/resource/apiResource
  const regex = /Route::(get|post|put|patch|delete|match|resource|apiResource)\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\[[^\]]+\]|'[^']+'|"[^"]+"|[a-zA-Z0-9_\\]+::class)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    allRoutes.push({
      file: relPath,
      method: match[1],
      uri: match[2],
      action: match[3].replace(/\s+/g, ' ')
    });
  }
}

console.log('Total explicit routes parsed:', allRoutes.length);

// Group by domain/prefix
const groups = {
  auth: [],
  admin: [],
  instructor: [],
  student: [],
  course: [],
  exam: [],
  store: [],
  blog: [],
  billing: [],
  public: []
};

for (const r of allRoutes) {
  const fileLow = r.file.toLowerCase();
  const uriLow = r.uri.toLowerCase();
  if (fileLow.includes('auth') || uriLow.includes('login') || uriLow.includes('register')) {
    groups.auth.push(r);
  } else if (fileLow.includes('admin') || uriLow.startsWith('admin')) {
    groups.admin.push(r);
  } else if (fileLow.includes('instructor') || uriLow.startsWith('instructor')) {
    groups.instructor.push(r);
  } else if (fileLow.includes('student') || uriLow.startsWith('student')) {
    groups.student.push(r);
  } else if (fileLow.includes('course')) {
    groups.course.push(r);
  } else if (fileLow.includes('exam')) {
    groups.exam.push(r);
  } else if (fileLow.includes('store')) {
    groups.store.push(r);
  } else if (fileLow.includes('blog')) {
    groups.blog.push(r);
  } else if (fileLow.includes('billing')) {
    groups.billing.push(r);
  } else {
    groups.public.push(r);
  }
}

console.log('\n--- ROUTE DISTRIBUTION IN LARAVEL ---');
for (const [group, list] of Object.entries(groups)) {
  console.log(`- ${group}: ${list.length} routes`);
}

// Dump detailed routes into JSON for precise checking
fs.writeFileSync(
  path.join(__dirname, 'laravel_routes_audit.json'),
  JSON.stringify({ total: allRoutes.length, groups, allRoutes }, null, 2)
);
console.log('\nSaved full audit to scripts/laravel_routes_audit.json');
