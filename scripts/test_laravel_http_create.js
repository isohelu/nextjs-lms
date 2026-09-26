const http = require('http');
const querystring = require('querystring');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function parseCookies(cookieHeaders) {
  const jar = {};
  if (!cookieHeaders) return jar;
  for (const c of cookieHeaders) {
    const parts = c.split(';')[0].split('=');
    jar[parts[0].trim()] = parts.slice(1).join('=');
  }
  return jar;
}

function toCookieHeader(jar) {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function run() {
  const jar = {};
  const r1 = await request({ host: '127.0.0.1', port: 3001, path: '/login', method: 'GET' });
  Object.assign(jar, parseCookies(r1.headers['set-cookie']));
  const xsrf = decodeURIComponent(jar['XSRF-TOKEN']);

  const postData = querystring.stringify({
    email: 'admin@admin.com',
    password: 'password123',
    recaptcha_status: '0',
    remember: 'true'
  });

  const r2 = await request({
    host: '127.0.0.1',
    port: 3001,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': toCookieHeader(jar),
      'X-XSRF-TOKEN': xsrf
    }
  }, postData);
  Object.assign(jar, parseCookies(r2.headers['set-cookie']));

  const r3 = await request({
    host: '127.0.0.1',
    port: 3001,
    path: '/dashboard/courses/create',
    method: 'GET',
    headers: {
      'Cookie': toCookieHeader(jar),
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0'
    }
  });

  const match = r3.body.match(/<script[^>]+type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  if (match) {
    const data = JSON.parse(match[1]);
    console.log('Component:', data.component);
    console.log('Props keys:', Object.keys(data.props));
    console.log('Auth user:', data.props.auth?.user);
    console.log('System:', data.props.system);
    console.log('Labels:', data.props.labels);
    console.log('Prices:', data.props.prices);
    console.log('Expiries:', data.props.expiries);
    console.log('Instructors count:', data.props.instructors?.length);
    console.log('Categories count:', data.props.categories?.length);
    console.log('Plugin statuses:', data.props.pluginStatuses);
    console.log('aiInstructorId:', data.props.aiInstructorId);
  }
}

run().catch(console.error);
