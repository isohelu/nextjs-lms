const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';

function getAdminCookie() {
  const payload = {
    id: 1,
    name: 'Administrator',
    email: 'admin@mentor.com',
    role: 'admin',
    photo: null
  };
  const SECRET_KEY = process.env.AUTH_SECRET || 'mentor-lms-super-secure-production-key-2026';
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `mentor_session=${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

const adminCookie = getAdminCookie();

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Cookie': adminCookie,
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING FULL END-TO-END VERIFICATION: EXAM & STORE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
      failed++;
    }
  }

  // 1. List Exams
  console.log('--- 1. Testing Exams List API ---');
  const examsList = await request('/api/exams?status=all&limit=50');
  assert(examsList.ok && examsList.data.success, 'GET /api/exams returns success', JSON.stringify(examsList.data));
  assert(Array.isArray(examsList.data.exams) && examsList.data.exams.length > 0, `Exams count is positive: ${examsList.data?.exams?.length}`);

  // 2. Fetch Single Exam
  console.log('\n--- 2. Testing Single Exam Fetch ---');
  const examId = examsList.data.exams[0].id;
  const singleExam = await request(`/api/exams/${examId}`);
  assert(singleExam.ok && singleExam.data.success, `GET /api/exams/${examId} returns success`);
  assert(singleExam.data.exam && singleExam.data.exam.id === examId, `Fetched correct exam ID: ${examId}`);

  // 3. Update Exam across all tabs (Settings, Pricing, Info [FAQs, Req, Outcomes], Resources, SEO)
  console.log('\n--- 3. Testing Exam Comprehensive Update (All 8 Tabs) ---');
  const updatePayload = {
    ...singleExam.data.exam,
    title: 'AWS Certified Solutions Architect Associate (E2E Verified)',
    duration_hours: 2,
    duration_minutes: 30,
    pass_mark: 75,
    total_marks: 120,
    max_attempts: 4,
    expiry_type: 'limited_time',
    expiry_duration: '90',
    pricing_type: 'paid',
    price: 49.99,
    discount: true,
    discount_price: 29.99,
    resources: [
      { title: 'Official Exam Blueprint', resource: 'https://aws.amazon.com/certification/', type: 'link' },
      { title: 'Architect Cheat Sheet PDF', resource: '/uploads/resources/aws-cheat-sheet.pdf', type: 'file' }
    ],
    faqs: [
      { question: 'What is the passing score?', answer: 'Passing score is 75% or 750/1000.' },
      { question: 'Are retakes allowed?', answer: 'Yes, up to 4 retakes are permitted.' }
    ],
    requirements: [
      { requirement: 'Basic knowledge of cloud computing architecture' },
      { requirement: 'Familiarity with VPC and security groups' }
    ],
    outcomes: [
      { outcome: 'Design resilient and scalable AWS cloud solutions' },
      { outcome: 'Prepare thoroughly for the official AWS SAA exam' }
    ],
    meta_title: 'AWS SAA-C03 Comprehensive Practice Exam',
    meta_keywords: 'aws, certifications, practice exam, cloud architect',
    meta_description: 'High yield practice questions for AWS Solutions Architect Associate.',
    og_title: 'Pass AWS SAA-C03 First Attempt',
    og_description: 'Real exam simulation with detailed question explanations.'
  };

  const updateRes = await request(`/api/exams/${examId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });
  assert(updateRes.ok && updateRes.data.success, `PUT /api/exams/${examId} successfully updated exam`);

  // 4. Verify Exam Persistence
  console.log('\n--- 4. Verifying Exam Persistence & Relation Sync ---');
  const verifyExam = await request(`/api/exams/${examId}`);
  assert(verifyExam.data.exam.title === 'AWS Certified Solutions Architect Associate (E2E Verified)', 'Exam title correctly persisted');
  assert(verifyExam.data.exam.duration_hours === 2, 'Duration hours persisted (2)');
  assert(verifyExam.data.exam.duration_minutes === 30, 'Duration minutes persisted (30)');
  assert(verifyExam.data.exam.pass_mark === 75, 'Pass mark persisted (75)');
  assert(verifyExam.data.exam.total_marks === 120, 'Total marks persisted (120)');
  assert(verifyExam.data.exam.max_attempts === 4, 'Max attempts persisted (4)');
  assert(verifyExam.data.exam.expiry_type === 'limited_time', 'Expiry type persisted (limited_time)');
  assert(verifyExam.data.exam.expiry_duration === '90', 'Expiry duration persisted (90)');
  assert(Array.isArray(verifyExam.data.exam.resources) && verifyExam.data.exam.resources.length === 2, `Resources synced: ${verifyExam.data.exam.resources?.length} items`);
  assert(Array.isArray(verifyExam.data.exam.faqs) && verifyExam.data.exam.faqs.length === 2, `FAQs synced: ${verifyExam.data.exam.faqs?.length} items`);
  assert(Array.isArray(verifyExam.data.exam.requirements) && verifyExam.data.exam.requirements.length === 2, `Requirements synced: ${verifyExam.data.exam.requirements?.length} items`);
  assert(Array.isArray(verifyExam.data.exam.outcomes) && verifyExam.data.exam.outcomes.length === 2, `Outcomes synced: ${verifyExam.data.exam.outcomes?.length} items`);
  assert(verifyExam.data.exam.og_title === 'Pass AWS SAA-C03 First Attempt', 'OG Title persisted');

  // 5. Test Exam Questions (Add, Update, Delete)
  console.log('\n--- 5. Testing Exam Questions CRUD ---');
  const addQRes = await request(`/api/instructor/exams/${examId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Which AWS service is designed for serverless container workloads?',
      question_type: 'multiple_choice',
      marks: 10,
      options: [
        { option_text: 'AWS Fargate', is_correct: true },
        { option_text: 'Amazon EC2', is_correct: false },
        { option_text: 'AWS Snowball', is_correct: false },
        { option_text: 'Amazon RDS', is_correct: false }
      ]
    })
  });
  assert(addQRes.ok && addQRes.data.success, `Question added to exam (ID: ${addQRes.data?.questionId})`, JSON.stringify(addQRes.data));
  const newQId = addQRes.data?.questionId;

  if (newQId) {
    // Verify question is loaded in exam
    const examWithQ = await request(`/api/exams/${examId}`);
    const foundQ = examWithQ.data.exam.questions?.find(q => q.id === newQId);
    assert(!!foundQ, `Newly created question ${newQId} found in exam questions list`);
    assert(foundQ && foundQ.options?.length === 4, `Question has 4 choices`);

    // Delete question to maintain clean state
    const delQRes = await request(`/api/instructor/exams/${examId}/questions/${newQId}`, {
      method: 'DELETE'
    });
    assert(delQRes.ok && delQRes.data.success, `Question ${newQId} cleaned up successfully`);
  }

  // 6. List Products
  console.log('\n--- 6. Testing Store Products List API ---');
  const productsList = await request('/api/products?status=all&limit=50');
  assert(productsList.ok && productsList.data.success, 'GET /api/products returns success', JSON.stringify(productsList.data));
  assert(Array.isArray(productsList.data.products) && productsList.data.products.length > 0, `Products count is positive: ${productsList.data?.products?.length}`);

  // 7. Fetch Single Product
  console.log('\n--- 7. Testing Single Product Fetch ---');
  const prodId = productsList.data.products[0].id;
  const singleProd = await request(`/api/products/${prodId}`);
  assert(singleProd.ok && singleProd.data.success, `GET /api/products/${prodId} returns success`);
  assert(singleProd.data.product && singleProd.data.product.id === prodId, `Fetched correct product ID: ${prodId}`);

  // 8. Update Product (Basic & Pricing)
  console.log('\n--- 8. Testing Product Update (Basic & Pricing) ---');
  const prodUpdatePayload = {
    ...singleProd.data.product,
    title: 'Enterprise LMS Source Code Bundle (E2E Verified)',
    summary: 'Complete high-performance learning management system codebase.',
    pricing_type: 'paid',
    price: 89.00,
    discount: true,
    discount_price: 69.00,
    inventory: 100,
    unlimited_inventory: false,
    meta_title: 'Enterprise LMS Source Code Kit',
    meta_description: 'Full stack Next.js and Node.js LMS starter kit.'
  };

  const prodUpdateRes = await request(`/api/products/${prodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prodUpdatePayload)
  });
  assert(prodUpdateRes.ok && prodUpdateRes.data.success, `PUT /api/products/${prodId} updated product`);

  // 9. Add Specification to Product
  console.log('\n--- 9. Testing Product Specification Creation ---');
  const addSpecRes = await request(`/api/products/${prodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      specification_action: 'add',
      title: 'Framework Support',
      value: 'Next.js 15, React 19, Tailwind CSS v4'
    })
  });
  assert(addSpecRes.ok && addSpecRes.data.success, 'Added specification to product');

  // 10. Add FAQ to Product
  console.log('\n--- 10. Testing Product FAQ Creation ---');
  const addFaqRes = await request(`/api/products/${prodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      faq_action: 'add',
      question: 'Do I get free future updates?',
      answer: 'Yes, all future minor and patch releases are included with your license.'
    })
  });
  assert(addFaqRes.ok && addFaqRes.data.success, 'Added FAQ to product');

  // 11. Verify Product Relations & Persistence
  console.log('\n--- 11. Verifying Product Persistence & Relations ---');
  const verifyProd = await request(`/api/products/${prodId}`);
  assert(verifyProd.data.product.title === 'Enterprise LMS Source Code Bundle (E2E Verified)', 'Product title correctly updated');
  assert(verifyProd.data.product.price === 89, 'Product price updated ($89)');
  assert(verifyProd.data.product.discount_price === 69, 'Product discount price updated ($69)');
  assert(Array.isArray(verifyProd.data.product.specifications) && verifyProd.data.product.specifications.length > 0, `Product specifications present: ${verifyProd.data.product.specifications?.length}`);
  assert(Array.isArray(verifyProd.data.product.faqs) && verifyProd.data.product.faqs.length > 0, `Product FAQs present: ${verifyProd.data.product.faqs?.length}`);

  // 12. Category Endpoints
  console.log('\n--- 12. Testing Category Endpoints ---');
  const examCats = await request('/api/categories/exam');
  assert(examCats.ok && Array.isArray(examCats.data.categories) && examCats.data.categories.length > 0, `GET /api/categories/exam returns ${examCats.data?.categories?.length} categories`);

  const prodCats = await request('/api/categories/product');
  assert(prodCats.ok && Array.isArray(prodCats.data.categories) && prodCats.data.categories.length > 0, `GET /api/categories/product returns ${prodCats.data?.categories?.length} categories`);

  const storeCats = await request('/api/store-categories');
  assert(storeCats.ok && Array.isArray(storeCats.data), `GET /api/store-categories returns ${storeCats.data?.length} categories`);

  const examCatsAlias = await request('/api/exam-categories');
  assert(examCatsAlias.ok && Array.isArray(examCatsAlias.data), `GET /api/exam-categories returns ${examCatsAlias.data?.length} categories`);

  // 13. Submenu Endpoints (Coupons, Enrollments, Sales)
  console.log('\n--- 13. Testing Submenu Endpoints ---');
  const enrollmentsRes = await request('/api/admin/enrollments/exams');
  assert(enrollmentsRes.ok && enrollmentsRes.data.success, 'GET /api/admin/enrollments/exams returns success');

  const salesRes = await request('/api/instructor/sales');
  assert(salesRes.ok && salesRes.data.success, 'GET /api/instructor/sales returns analytics');

  const couponsRes = await request('/api/instructor/coupons');
  assert(couponsRes.ok && couponsRes.data.success, 'GET /api/instructor/coupons returns success');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
