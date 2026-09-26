async function testNextJsCourseCreate() {
  console.log('Testing Next.js Login & Course Create Page...');
  
  // 1. POST /api/auth/login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@admin.com', password: 'password123' })
  });

  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Result:', loginData);
  
  const cookies = loginRes.headers.getSetCookie();
  console.log('Cookies received:', cookies);
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  // 2. GET /dashboard/courses/create
  const createPageRes = await fetch('http://localhost:3000/dashboard/courses/create', {
    headers: {
      'Cookie': cookieHeader
    }
  });

  console.log('Create Page Status:', createPageRes.status);
  const html = await createPageRes.text();
  console.log('HTML length:', html.length);
  if (createPageRes.status !== 200) {
    console.log('Error/Redirect preview:', html.slice(0, 500));
  } else {
    console.log('Create page loaded successfully 200 OK!');
  }
}

testNextJsCourseCreate().catch(console.error);
