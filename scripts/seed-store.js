const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new DatabaseSync(dbPath);

console.log('Updating product categories...');

const categories = [
  { id: 2, title: 'Templates & Themes', slug: 'templates-themes', sort: 1 },
  { id: 3, title: 'UI Kits & Design Systems', slug: 'ui-kits-design-systems', sort: 2 },
  { id: 4, title: 'Developer Toolkits', slug: 'developer-toolkits', sort: 3 },
  { id: 5, title: 'Design Assets', slug: 'design-assets', sort: 4 },
  { id: 6, title: 'Starter Kits', slug: 'starter-kits', sort: 5 }
];

for (const cat of categories) {
  const exists = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(cat.id);
  if (!exists) {
    db.prepare('INSERT INTO product_categories (id, title, slug, sort, status, created_at, updated_at) VALUES (?, ?, ?, ?, 1, datetime(\'now\'), datetime(\'now\'))').run(cat.id, cat.title, cat.slug, cat.sort);
  } else {
    db.prepare('UPDATE product_categories SET title = ?, slug = ?, sort = ? WHERE id = ?').run(cat.title, cat.slug, cat.sort, cat.id);
  }
}

const curatedProducts = [
  {
    id: 1,
    title: 'Enterprise Next.js 15 Pro Admin Dashboard Template',
    slug: 'enterprise-nextjs-15-pro-admin-dashboard-template',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 49,
    discount: 1,
    discount_price: 29,
    product_category_id: 2,
    status: 'approved',
    summary: 'A production-ready enterprise dashboard boilerplate built with Next.js 15 App Router, Tailwind CSS, TypeScript, and comprehensive analytics charts.',
    description: 'Elevate your enterprise development workflow with our premier Next.js 15 Admin Dashboard template.'
  },
  {
    id: 2,
    title: 'Figma Design System & UI Kit for Modern Web Apps',
    slug: 'figma-design-system-ui-kit-modern-web-apps',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 39,
    discount: 1,
    discount_price: 19,
    product_category_id: 3,
    status: 'approved',
    summary: '500+ customizable UI components, variables, design tokens, and accessibility-tested templates in Figma.',
    description: 'Accelerate your design workflow with this comprehensive Figma UI Kit.'
  },
  {
    id: 3,
    title: 'Full-Stack Developer Starter Kit - TypeScript & Node',
    slug: 'full-stack-developer-starter-kit-typescript-node',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'free',
    price: 0,
    discount: 0,
    discount_price: null,
    product_category_id: 6,
    status: 'approved',
    summary: 'Production-ready starter repository featuring TypeScript, Node.js API boilerplate, Docker setup, and CI/CD pipelines.',
    description: 'Kickstart your next full-stack project with this robust starter kit configured with industry-standard best practices.'
  },
  {
    id: 19,
    title: 'Next.js 15 SaaS Starter & Boilerplate Kit',
    slug: 'nextjs-15-saas-starter-kit',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 49,
    discount: 1,
    discount_price: 39,
    product_category_id: 4,
    status: 'approved',
    summary: 'Complete SaaS solution with Stripe checkout, team management, auth middleware, and automated onboarding.',
    description: 'Launch your SaaS in days instead of months. Fully typed, zero bloat, and highly maintainable.'
  },
  {
    id: 20,
    title: 'Figma Design System UI Pro Pack',
    slug: 'figma-design-system-ui-pro-pack',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 29,
    discount: 1,
    discount_price: 19,
    product_category_id: 3,
    status: 'approved',
    summary: 'Comprehensive collection of mobile and web design assets, wireframes, and production tokens.',
    description: 'Handcrafted design components organized systematically to speed up product design.'
  },
  {
    id: 21,
    title: 'Modern E-Commerce React Native Mobile Template',
    slug: 'modern-ecommerce-react-native-template',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 59,
    discount: 1,
    discount_price: 45,
    product_category_id: 2,
    status: 'approved',
    summary: 'Cross-platform mobile commerce application with cart management, payments, and push notifications.',
    description: 'Build native iOS and Android e-commerce experiences effortlessly with Expo and React Native.'
  },
  {
    id: 22,
    title: '3D Isometric Illustration & Icon Asset Pack',
    slug: '3d-isometric-illustration-pack',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 25,
    discount: 0,
    discount_price: null,
    product_category_id: 5,
    status: 'approved',
    summary: 'Over 120 high-resolution 3D renders with transparent backgrounds and customizable Blender source files.',
    description: 'Eye-catching 3D graphics for your landing pages, marketing campaigns, and presentations.'
  },
  {
    id: 30,
    title: 'Interactive Frontend Architecture E-Book & Guide',
    slug: 'interactive-frontend-architecture-guide',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 24.99,
    discount: 0,
    discount_price: null,
    product_category_id: 4,
    status: 'approved',
    summary: 'Master large-scale frontend architecture, state management, caching strategies, and performance optimization.',
    description: 'A deep-dive technical handbook for senior engineers and architects building modern web platforms.'
  },
  {
    id: 33,
    title: 'Enterprise LMS Source Code Bundle (E2E Verified)',
    slug: 'enterprise-lms-source-code-bundle',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    pricing_type: 'paid',
    price: 89,
    discount: 1,
    discount_price: 69,
    product_category_id: 6,
    status: 'approved',
    summary: 'Complete Learning Management System source code with course player, exams, quizzes, store, and analytics.',
    description: 'Deploy your own educational ecosystem with verified zero-config deployment scripts.'
  }
];

// Clean up any stray test products with raw green images
db.prepare('DELETE FROM products WHERE id IN (25, 29, 31, 32)').run();

for (const p of curatedProducts) {
  const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(p.id);
  if (exists) {
    db.prepare(`
      UPDATE products 
      SET title = ?, slug = ?, thumbnail = ?, pricing_type = ?, price = ?, discount = ?, 
          discount_price = ?, product_category_id = ?, status = ?, summary = ?, description = ?
      WHERE id = ?
    `).run(p.title, p.slug, p.thumbnail, p.pricing_type, p.price, p.discount, p.discount_price, p.product_category_id, p.status, p.summary, p.description, p.id);
  } else {
    db.prepare(`
      INSERT INTO products (id, title, slug, thumbnail, pricing_type, price, discount, discount_price, product_category_id, status, summary, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(p.id, p.title, p.slug, p.thumbnail, p.pricing_type, p.price, p.discount, p.discount_price, p.product_category_id, p.status, p.summary, p.description);
  }
}

console.log('Store database successfully seeded!');
