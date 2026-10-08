import db from '../lib/db'

const examsToSync = [
  {
    id: 4,
    title: 'Defensive Cyber Security & OWASP Top 10 Assessment',
    slug: 'defensive-cyber-security-owasp',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    level: 'intermediate',
    duration_hours: 1,
    duration_minutes: 15,
    total_questions: 45,
    pass_mark: 80,
    price: 0,
    discount: 0,
    discount_price: null,
    pricing_type: 'free',
    short_description: 'Audit critical vulnerability patterns including SQLi, SSRF, Broken Object Level Authorization (BOLA), and Cryptographic failures.',
    description: 'Audit critical vulnerability patterns including SQLi, SSRF, Broken Object Level Authorization (BOLA), and Cryptographic failures.',
    status: 'approved',
    exam_category_id: 1,
    instructor_id: 1
  },
  {
    id: 5,
    title: 'Modern UI/UX Design Principles & Design System Testing',
    slug: 'modern-ui-ux-design-principles',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    level: 'beginner',
    duration_hours: 1,
    duration_minutes: 0,
    total_questions: 35,
    pass_mark: 70,
    price: 29.99,
    discount: 1,
    discount_price: 14.99,
    pricing_type: 'paid',
    short_description: 'Validate your grasp on visual hierarchy, OKLCH color token systems, WCAG 2.2 contrast compliance, and micro-interaction states.',
    description: 'Validate your grasp on visual hierarchy, OKLCH color token systems, WCAG 2.2 contrast compliance, and micro-interaction states.',
    status: 'approved',
    exam_category_id: 1,
    instructor_id: 1
  },
  {
    id: 6,
    title: 'Python Data Science & Algorithmic Problem Solving',
    slug: 'python-data-science-algorithms',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    level: 'beginner',
    duration_hours: 1,
    duration_minutes: 0,
    total_questions: 40,
    pass_mark: 70,
    price: 0,
    discount: 0,
    discount_price: null,
    pricing_type: 'free',
    short_description: 'Foundational algorithmic challenge examining Pandas data wrangling, NumPy vectorization, and data structures.',
    description: 'Foundational algorithmic challenge examining Pandas data wrangling, NumPy vectorization, and data structures.',
    status: 'approved',
    exam_category_id: 1,
    instructor_id: 1
  }
]

for (const ex of examsToSync) {
  const existing = db.prepare('SELECT id FROM exams WHERE slug = ?').get(ex.slug)
  if (!existing) {
    db.prepare(`
      INSERT INTO exams (id, title, slug, thumbnail, level, duration_hours, duration_minutes, total_questions, pass_mark, price, discount, discount_price, pricing_type, short_description, description, status, exam_category_id, instructor_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(ex.id, ex.title, ex.slug, ex.thumbnail, ex.level, ex.duration_hours, ex.duration_minutes, ex.total_questions, ex.pass_mark, ex.price, ex.discount, ex.discount_price, ex.pricing_type, ex.short_description, ex.description, ex.status, ex.exam_category_id, ex.instructor_id)
    console.log('Inserted exam:', ex.slug)
  } else {
    console.log('Exam already exists:', ex.slug)
  }
}
