const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('Seeding exams and products into SQLite DB...');

// Check instructors table
const instructors = db.prepare('SELECT id, user_id FROM instructors').all();
console.log('Instructors available:', instructors.length);
const defaultInstructorId = instructors.length > 0 ? instructors[0].id : 1;

// 1. Seed Exam Categories
const examCategories = [
  { title: 'Cloud & DevOps', slug: 'cloud-devops', icon: 'cloud' },
  { title: 'Web Development', slug: 'web-development', icon: 'code' },
  { title: 'Cyber Security', slug: 'cyber-security', icon: 'shield' },
  { title: 'Mobile Engineering', slug: 'mobile-engineering', icon: 'smartphone' },
  { title: 'Data Science & AI', slug: 'data-science-ai', icon: 'database' },
];

const insertExamCat = db.prepare(`
  INSERT INTO exam_categories (title, slug, icon, sort, status, created_at, updated_at)
  VALUES (@title, @slug, @icon, 0, 1, datetime('now'), datetime('now'))
`);

const examCatMap = {};
for (const cat of examCategories) {
  let existing = db.prepare('SELECT id FROM exam_categories WHERE slug = ?').get(cat.slug);
  if (!existing) {
    const res = insertExamCat.run(cat);
    examCatMap[cat.slug] = res.lastInsertRowid;
  } else {
    examCatMap[cat.slug] = existing.id;
  }
}

// 2. Seed Product Categories
const productCategories = [
  { title: 'Templates & Themes', slug: 'templates-themes', icon: 'layout' },
  { title: 'UI Kits & Design Systems', slug: 'ui-kits-design-systems', icon: 'palette' },
  { title: 'Developer Toolkits', slug: 'developer-toolkits', icon: 'terminal' },
  { title: 'Design Assets', slug: 'design-assets', icon: 'image' },
  { title: 'Starter Kits', slug: 'starter-kits', icon: 'package' },
];

const insertProdCat = db.prepare(`
  INSERT INTO product_categories (title, slug, icon, sort, status, created_at, updated_at)
  VALUES (@title, @slug, @icon, 0, 1, datetime('now'), datetime('now'))
`);

const prodCatMap = {};
for (const cat of productCategories) {
  let existing = db.prepare('SELECT id FROM product_categories WHERE slug = ?').get(cat.slug);
  if (!existing) {
    const res = insertProdCat.run(cat);
    prodCatMap[cat.slug] = res.lastInsertRowid;
  } else {
    prodCatMap[cat.slug] = existing.id;
  }
}

// 3. Seed Exams
const sampleExams = [
  {
    title: 'AWS Certified Solutions Architect - Associate Practice Exam (SAA-C03)',
    slug: 'aws-solutions-architect-associate',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    level: 'intermediate',
    duration_hours: 2,
    duration_minutes: 10,
    pass_mark: 72,
    total_marks: 100,
    max_attempts: 3,
    total_questions: 10,
    price: 49.99,
    discount: 1,
    discount_price: 24.99,
    pricing_type: 'paid',
    status: 'approved',
    short_description: 'Test your architectural mastery across resilient storage, decoupled microservices, IAM security policies, and high-availability VPC networks.',
    description: '<p>Comprehensive simulated test aligned with the official AWS SAA-C03 blueprint.</p>',
    instructor_id: defaultInstructorId,
    exam_category_id: examCatMap['cloud-devops'] || 1,
    questions: [
      {
        title: 'Which AWS service provides low-latency block storage for Amazon EC2 instances?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: 'Amazon Elastic Block Store (Amazon EBS)', is_correct: 1 },
          { option_text: 'Amazon S3 Glacier', is_correct: 0 },
          { option_text: 'AWS Storage Gateway', is_correct: 0 },
          { option_text: 'Amazon EFS Standard Infrequent Access', is_correct: 0 }
        ]
      },
      {
        title: 'Which architectural strategy guarantees 99.99% availability for a multi-tier web application on AWS?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: 'Deploying EC2 instances across multiple Availability Zones behind an Application Load Balancer with Multi-AZ RDS', is_correct: 1 },
          { option_text: 'Running a single large instance in one Availability Zone with automated daily EBS snapshots', is_correct: 0 },
          { option_text: 'Using AWS Route 53 with single-zone weighted routing', is_correct: 0 },
          { option_text: 'Storing all relational transactional data directly inside an S3 bucket', is_correct: 0 }
        ]
      },
      {
        title: 'What is the most cost-effective storage class for archiving compliance logs accessed once a year?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: 'S3 Glacier Deep Archive', is_correct: 1 },
          { option_text: 'S3 Standard', is_correct: 0 },
          { option_text: 'S3 Intelligent-Tiering Frequent Access', is_correct: 0 },
          { option_text: 'EBS Provisioned IOPS (io2)', is_correct: 0 }
        ]
      }
    ]
  },
  {
    title: 'Full-Stack Next.js 15 & TypeScript Certification Exam',
    slug: 'nextjs-15-typescript-certification',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    level: 'advanced',
    duration_hours: 1,
    duration_minutes: 30,
    pass_mark: 75,
    total_marks: 100,
    max_attempts: 5,
    total_questions: 10,
    price: 39.99,
    discount: 1,
    discount_price: 19.99,
    pricing_type: 'paid',
    status: 'approved',
    short_description: 'Evaluate your deep expertise in React 19 Server Actions, Next.js streaming SSR, dynamic nonce CSP protection, and state synchronization.',
    description: '<p>Mastery certification in advanced Next.js 15 App Router architecture.</p>',
    instructor_id: defaultInstructorId,
    exam_category_id: examCatMap['web-development'] || 1,
    questions: [
      {
        title: 'How does Next.js 15 ensure Content-Security-Policy (CSP) compatibility with React streaming SSR scripts?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: 'By injecting a cryptographic nonce generated per-request in middleware and passing it via headers', is_correct: 1 },
          { option_text: 'By disabling CSP in production mode', is_correct: 0 },
          { option_text: 'By converting all server components into static client components', is_correct: 0 },
          { option_text: 'By executing scripts exclusively via eval()', is_correct: 0 }
        ]
      },
      {
        title: 'Which directive instructs Next.js to treat a component module as an interactive client component?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: "'use client'", is_correct: 1 },
          { option_text: "'use server'", is_correct: 0 },
          { option_text: "'use interactive'", is_correct: 0 },
          { option_text: "'use dom'", is_correct: 0 }
        ]
      }
    ]
  },
  {
    title: 'Certified Kubernetes Administrator (CKA) Simulation Exam',
    slug: 'cka-kubernetes-administrator-simulation',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    level: 'advanced',
    duration_hours: 2,
    duration_minutes: 0,
    pass_mark: 66,
    total_marks: 100,
    max_attempts: 2,
    total_questions: 10,
    price: 59.99,
    discount: 1,
    discount_price: 29.99,
    pricing_type: 'paid',
    status: 'approved',
    short_description: 'Performance-based assessment covering Cluster Architecture, RBAC controls, Pod scheduling policies, and multi-node networking troubleshooting.',
    description: '<p>Rigorous Kubernetes administration scenario challenges.</p>',
    instructor_id: defaultInstructorId,
    exam_category_id: examCatMap['cloud-devops'] || 1,
    questions: [
      {
        title: 'Which Kubernetes component maintains the desired cluster state and distributed key-value storage?',
        question_type: 'multiple_choice',
        marks: 10,
        options: [
          { option_text: 'etcd', is_correct: 1 },
          { option_text: 'kube-proxy', is_correct: 0 },
          { option_text: 'kubelet', is_correct: 0 },
          { option_text: 'containerd', is_correct: 0 }
        ]
      }
    ]
  }
];

const insertExam = db.prepare(`
  INSERT INTO exams (
    title, slug, thumbnail, level, duration_hours, duration_minutes, pass_mark, total_marks,
    max_attempts, total_questions, price, discount, discount_price, pricing_type, status,
    short_description, description, instructor_id, exam_category_id, created_at, updated_at
  ) VALUES (
    @title, @slug, @thumbnail, @level, @duration_hours, @duration_minutes, @pass_mark, @total_marks,
    @max_attempts, @total_questions, @price, @discount, @discount_price, @pricing_type, @status,
    @short_description, @description, @instructor_id, @exam_category_id, datetime('now'), datetime('now')
  )
`);

const insertExamQ = db.prepare(`
  INSERT INTO exam_questions (exam_id, question_type, title, marks, sort, created_at, updated_at)
  VALUES (@exam_id, @question_type, @title, @marks, @sort, datetime('now'), datetime('now'))
`);

const insertExamOpt = db.prepare(`
  INSERT INTO exam_question_options (exam_question_id, option_text, is_correct, sort, created_at, updated_at)
  VALUES (@exam_question_id, @option_text, @is_correct, @sort, datetime('now'), datetime('now'))
`);

for (const exam of sampleExams) {
  const existing = db.prepare('SELECT id FROM exams WHERE slug = ?').get(exam.slug);
  let examId;
  if (existing) {
    examId = existing.id;
  } else {
    const res = insertExam.run(exam);
    examId = res.lastInsertRowid;
  }

  // Insert questions if none exist
  const qCount = db.prepare('SELECT count(*) as c FROM exam_questions WHERE exam_id = ?').get(examId).c;
  if (qCount === 0 && exam.questions) {
    exam.questions.forEach((q, qIndex) => {
      const qRes = insertExamQ.run({
        exam_id: examId,
        question_type: q.question_type,
        title: q.title,
        marks: q.marks,
        sort: qIndex + 1
      });
      const qId = qRes.lastInsertRowid;
      q.options.forEach((opt, oIndex) => {
        insertExamOpt.run({
          exam_question_id: qId,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          sort: oIndex + 1
        });
      });
    });
  }
}

// 4. Seed Products
const sampleProducts = [
  {
    title: 'Enterprise Next.js 15 Pro Admin Dashboard Template',
    slug: 'enterprise-nextjs-15-pro-admin-dashboard-template',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    price: 49.00,
    discount: 1,
    discount_price: 29.00,
    pricing_type: 'paid',
    status: 'approved',
    featured: 1,
    unlimited_inventory: 1,
    inventory: 9999,
    views: 1420,
    summary: 'A production-ready Enterprise Admin Dashboard template powered by Next.js 15, React 19, TypeScript, Tailwind CSS, and OKLCH color system.',
    description: '<p>Modern, responsive, high-performance admin dashboard built from the ground up for high-scale enterprise applications.</p>',
    instructor_id: defaultInstructorId,
    product_category_id: prodCatMap['templates-themes'] || 1,
    specifications: [
      { title: 'Framework', value: 'Next.js 15 (App Router)' },
      { title: 'Language', value: 'TypeScript 5.x' },
      { title: 'Styling', value: 'Tailwind CSS v3.4 + OKLCH' },
      { title: 'License', value: 'Commercial Single / Extended' }
    ],
    faqs: [
      { question: 'Does this include full TypeScript types?', answer: 'Yes, 100% strongly typed with zero TS errors in strict mode.' },
      { question: 'Are updates included?', answer: 'Yes, lifetime free updates for minor and patch releases.' }
    ],
    files: [
      { name: 'nextjs-enterprise-admin-v2.0.zip', file_name: 'nextjs-enterprise-admin-v2.0.zip', mime_type: 'application/zip', size: 14500000 },
      { name: 'documentation-quickstart.pdf', file_name: 'documentation-quickstart.pdf', mime_type: 'application/pdf', size: 2100000 }
    ]
  },
  {
    title: 'Figma Design System & UI Kit for Modern Web Apps',
    slug: 'figma-design-system-ui-kit-modern-web-apps',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    price: 39.00,
    discount: 1,
    discount_price: 19.00,
    pricing_type: 'paid',
    status: 'approved',
    featured: 1,
    unlimited_inventory: 1,
    inventory: 9999,
    views: 980,
    summary: 'Comprehensive Figma library featuring 600+ components, autolayout 5.0, dark mode tokens, and design-to-code guidelines.',
    description: '<p>A modern Figma design system with components designed for speed and precision.</p>',
    instructor_id: defaultInstructorId,
    product_category_id: prodCatMap['ui-kits-design-systems'] || 1,
    specifications: [
      { title: 'Format', value: '.FIG (Figma File)' },
      { title: 'Components', value: '600+ Interactive Components' },
      { title: 'Auto-Layout', value: 'Auto-layout 5.0 compatible' }
    ],
    faqs: [
      { question: 'Can I use this in client projects?', answer: 'Yes, commercial client projects are fully permitted under the standard license.' }
    ],
    files: [
      { name: 'figma-design-system-v3.fig', file_name: 'figma-design-system-v3.fig', mime_type: 'application/octet-stream', size: 34000000 }
    ]
  },
  {
    title: 'Full-Stack Developer Starter Kit - TypeScript & Node',
    slug: 'full-stack-developer-starter-kit-typescript-node',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    price: 0.00,
    discount: 0,
    discount_price: null,
    pricing_type: 'free',
    status: 'approved',
    featured: 0,
    unlimited_inventory: 1,
    inventory: 9999,
    views: 2450,
    summary: 'A 100% free production starter kit featuring microservices scaffolding, Docker Compose orchestration, and automated CI/CD workflows.',
    description: '<p>Kickstart your next project with clean architecture patterns and enterprise boilerplate.</p>',
    instructor_id: defaultInstructorId,
    product_category_id: prodCatMap['starter-kits'] || 1,
    specifications: [
      { title: 'Stack', value: 'Node.js, Express, TypeScript, Docker' },
      { title: 'Database', value: 'PostgreSQL / SQLite ready' }
    ],
    faqs: [
      { question: 'Is this completely free?', answer: 'Yes, licensed under MIT.' }
    ],
    files: [
      { name: 'starter-kit-v1.2.zip', file_name: 'starter-kit-v1.2.zip', mime_type: 'application/zip', size: 5200000 }
    ]
  }
];

const insertProd = db.prepare(`
  INSERT INTO products (
    title, slug, thumbnail, price, discount, discount_price, pricing_type, status,
    featured, unlimited_inventory, inventory, views, summary, description,
    instructor_id, product_category_id, created_at, updated_at
  ) VALUES (
    @title, @slug, @thumbnail, @price, @discount, @discount_price, @pricing_type, @status,
    @featured, @unlimited_inventory, @inventory, @views, @summary, @description,
    @instructor_id, @product_category_id, datetime('now'), datetime('now')
  )
`);

const insertProdSpec = db.prepare(`
  INSERT INTO product_specifications (product_id, title, value, sort, created_at, updated_at)
  VALUES (@product_id, @title, @value, @sort, datetime('now'), datetime('now'))
`);

const insertProdFaq = db.prepare(`
  INSERT INTO product_faqs (product_id, question, answer, sort, created_at, updated_at)
  VALUES (@product_id, @question, @answer, @sort, datetime('now'), datetime('now'))
`);

const insertMedia = db.prepare(`
  INSERT INTO media (
    model_type, model_id, collection_name, name, file_name, mime_type, disk, size,
    manipulations, custom_properties, generated_conversions, responsive_images, created_at, updated_at
  ) VALUES (
    'Modules\\\\Store\\\\Models\\\\Product', @model_id, 'downloadable-files', @name, @file_name,
    @mime_type, 'local', @size, '[]', '[]', '[]', '[]', datetime('now'), datetime('now')
  )
`);

for (const prod of sampleProducts) {
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(prod.slug);
  let prodId;
  if (existing) {
    prodId = existing.id;
  } else {
    const res = insertProd.run(prod);
    prodId = res.lastInsertRowid;
  }

  // Specifications
  const specCount = db.prepare('SELECT count(*) as c FROM product_specifications WHERE product_id = ?').get(prodId).c;
  if (specCount === 0 && prod.specifications) {
    prod.specifications.forEach((s, idx) => {
      insertProdSpec.run({
        product_id: prodId,
        title: s.title,
        value: s.value,
        sort: idx + 1
      });
    });
  }

  // FAQs
  const faqCount = db.prepare('SELECT count(*) as c FROM product_faqs WHERE product_id = ?').get(prodId).c;
  if (faqCount === 0 && prod.faqs) {
    prod.faqs.forEach((f, idx) => {
      insertProdFaq.run({
        product_id: prodId,
        question: f.question,
        answer: f.answer,
        sort: idx + 1
      });
    });
  }

  // Media (downloadable files)
  const mediaCount = db.prepare('SELECT count(*) as c FROM media WHERE model_id = ? AND collection_name = ?').get(prodId, 'downloadable-files').c;
  if (mediaCount === 0 && prod.files) {
    prod.files.forEach(f => {
      insertMedia.run({
        model_id: prodId,
        name: f.name,
        file_name: f.file_name,
        mime_type: f.mime_type,
        size: f.size
      });
    });
  }
}

console.log('Seeding completed successfully!');
console.log('Exams in DB:', db.prepare('SELECT count(*) as c FROM exams').get().c);
console.log('Exam questions in DB:', db.prepare('SELECT count(*) as c FROM exam_questions').get().c);
console.log('Products in DB:', db.prepare('SELECT count(*) as c FROM products').get().c);
console.log('Product downloadable files in DB:', db.prepare('SELECT count(*) as c FROM media WHERE collection_name = ?').get('downloadable-files').c);
