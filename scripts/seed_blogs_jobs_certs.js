const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../prisma/dev.db'));

console.log('Seeding blogs, job circulars, and certificates...');

// 1. Seed Blog Category
const blogCat = db.prepare('SELECT id FROM blog_categories WHERE slug = ?').get('technology');
let blogCatId;
if (!blogCat) {
  const res = db.prepare(`
    INSERT INTO blog_categories (name, slug, icon, sort, description, status, created_at, updated_at)
    VALUES ('Technology', 'technology', 'code', 1, 'Latest tech news & trends', 'active', datetime('now'), datetime('now'))
  `).run();
  blogCatId = res.lastInsertRowid;
} else {
  blogCatId = blogCat.id;
}

// 2. Seed Blogs
const sampleBlogs = [
  {
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Modern Web Architecture: Next.js 15 vs Laravel in Enterprise Production',
    slug: 'modern-web-architecture-nextjs-15-vs-laravel',
    description: '<p>A comprehensive architectural comparison exploring edge rendering, React 19 streaming Server Components, and full-stack API integration.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    keywords: 'nextjs, laravel, web development, architecture',
    status: 'published',
    user_id: 1,
    blog_category_id: blogCatId
  },
  {
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    title: 'Enterprise Cyber Security: Implementing Zero-Trust and Dynamic Nonce CSP',
    slug: 'enterprise-cyber-security-zero-trust-dynamic-nonce-csp',
    description: '<p>Detailed guide to hardening modern web applications using strict Content Security Policy, OWASP security headers, and encrypted sessions.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    keywords: 'security, csp, zero trust, owasp',
    status: 'published',
    user_id: 1,
    blog_category_id: blogCatId
  }
];

const insertBlog = db.prepare(`
  INSERT OR REPLACE INTO blogs (
    uuid, title, slug, description, thumbnail, banner, keywords, status, user_id, blog_category_id, created_at, updated_at
  ) VALUES (
    @uuid, @title, @slug, @description, @thumbnail, @banner, @keywords, @status, @user_id, @blog_category_id, datetime('now'), datetime('now')
  )
`);

for (const b of sampleBlogs) {
  insertBlog.run(b);
}

// 3. Seed Job Circulars
const sampleJobs = [
  {
    uuid: 'job-101-uuid',
    title: 'Senior Full-Stack TypeScript Engineer',
    slug: 'senior-full-stack-typescript-engineer',
    description: '<p>We are looking for an experienced Full-Stack Engineer with deep expertise in Next.js 15, TypeScript, React 19, and database architecture.</p>',
    experience_level: 'senior',
    location: 'Remote (Worldwide)',
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: 'USD',
    salary_negotiable: 0,
    application_deadline: '2026-12-31',
    contact_email: 'careers@mentorlms.com',
    skills_required: '["TypeScript", "Next.js", "React 19", "PostgreSQL", "Tailwind CSS"]',
    positions_available: 2,
    job_type: 'full-time',
    work_type: 'remote',
    status: 'published'
  },
  {
    uuid: 'job-102-uuid',
    title: 'Lead DevOps & Cloud Security Architect',
    slug: 'lead-devops-cloud-security-architect',
    description: '<p>Seeking a Cloud Architect to oversee high-availability Kubernetes infrastructure, CI/CD pipelines, and enterprise security compliance.</p>',
    experience_level: 'lead',
    location: 'New York, NY / Remote',
    salary_min: 120000,
    salary_max: 160000,
    salary_currency: 'USD',
    salary_negotiable: 1,
    application_deadline: '2026-11-30',
    contact_email: 'careers@mentorlms.com',
    skills_required: '["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"]',
    positions_available: 1,
    job_type: 'full-time',
    work_type: 'hybrid',
    status: 'published'
  }
];

const insertJob = db.prepare(`
  INSERT OR REPLACE INTO job_circulars (
    uuid, title, slug, description, experience_level, location, salary_min, salary_max,
    salary_currency, salary_negotiable, application_deadline, contact_email, skills_required,
    positions_available, job_type, work_type, status, created_at, updated_at
  ) VALUES (
    @uuid, @title, @slug, @description, @experience_level, @location, @salary_min, @salary_max,
    @salary_currency, @salary_negotiable, @application_deadline, @contact_email, @skills_required,
    @positions_available, @job_type, @work_type, @status, datetime('now'), datetime('now')
  )
`);

for (const j of sampleJobs) {
  insertJob.run(j);
}

// 4. Seed Course Certificate
const sampleCert = {
  identifier: 'CERT-MLMS-2026-9901',
  user_id: 12, // student user Alex Johnson
  course_id: 1
};

const existingCert = db.prepare('SELECT id FROM course_certificates WHERE identifier = ?').get(sampleCert.identifier);
if (!existingCert) {
  db.prepare(`
    INSERT INTO course_certificates (identifier, user_id, course_id, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(sampleCert.identifier, sampleCert.user_id, sampleCert.course_id);
}

console.log('Seeded successfully!');
console.log('Blogs in DB:', db.prepare('SELECT count(*) as c FROM blogs').get().c);
console.log('Jobs in DB:', db.prepare('SELECT count(*) as c FROM job_circulars').get().c);
console.log('Certificates in DB:', db.prepare('SELECT count(*) as c FROM course_certificates').get().c);
