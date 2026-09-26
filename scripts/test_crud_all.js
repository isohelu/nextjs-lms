const BASE_URL = 'http://localhost:3000';

async function testAll() {
  console.log('=== STARTING LMS DASHBOARD CRUD & API VERIFICATION ===\n');
  let failures = 0;

  // 1. Course CRUD
  try {
    console.log('1. Testing Course Creation...');
    const createRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Automated Test Course ' + Date.now(),
        short_description: 'Test short description',
        description: '<p>Test rich course description with <strong>bold</strong> text</p>',
        course_category_id: '1',
        level: 'Beginner',
        language: 'English',
        pricing_type: 'paid',
        price: '49',
        discount: true,
        discount_price: '29',
        expiry_type: 'lifetime',
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      })
    });
    const createData = await createRes.json();
    console.log('Create course status:', createRes.status, createData);
    if (!createData.success || !createData.courseId) throw new Error('Course creation failed');
    const courseId = createData.courseId;

    // Verify course in list
    const listRes = await fetch(`${BASE_URL}/api/courses?status=all`);
    const listData = await listRes.json();
    const found = listData.courses?.some(c => c.id === courseId);
    console.log(`Course #${courseId} present in list:`, found);
    if (!found) throw new Error('Course not found in list');

    // Delete course
    const delRes = await fetch(`${BASE_URL}/api/courses/${courseId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete course status:', delRes.status, delData);
    if (!delData.success) throw new Error('Course deletion failed');
    console.log('-> COURSE CRUD: PASSED\n');
  } catch (err) {
    console.error('-> COURSE CRUD FAILED:', err.message);
    failures++;
  }

  // 2. Exam CRUD
  try {
    console.log('2. Testing Exam Creation...');
    const createRes = await fetch(`${BASE_URL}/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Automated Test Exam ' + Date.now(),
        short_description: 'Test exam short description',
        description: '<p>Detailed exam syllabus with <em>italic</em> details</p>',
        exam_category_id: '1',
        level: 'intermediate',
        duration_hours: '2',
        duration_minutes: '30',
        pass_mark: '65',
        max_attempts: '2',
        total_marks: '100',
        pricing_type: 'free',
        price: '0'
      })
    });
    const createData = await createRes.json();
    console.log('Create exam status:', createRes.status, createData);
    if (!createData.success || !createData.examId) throw new Error('Exam creation failed');
    const examId = createData.examId;

    // Verify exam in list
    const listRes = await fetch(`${BASE_URL}/api/exams?status=all`);
    const listData = await listRes.json();
    const found = listData.exams?.some(e => e.id === examId);
    console.log(`Exam #${examId} present in list:`, found);
    if (!found) throw new Error('Exam not found in list');

    // Delete exam
    const delRes = await fetch(`${BASE_URL}/api/exams/${examId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete exam status:', delRes.status, delData);
    if (!delData.success) throw new Error('Exam deletion failed');
    console.log('-> EXAM CRUD: PASSED\n');
  } catch (err) {
    console.error('-> EXAM CRUD FAILED:', err.message);
    failures++;
  }

  // 3. Store Product CRUD
  try {
    console.log('3. Testing Store Product Creation...');
    const createRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Automated Test Product ' + Date.now(),
        summary: 'Digital kit summary',
        description: '<p>Comprehensive source code template with docs</p>',
        product_category_id: '1',
        pricing_type: 'paid',
        price: '39',
        discount: false
      })
    });
    const createData = await createRes.json();
    console.log('Create product status:', createRes.status, createData);
    if (!createData.success || !createData.productId) throw new Error('Product creation failed');
    const productId = createData.productId;

    // Verify product in list
    const listRes = await fetch(`${BASE_URL}/api/products?status=all`);
    const listData = await listRes.json();
    const found = listData.products?.some(p => p.id === productId);
    console.log(`Product #${productId} present in list:`, found);
    if (!found) throw new Error('Product not found in list');

    // Delete product
    const delRes = await fetch(`${BASE_URL}/api/products/${productId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete product status:', delRes.status, delData);
    if (!delData.success) throw new Error('Product deletion failed');
    console.log('-> STORE PRODUCT CRUD: PASSED\n');
  } catch (err) {
    console.error('-> STORE PRODUCT CRUD FAILED:', err.message);
    failures++;
  }

  // 4. Blog CRUD
  try {
    console.log('4. Testing Blog Article Creation...');
    const createRes = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Automated Test Blog ' + Date.now(),
        category_id: '1',
        status: 'published',
        keywords: 'ai, tech',
        description: '<p>Full blog article content with insightful commentary</p>'
      })
    });
    const createData = await createRes.json();
    console.log('Create blog status:', createRes.status, createData);
    if (!createData.success || !createData.id) throw new Error('Blog creation failed');
    const blogId = createData.id;

    // Verify blog in list
    const listRes = await fetch(`${BASE_URL}/api/blogs?status=all`);
    const listData = await listRes.json();
    const found = listData.blogs?.some(b => b.id === blogId);
    console.log(`Blog #${blogId} present in list:`, found);
    if (!found) throw new Error('Blog not found in list');

    // Delete blog
    const delRes = await fetch(`${BASE_URL}/api/blogs/${blogId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete blog status:', delRes.status, delData);
    if (!delData.success) throw new Error('Blog deletion failed');
    console.log('-> BLOG CRUD: PASSED\n');
  } catch (err) {
    console.error('-> BLOG CRUD FAILED:', err.message);
    failures++;
  }

  // 5. Certificate Templates CRUD
  try {
    console.log('5. Testing Certificate Template Creation & Activation...');
    const createRes = await fetch(`${BASE_URL}/api/admin/certificates/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auto Test Certificate ' + Date.now(),
        type: 'course',
        template_data: {
          primaryColor: '#007867',
          secondaryColor: '#1e293b',
          backgroundColor: '#f8fafc',
          titleText: 'Certificate of Distinction'
        },
        is_active: false
      })
    });
    const createData = await createRes.json();
    console.log('Create certificate template status:', createRes.status, createData);
    if (!createData.success || !createData.templateId) throw new Error('Certificate template creation failed');
    const tId = createData.templateId;

    // Activate template
    const actRes = await fetch(`${BASE_URL}/api/admin/certificates/templates/${tId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true })
    });
    const actData = await actRes.json();
    console.log('Activate certificate template status:', actRes.status, actData);
    if (!actData.success) throw new Error('Activate template failed');

    // Delete template
    const delRes = await fetch(`${BASE_URL}/api/admin/certificates/templates/${tId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete certificate template status:', delRes.status, delData);
    if (!delData.success) throw new Error('Delete template failed');
    console.log('-> CERTIFICATE TEMPLATE CRUD: PASSED\n');
  } catch (err) {
    console.error('-> CERTIFICATE TEMPLATE CRUD FAILED:', err.message);
    failures++;
  }

  // 6. Job Circulars CRUD
  try {
    console.log('6. Testing Job Circular Creation...');
    const createRes = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Senior Next.js Engineer ' + Date.now(),
        location: 'Remote',
        job_type: 'full-time',
        work_type: 'remote',
        experience_level: 'senior',
        application_deadline: '2026-12-31',
        contact_email: 'hire@mentorlms.com',
        description: 'Build enterprise Next.js applications',
        skills_required: ['Next.js', 'React', 'TypeScript']
      })
    });
    const createData = await createRes.json();
    console.log('Create job status:', createRes.status, createData);
    const jobId = createData.id || createData.job?.id;
    if (!createData.success || !jobId) throw new Error('Job creation failed');

    // Delete job
    const delRes = await fetch(`${BASE_URL}/api/jobs/${jobId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    console.log('Delete job status:', delRes.status, delData);
    if (!delData.success) throw new Error('Delete job failed');
    console.log('-> JOB CIRCULAR CRUD: PASSED\n');
  } catch (err) {
    console.error('-> JOB CIRCULAR CRUD FAILED:', err.message);
    failures++;
  }

  // 7. Categories API Endpoints Verification
  try {
    console.log('7. Verifying Category Endpoints...');
    const endpoints = [
      '/api/course-categories',
      '/api/exam-categories',
      '/api/product-categories',
      '/api/store-categories',
      '/api/categories/course',
      '/api/categories/exam',
      '/api/categories/product',
      '/api/categories/blog'
    ];
    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (!res.ok) throw new Error(`Endpoint ${ep} returned HTTP ${res.status}`);
      const json = await res.json();
      console.log(`Endpoint ${ep} OK:`, Array.isArray(json) ? `${json.length} items` : `${json.categories?.length || Object.keys(json).length} items`);
    }
    console.log('-> CATEGORIES ENDPOINTS: PASSED\n');
  } catch (err) {
    console.error('-> CATEGORIES ENDPOINTS FAILED:', err.message);
    failures++;
  }

  console.log(`=== TEST RUN FINISHED: ${failures === 0 ? 'ALL PASSED (0 failures)!' : failures + ' failures'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

testAll();
