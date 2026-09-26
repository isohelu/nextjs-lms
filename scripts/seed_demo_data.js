const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, '../prisma/dev.db'));

console.log('=== STARTING RICH DEMO DATA SEEDING ===\n');

db.transaction(() => {
  // 1. Users (Ensure students 12, 13, 14, 15, 16, 17 exist)
  console.log('1. Seeding Users...');
  const usersToSeed = [
    { id: 12, name: 'Alex Johnson', email: 'student@mentor.test', role: 'student', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop' },
    { id: 13, name: 'Maya Lin', email: 'student@mentorlms.com', role: 'student', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop' },
    { id: 14, name: 'System Administrator', email: 'admin@admin.com', role: 'admin', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&fit=crop' },
    { id: 15, name: 'Liam Smith', email: 'liam@student.test', role: 'student', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&fit=crop' },
    { id: 16, name: 'Emma Watson', email: 'emma@student.test', role: 'student', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop' },
    { id: 17, name: 'Carlos Santana', email: 'carlos@student.test', role: 'student', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop' }
  ];

  for (const u of usersToSeed) {
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(u.id);
    if (!existing) {
      db.prepare(`
        INSERT INTO users (id, name, email, role, password, status, photo, created_at, updated_at)
        VALUES (?, ?, ?, ?, '$2a$10$YourHashedPasswordHerePlaceholder1234567890123456', 1, ?, datetime('now'), datetime('now'))
      `).run(u.id, u.name, u.email, u.role, u.photo);
      console.log(`-> Created user #${u.id}: ${u.name}`);
    } else {
      db.prepare('UPDATE users SET name = ?, photo = COALESCE(photo, ?) WHERE id = ?').run(u.name, u.photo, u.id);
    }
  }

  // Ensure Instructor applications (pending & approved)
  console.log('\n2. Ensuring Instructor Applications...');
  const appUsers = [
    { userId: 15, designation: 'Senior React & Next.js Architect', bio: 'Over 8 years experience building scalable enterprise frontends.', skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'TailwindCSS']), status: 'pending' },
    { userId: 16, designation: 'UI/UX Design Lead & Educator', bio: 'Passionate about design systems, accessibility, and human-computer interaction.', skills: JSON.stringify(['Figma', 'Design Systems', 'Design Tokens', 'Accessibility']), status: 'pending' },
    { userId: 17, designation: 'DevOps & Cloud Specialist', bio: 'Certified AWS Solutions Architect with focus on CI/CD automation.', skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'Terraform']), status: 'approved' }
  ];

  for (const app of appUsers) {
    const existing = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(app.userId);
    if (!existing) {
      db.prepare(`
        INSERT INTO instructors (user_id, designation, biography, skills, resume, status, payout_methods, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'resume.pdf', ?, '[]', datetime('now'), datetime('now'))
      `).run(app.userId, app.designation, app.bio, app.skills, app.status);
      console.log(`-> Added instructor application for user #${app.userId} (Status: ${app.status})`);
    }
  }

  // 3. Courses & Lessons: Seed Course Enrollments and Watch History for Students
  console.log('\n3. Seeding Course Enrollments & Progress...');
  const courses = db.prepare('SELECT id, title, slug FROM courses LIMIT 8').all();
  if (courses.length > 0) {
    const enrollments = [
      { userId: 12, courseId: courses[0].id, type: 'lifetime', progress: 100 },
      { userId: 12, courseId: courses[1] ? courses[1].id : courses[0].id, type: 'lifetime', progress: 75 },
      { userId: 12, courseId: courses[2] ? courses[2].id : courses[0].id, type: 'lifetime', progress: 30 },
      { userId: 13, courseId: courses[0].id, type: 'lifetime', progress: 100 },
      { userId: 13, courseId: courses[1] ? courses[1].id : courses[0].id, type: 'lifetime', progress: 50 },
      { userId: 14, courseId: courses[0].id, type: 'lifetime', progress: 100 },
      { userId: 14, courseId: courses[1] ? courses[1].id : courses[0].id, type: 'lifetime', progress: 60 },
      { userId: 15, courseId: courses[0].id, type: 'lifetime', progress: 80 },
      { userId: 16, courseId: courses[2] ? courses[2].id : courses[0].id, type: 'lifetime', progress: 40 }
    ];

    for (const e of enrollments) {
      const existing = db.prepare('SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?').get(e.userId, e.courseId);
      if (!existing) {
        const ins = db.prepare(`
          INSERT INTO course_enrollments (user_id, course_id, enrollment_type, entry_date, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now', '-10 days'), datetime('now', '-10 days'), datetime('now'))
        `).run(e.userId, e.courseId, e.type);
        console.log(`-> Enrolled user #${e.userId} in course #${e.courseId}`);
      }

      // Check / Create watch history
      const existingWh = db.prepare('SELECT id FROM watch_histories WHERE user_id = ? AND course_id = ?').get(e.userId, e.courseId);
      const fakeCompletedLessons = e.progress === 100 
        ? JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) 
        : (e.progress >= 70 ? JSON.stringify([1, 2, 3, 4, 5, 6, 7]) : JSON.stringify([1, 2, 3]));

      if (!existingWh) {
        db.prepare(`
          INSERT INTO watch_histories (
            user_id, course_id, current_section_id, current_watching_id, current_watching_type,
            completed_watching, completion_date, created_at, updated_at
          ) VALUES (?, ?, '1', '1', 'lesson', ?, ?, datetime('now'), datetime('now'))
        `).run(
          e.userId,
          e.courseId,
          fakeCompletedLessons,
          e.progress === 100 ? "2026-09-20 14:00:00" : null
        );
      } else {
        db.prepare(`
          UPDATE watch_histories
          SET completed_watching = ?, completion_date = ?
          WHERE user_id = ? AND course_id = ?
        `).run(
          fakeCompletedLessons,
          e.progress === 100 ? "2026-09-20 14:00:00" : null,
          e.userId,
          e.courseId
        );
      }
    }

    // 4. Issued Course Certificates
    console.log('\n4. Seeding Issued Certificates...');
    const certsToSeed = [
      { userId: 12, courseId: courses[0].id, identifier: 'CERT-MLMS-2026-9901' },
      { userId: 13, courseId: courses[0].id, identifier: 'CERT-MLMS-2026-8802' },
      { userId: 14, courseId: courses[0].id, identifier: 'CERT-MLMS-2026-7703' }
    ];

    if (courses[1]) {
      certsToSeed.push({ userId: 12, courseId: courses[1].id, identifier: 'CERT-MLMS-2026-9902' });
      certsToSeed.push({ userId: 14, courseId: courses[1].id, identifier: 'CERT-MLMS-2026-7704' });
    }

    for (const cert of certsToSeed) {
      const existing = db.prepare('SELECT id FROM course_certificates WHERE identifier = ?').get(cert.identifier);
      if (!existing) {
        db.prepare(`
          INSERT INTO course_certificates (identifier, user_id, course_id, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now', '-5 days'), datetime('now'))
        `).run(cert.identifier, cert.userId, cert.courseId);
        console.log(`-> Issued certificate ${cert.identifier} to user #${cert.userId}`);
      }
    }
  }

  // 5. Course Coupons & Reviews
  console.log('\n5. Seeding Course Coupons & Reviews...');
  const coupons = [
    { code: 'WELCOME50', discount: 50, discount_type: 'percentage', usage_type: 'unlimited', is_active: 1 },
    { code: 'DEVMASTER25', discount: 25, discount_type: 'percentage', usage_type: 'limited', usage_limit: 100, is_active: 1 },
    { code: 'SUMMER2026', discount: 15, discount_type: 'percentage', usage_type: 'unlimited', is_active: 1 },
    { code: 'FLASHDEAL', discount: 30, discount_type: 'percentage', usage_type: 'unlimited', is_active: 1 }
  ];

  for (const c of coupons) {
    const existing = db.prepare('SELECT id FROM course_coupons WHERE code = ?').get(c.code);
    if (!existing) {
      db.prepare(`
        INSERT INTO course_coupons (code, discount, discount_type, user_id, usage_type, usage_limit, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 14, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(c.code, c.discount, c.discount_type, c.usage_type, c.usage_limit || null, c.is_active);
      console.log(`-> Created course coupon ${c.code}`);
    }
  }

  if (courses.length > 0) {
    const reviews = [
      { userId: 12, courseId: courses[0].id, rating: 5, review: 'Exceptional course structure! The explanations of server components and layout architecture were clear and practical.' },
      { userId: 13, courseId: courses[0].id, rating: 5, review: 'One of the best LMS courses available. Highly recommended for any frontend engineer wanting to level up.' },
      { userId: 15, courseId: courses[0].id, rating: 4, review: 'Great practical insights. Good balance between theory and real world exercises.' }
    ];

    for (const r of reviews) {
      const existing = db.prepare('SELECT id FROM course_reviews WHERE user_id = ? AND course_id = ?').get(r.userId, r.courseId);
      if (!existing) {
        db.prepare(`
          INSERT INTO course_reviews (review, rating, user_id, course_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now', '-3 days'), datetime('now'))
        `).run(r.review, r.rating, r.userId, r.courseId);
        console.log(`-> Added course review from user #${r.userId}`);
      }
    }
  }

  // 6. Exams & Exam Attempts
  console.log('\n6. Seeding Exams, Enrollments & Attempts...');
  const existingExams = db.prepare('SELECT id, title FROM exams').all();
  let examId1 = existingExams[0]?.id;
  let examId2 = existingExams[1]?.id;

  if (!examId1) {
    const ins = db.prepare(`
      INSERT INTO exams (
        title, slug, short_description, description, status, level,
        pricing_type, price, duration_hours, duration_minutes, pass_mark, total_marks,
        max_attempts, total_questions, thumbnail, instructor_id, exam_category_id,
        created_at, updated_at
      ) VALUES (
        'Fullstack Next.js 15 & React Certification', 'fullstack-nextjs-15-certification',
        'Official skill certification exam for Next.js 15 App Router and React Server Components.',
        '<p>Demonstrate your mastery over SSR, Server Actions, Dynamic Nonces, and API Route performance.</p>',
        'published', 'advanced', 'free', 0, 2, 0, 70, 100, 3, 25,
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop',
        1, 1, datetime('now'), datetime('now')
      )
    `).run();
    examId1 = Number(ins.lastInsertRowid);
  }

  if (!examId2) {
    const ins = db.prepare(`
      INSERT INTO exams (
        title, slug, short_description, description, status, level,
        pricing_type, price, duration_hours, duration_minutes, pass_mark, total_marks,
        max_attempts, total_questions, thumbnail, instructor_id, exam_category_id,
        created_at, updated_at
      ) VALUES (
        'UI/UX Design Systems & Micro-Interactions Test', 'ui-ux-design-systems-test',
        'Comprehensive assessment on OKLCH color spaces, accessibility tokens, and layout physics.',
        '<p>Test your knowledge on modern interface engineering and design tokens.</p>',
        'published', 'intermediate', 'paid', 29, 1, 30, 65, 100, 2, 20,
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&fit=crop',
        1, 1, datetime('now'), datetime('now')
      )
    `).run();
    examId2 = Number(ins.lastInsertRowid);
  }

  // Enroll users in exams
  const examEnrollments = [
    { userId: 12, examId: examId1 },
    { userId: 12, examId: examId2 },
    { userId: 13, examId: examId1 },
    { userId: 14, examId: examId1 },
    { userId: 14, examId: examId2 }
  ];

  for (const ee of examEnrollments) {
    const existing = db.prepare('SELECT id FROM exam_enrollments WHERE user_id = ? AND exam_id = ?').get(ee.userId, ee.examId);
    if (!existing) {
      db.prepare(`
        INSERT INTO exam_enrollments (user_id, exam_id, enrollment_type, entry_date, created_at, updated_at)
        VALUES (?, ?, 'lifetime', datetime('now', '-7 days'), datetime('now', '-7 days'), datetime('now'))
      `).run(ee.userId, ee.examId);
      console.log(`-> Enrolled user #${ee.userId} in exam #${ee.examId}`);
    }
  }

  // Exam Attempts (Passed & In Progress)
  const attempts = [
    { userId: 12, examId: examId1, attempt_number: 1, total_marks: 100, obtained_marks: 92, correct_answers: 23, incorrect_answers: 2, is_passed: 1, status: 'completed' },
    { userId: 12, examId: examId2, attempt_number: 1, total_marks: 100, obtained_marks: 58, correct_answers: 12, incorrect_answers: 8, is_passed: 0, status: 'completed' },
    { userId: 13, examId: examId1, attempt_number: 1, total_marks: 100, obtained_marks: 88, correct_answers: 22, incorrect_answers: 3, is_passed: 1, status: 'completed' },
    { userId: 14, examId: examId1, attempt_number: 1, total_marks: 100, obtained_marks: 96, correct_answers: 24, incorrect_answers: 1, is_passed: 1, status: 'completed' }
  ];

  for (const att of attempts) {
    const existing = db.prepare('SELECT id FROM exam_attempts WHERE user_id = ? AND exam_id = ? AND attempt_number = ?').get(att.userId, att.examId, att.attempt_number);
    if (!existing) {
      db.prepare(`
        INSERT INTO exam_attempts (
          user_id, exam_id, attempt_number, total_marks, obtained_marks,
          correct_answers, incorrect_answers, is_passed, status, start_time, end_time,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '-2 days', '+1 hour'),
          datetime('now', '-2 days'), datetime('now')
        )
      `).run(
        att.userId, att.examId, att.attempt_number, att.total_marks, att.obtained_marks,
        att.correct_answers, att.incorrect_answers, att.is_passed, att.status
      );
      console.log(`-> Added exam attempt for user #${att.userId} on exam #${att.examId} (${att.obtained_marks} marks, passed: ${att.is_passed})`);
    }
  }

  // Exam Coupons
  const examCoupons = [
    { code: 'EXAMPASS100', discount: 100, discount_type: 'percentage' },
    { code: 'EXAM20', discount: 20, discount_type: 'percentage' }
  ];
  for (const ec of examCoupons) {
    const existing = db.prepare('SELECT id FROM exam_coupons WHERE code = ?').get(ec.code);
    if (!existing) {
      db.prepare(`
        INSERT INTO exam_coupons (code, discount, discount_type, exam_id, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `).run(ec.code, ec.discount, ec.discount_type, examId1);
      console.log(`-> Added exam coupon ${ec.code}`);
    }
  }

  // 7. Store Products & Orders
  console.log('\n7. Seeding Store Products & Digital Orders...');
  const productsToSeed = [
    {
      title: 'Next.js 15 SaaS Starter & Boilerplate Kit',
      slug: 'nextjs-15-saas-starter-kit',
      summary: 'Production-ready Next.js 15 starter with auth, Stripe subscriptions, Tailwind, and Prisma.',
      price: 49,
      discount_price: 39,
      pricing_type: 'paid',
      status: 'published',
      featured: 1,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop'
    },
    {
      title: 'Figma Design System UI Pro Pack',
      slug: 'figma-design-system-ui-pro-pack',
      summary: 'Over 800+ handcrafted UI components, responsive typography tokens, and light/dark modes.',
      price: 29,
      discount_price: 19,
      pricing_type: 'paid',
      status: 'published',
      featured: 1,
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&fit=crop'
    },
    {
      title: 'Modern E-Commerce React Native Template',
      slug: 'modern-ecommerce-react-native-template',
      summary: 'Complete mobile store app with cart, checkout, order tracking, and push notifications.',
      price: 59,
      discount_price: 45,
      pricing_type: 'paid',
      status: 'published',
      featured: 0,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&fit=crop'
    },
    {
      title: '3D Isometric Illustration Asset Pack',
      slug: '3d-isometric-illustration-pack',
      summary: '150+ high resolution 3D renders with transparent backgrounds for tech websites.',
      price: 25,
      discount_price: null,
      pricing_type: 'paid',
      status: 'published',
      featured: 0,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&fit=crop'
    }
  ];

  for (const p of productsToSeed) {
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
    if (!existing) {
      db.prepare(`
        INSERT INTO products (
          title, slug, summary, description, pricing_type, price, discount, discount_price,
          status, featured, thumbnail, instructor_id, product_category_id, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, 1, 1, datetime('now'), datetime('now')
        )
      `).run(
        p.title, p.slug, p.summary, `<p>${p.summary}</p>`, p.pricing_type, p.price,
        p.discount_price ? 1 : 0, p.discount_price, p.status, p.featured, p.thumbnail
      );
      console.log(`-> Created product: ${p.title}`);
    }
  }

  // Seed Product Orders for Student & Admin
  const productList = db.prepare('SELECT id, price, discount_price FROM products LIMIT 4').all();
  if (productList.length > 0) {
    const ordersToSeed = [
      { userId: 12, productId: productList[0].id, total: productList[0].discount_price || productList[0].price || 29 },
      { userId: 12, productId: productList[1] ? productList[1].id : productList[0].id, total: 19 },
      { userId: 13, productId: productList[0].id, total: productList[0].discount_price || 39 },
      { userId: 14, productId: productList[0].id, total: productList[0].discount_price || 39 },
      { userId: 14, productId: productList[1] ? productList[1].id : productList[0].id, total: 19 }
    ];

    for (const ord of ordersToSeed) {
      const existing = db.prepare('SELECT id FROM product_orders WHERE user_id = ? AND product_id = ?').get(ord.userId, ord.productId);
      if (!existing) {
        db.prepare(`
          INSERT INTO product_orders (
            user_id, product_id, instructor_id, quantity, unit_price, subtotal, discount, tax, total,
            created_at, updated_at
          ) VALUES (?, ?, 1, 1, ?, ?, 0, 0, ?, datetime('now', '-4 days'), datetime('now'))
        `).run(ord.userId, ord.productId, ord.total, ord.total, ord.total);
        console.log(`-> Created product order for user #${ord.userId} on product #${ord.productId}`);
      }
    }

    // Product Coupons
    const pCoupons = [
      { code: 'STORE20', discount: 20 },
      { code: 'BUNDLE30', discount: 30 }
    ];
    for (const pc of pCoupons) {
      const existing = db.prepare('SELECT id FROM product_coupons WHERE code = ?').get(pc.code);
      if (!existing) {
        db.prepare(`
          INSERT INTO product_coupons (code, discount, discount_type, product_id, is_active, created_at, updated_at)
          VALUES (?, ?, 'percentage', ?, 1, datetime('now'), datetime('now'))
        `).run(pc.code, pc.discount, productList[0].id);
        console.log(`-> Created product coupon ${pc.code}`);
      }
    }
  }

  // 8. Blog Articles & Comments
  console.log('\n8. Seeding Blog Articles & Discussions...');
  const blogsToSeed = [
    {
      title: 'Mastering Server Actions & Streaming in Next.js 15',
      slug: 'mastering-server-actions-and-streaming-in-nextjs-15',
      description: '<p>Next.js 15 introduces transformative enhancements to React Server Components, optimistic mutations, and partial prerendering. In this comprehensive guide, we explore how to architect production-grade full-stack features with minimal latency and strict CSP compliance.</p><h3>Why Server Actions Change the Paradigm</h3><p>Server actions eliminate redundant API boilerplate by allowing secure server-side execution directly from form submissions and inline handlers.</p>',
      keywords: 'nextjs15, react, webdev, performance',
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop'
    },
    {
      title: 'Design Tokens with OKLCH: The Color System of Modern Web',
      slug: 'design-tokens-with-oklch-color-system',
      description: '<p>Traditional sRGB color spaces fail to preserve perceptual uniformity across tints and dark modes. Learn how OKLCH color tokens provide mathematically predictable chroma and lightness across enterprise themes.</p>',
      keywords: 'design-tokens, css, oklch, ui-ux',
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&fit=crop'
    },
    {
      title: 'Building Resilient Fullstack LMS Architectures',
      slug: 'building-resilient-fullstack-lms-architectures',
      description: '<p>From high-concurrency exam submissions to zero-downtime database migrations, exploring the architectural patterns needed for scalable learning management systems.</p>',
      keywords: 'architecture, lms, sqlite, nextjs',
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop'
    },
    {
      title: 'Why Micro-Interactions Elevate Enterprise Platforms',
      slug: 'why-micro-interactions-elevate-enterprise-platforms',
      description: '<p>Delight is not frivolous: deliberate micro-interactions, optimistic UI updates, and smooth state transitions measurably decrease user error rates and cognitive fatigue.</p>',
      keywords: 'micro-interactions, ux, animation, design',
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&fit=crop'
    }
  ];

  for (const b of blogsToSeed) {
    const existing = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(b.slug);
    if (!existing) {
      db.prepare(`
        INSERT INTO blogs (
          uuid, title, slug, description, keywords, status, thumbnail,
          user_id, blog_category_id, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          14, 1, datetime('now', '-3 days'), datetime('now')
        )
      `).run(crypto.randomUUID(), b.title, b.slug, b.description, b.keywords, b.status, b.thumbnail);
      console.log(`-> Published blog: ${b.title}`);
    }
  }

  // 9. Billings & Payouts (Payment histories & Payout histories)
  console.log('\n9. Seeding Payment & Payout Records...');
  const payments = [
    { type: 'online', amount: 49.00, admin_rev: 9.80, inst_rev: 39.20, inv: 'INV-2026-001', tx: 'ch_stripe_demo_01', userId: 12, purchaseType: 'course' },
    { type: 'online', amount: 39.00, admin_rev: 7.80, inst_rev: 31.20, inv: 'INV-2026-002', tx: 'ch_paypal_demo_02', userId: 13, purchaseType: 'product' },
    { type: 'offline', amount: 149.00, admin_rev: 29.80, inst_rev: 119.20, inv: 'INV-2026-003', tx: 'bank_wire_78945', userId: 15, purchaseType: 'course' },
    { type: 'online', amount: 29.00, admin_rev: 5.80, inst_rev: 23.20, inv: 'INV-2026-004', tx: 'ch_stripe_demo_04', userId: 16, purchaseType: 'exam' }
  ];

  for (const p of payments) {
    const existing = db.prepare('SELECT id FROM payment_histories WHERE invoice = ?').get(p.inv);
    if (!existing) {
      db.prepare(`
        INSERT INTO payment_histories (
          payment_type, amount, admin_revenue, instructor_revenue, invoice, transaction_id,
          user_id, purchase_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now'))
      `).run(p.type, p.amount, p.admin_rev, p.inst_rev, p.inv, p.tx, p.userId, p.purchaseType);
      console.log(`-> Added payment record ${p.inv} ($${p.amount})`);
    }
  }

  const payouts = [
    { method: 'Bank Transfer', amount: 1250.00, status: 'completed', tx: 'wire_ref_8921', userId: 1 },
    { method: 'PayPal', amount: 480.00, status: 'completed', tx: 'pp_payout_3421', userId: 1 },
    { method: 'Bank Transfer', amount: 350.00, status: 'pending', tx: 'pending_req_101', userId: 1 },
    { method: 'PayPal', amount: 220.00, status: 'pending', tx: 'pending_req_102', userId: 10 }
  ];

  for (const py of payouts) {
    const existing = db.prepare('SELECT id FROM payout_histories WHERE transaction_id = ?').get(py.tx);
    if (!existing) {
      db.prepare(`
        INSERT INTO payout_histories (
          payout_method, amount, status, transaction_id, user_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now', '-1 days'), datetime('now'))
      `).run(py.method, py.amount, py.status, py.tx, py.userId);
      console.log(`-> Added payout record for user #${py.userId} ($${py.amount}, ${py.status})`);
    }
  }

  // 10. Newsletters & Subscribers
  console.log('\n10. Seeding Newsletter Subscribers...');
  const subscribers = [
    'developer@acme.org', 'techlead@startup.io', 'sarah.designer@studio.net',
    'student.alex@university.edu', 'cloud.architect@enterprise.com'
  ];

  for (const s of subscribers) {
    const existing = db.prepare('SELECT id FROM subscribes WHERE email = ?').get(s);
    if (!existing) {
      db.prepare(`
        INSERT INTO subscribes (email, created_at, updated_at)
        VALUES (?, datetime('now', '-5 days'), datetime('now'))
      `).run(s);
      console.log(`-> Subscribed: ${s}`);
    }
  }

  // 11. Student Wishlist Items
  console.log('\n11. Seeding Student Wishlists...');
  if (courses.length > 2) {
    const wishlistItems = [
      { userId: 12, courseId: courses[1].id },
      { userId: 12, courseId: courses[2].id },
      { userId: 14, courseId: courses[1].id },
      { userId: 14, courseId: courses[2].id }
    ];

    for (const w of wishlistItems) {
      const existing = db.prepare('SELECT id FROM course_wishlists WHERE user_id = ? AND course_id = ?').get(w.userId, w.courseId);
      if (!existing) {
        db.prepare(`
          INSERT INTO course_wishlists (user_id, course_id, created_at, updated_at)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `).run(w.userId, w.courseId);
        console.log(`-> Wishlisted course #${w.courseId} for user #${w.userId}`);
      }
    }
  }

  // Also exam wishlist
  if (examId2) {
    const ew = [
      { userId: 12, examId: examId2 },
      { userId: 14, examId: examId2 }
    ];
    for (const w of ew) {
      const existing = db.prepare('SELECT id FROM exam_wishlists WHERE user_id = ? AND exam_id = ?').get(w.userId, w.examId);
      if (!existing) {
        db.prepare(`
          INSERT INTO exam_wishlists (user_id, exam_id, created_at, updated_at)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `).run(w.userId, w.examId);
        console.log(`-> Wishlisted exam #${w.examId} for user #${w.userId}`);
      }
    }
  }
})();

console.log('\n=== SEEDING COMPLETED SUCCESSFULLY! ===');
