export interface ProductFile {
  id: number | string
  name: string
  size: string
  extension: string
  url: string
}

export interface ProductSpecification {
  id: number | string
  title: string
  value: string
}

export interface ProductFaq {
  id: number | string
  question: string
  answer: string
}

export interface ProductReview {
  id: number | string
  user: {
    id: number | string
    name: string
    photo?: string
  }
  rating: number
  review: string
  created_at: string
}

export interface ProductItem {
  id: number
  title: string
  slug: string
  thumbnail: string
  images: { id: number; url: string }[]
  price: number
  discount: boolean
  discount_price: number | null
  pricing_type: 'free' | 'paid'
  featured: boolean
  inventory?: number
  unlimited_inventory: boolean
  status: 'approved' | 'pending' | 'draft'
  orders_count: number
  average_rating: number
  reviews_count: number
  summary: string
  description: string
  product_category: {
    id: number
    title: string
    slug: string
    description?: string
  }
  instructor: {
    id: number
    user: {
      id: number
      name: string
      email: string
      photo?: string
      bio?: string
    }
  }
  specifications: ProductSpecification[]
  faqs: ProductFaq[]
  reviews: ProductReview[]
  files: ProductFile[]
}

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: 1,
    title: 'Enterprise React & Next.js 15 Component Design System',
    slug: 'enterprise-nextjs-15-design-system',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80' },
      { id: 2, url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80' },
      { id: 3, url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 49,
    discount: true,
    discount_price: 29,
    pricing_type: 'paid',
    featured: true,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 520,
    average_rating: 4.95,
    reviews_count: 34,
    summary: 'A battle-tested design system and component architecture built for modern enterprise web applications. Designed for Next.js 15 App Router and React Server Components.',
    description: `### Enterprise-Grade React 19 & Next.js 15 Component Architecture

This production-tested design system provides over 85+ accessible, responsive, and beautifully crafted UI components engineered specifically for high-scale enterprise applications.

#### Key Features:
- **Zero Runtime Overhead**: Built using native Tailwind CSS v4 and OKLCH color spaces.
- **Server Components First**: Optimized for Next.js 15 App Router, minimizing client JavaScript bundles.
- **WCAG 2.2 AA Accessible**: Full keyboard navigation, ARIA roles, and screen-reader compliance.
- **Figma Tokens Included**: Synchronized Figma component library with variants, autolayout v5, and design tokens.
- **Lifetime Updates**: Receive all future component additions, bugfixes, and framework upgrades.`,
    product_category: {
      id: 1,
      title: 'UI Kits & Templates',
      slug: 'ui-kits-templates',
      description: 'Production-ready templates, Figma kits, and code libraries for modern developers.'
    },
    instructor: {
      id: 1,
      user: {
        id: 2,
        name: 'David Miller',
        email: 'david@mentor.test',
        photo: '/assets/images/students-1.jpg',
        bio: 'Senior Design Systems Architect with 12+ years experience building frontend infrastructures for Fortune 500 tech companies.'
      }
    },
    specifications: [
      { id: 1, title: 'Framework', value: 'Next.js 15 & React 19' },
      { id: 2, title: 'Styling', value: 'Tailwind CSS v4' },
      { id: 3, title: 'TypeScript', value: '100% Strict Type Coverage' },
      { id: 4, title: 'File Size', value: '42.8 MB (ZIP + Figma)' },
      { id: 5, title: 'License', value: 'Commercial & Unlimited Projects' },
      { id: 6, title: 'Accessibility', value: 'WCAG 2.2 AA Compliant' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Can I use this design system in commercial client projects?',
        answer: 'Yes! The commercial license allows unlimited use in personal, client, and commercial software applications without attribution.'
      },
      {
        id: 2,
        question: 'How do I receive updates when new components are added?',
        answer: 'You will receive immediate email notifications and can re-download the latest package directly from your Mentor LMS Purchases dashboard.'
      },
      {
        id: 3,
        question: 'Is technical support included?',
        answer: 'Yes, our team provides dedicated Discord and GitHub Discussions support for installation and integration queries.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 101, name: 'Sarah Jenkins', photo: '/assets/images/students-2.jpg' },
        rating: 5,
        review: 'Saved our engineering team at least 3 months of UI groundwork. The TypeScript typing and accessibility primitives are flawlessly done.',
        created_at: '2026-09-12'
      },
      {
        id: 2,
        user: { id: 102, name: 'Robert Fox', photo: '/assets/images/students-3.jpg' },
        rating: 5,
        review: 'The best Next.js 15 design system available. The Figma tokens sync cleanly with the codebase.',
        created_at: '2026-09-08'
      }
    ],
    files: [
      { id: 1, name: 'nextjs-15-design-system-v2.4.zip', size: '28.4 MB', extension: 'zip', url: '#' },
      { id: 2, name: 'mentor-figma-components-tokens.fig', size: '14.2 MB', extension: 'fig', url: '#' },
      { id: 3, name: 'architecture-documentation.pdf', size: '2.1 MB', extension: 'pdf', url: '#' }
    ]
  },
  {
    id: 2,
    title: 'Modern Microservices Architecture Blueprint & Docker Stack',
    slug: 'modern-microservices-blueprint',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80' },
      { id: 2, url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 39,
    discount: false,
    discount_price: null,
    pricing_type: 'paid',
    featured: true,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 310,
    average_rating: 4.88,
    reviews_count: 22,
    summary: 'A turnkey Docker Compose & Kubernetes blueprint for event-driven microservices featuring Kafka, Redis, PostgreSQL, and Traefik reverse proxy.',
    description: `### Complete Distributed Microservices Infrastructure

Deploy a high-availability, self-healing microservice cluster in minutes. Includes production-ready configurations for Docker Swarm, Docker Compose, and Kubernetes manifests.

#### What's Included:
- **API Gateway & Routing**: Traefik v3 with automated Let's Encrypt SSL and rate limiting.
- **Message Bus**: Apache Kafka and RabbitMQ event streaming clusters with Dead Letter Queues.
- **Caching & Identity**: Redis cluster for distributed session storage and OAuth2 integration.
- **Observability**: Prometheus metrics, Grafana dashboards, and Jaeger distributed tracing.`,
    product_category: {
      id: 2,
      title: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'Infrastructure as code, Kubernetes manifests, and cloud automation scripts.'
    },
    instructor: {
      id: 2,
      user: {
        id: 3,
        name: 'Alexander Wright',
        email: 'alex@mentor.test',
        photo: '/assets/images/students-3.jpg',
        bio: 'Principal Cloud Systems Engineer with over 15 years experience designing resilient distributed systems.'
      }
    },
    specifications: [
      { id: 1, title: 'Container Engine', value: 'Docker Compose & Kubernetes 1.30+' },
      { id: 2, title: 'Message Broker', value: 'Apache Kafka & RabbitMQ' },
      { id: 3, title: 'Database', value: 'PostgreSQL 16 High-Availability' },
      { id: 4, title: 'Observability', value: 'Prometheus, Grafana, Jaeger' },
      { id: 5, title: 'License', value: 'Commercial Unlimited' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Does this run on local machines for development?',
        answer: 'Yes! A single `docker compose up` starts the entire local developer environment with mock services and seeded test data.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 103, name: 'Marcus Chen', photo: '/assets/images/students-1.jpg' },
        rating: 5,
        review: 'Incredible time saver. Clean compose files and production-grade Kubernetes yamls.',
        created_at: '2026-09-14'
      }
    ],
    files: [
      { id: 1, name: 'microservices-blueprint-stack.zip', size: '18.7 MB', extension: 'zip', url: '#' },
      { id: 2, name: 'deployment-runbook.pdf', size: '3.4 MB', extension: 'pdf', url: '#' }
    ]
  },
  {
    id: 3,
    title: 'Comprehensive OWASP Cybersecurity Checklist & Audit Suite',
    slug: 'owasp-cybersecurity-audit-suite',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 59,
    discount: true,
    discount_price: 39,
    pricing_type: 'paid',
    featured: false,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 890,
    average_rating: 5.0,
    reviews_count: 48,
    summary: 'The definitive enterprise web security checklist covering OWASP Top 10 2026, API security guidelines, penetration testing templates, and compliance scripts.',
    description: `### Enterprise Application Security & Compliance Kit

Ensure your applications comply with ISO 27001, SOC 2, and OWASP recommendations. Includes automated vulnerability scanning scripts, HTTP header audit tools, and comprehensive risk mitigation matrices.`,
    product_category: {
      id: 3,
      title: 'Security',
      slug: 'security',
      description: 'Security testing toolkits, audit checklists, and hardening guides.'
    },
    instructor: {
      id: 3,
      user: {
        id: 4,
        name: 'Dr. Sarah Jenkins',
        email: 'sarah@mentor.test',
        photo: '/assets/images/students-2.jpg',
        bio: 'Chief Information Security Officer and certified ethical hacker.'
      }
    },
    specifications: [
      { id: 1, title: 'Standard', value: 'OWASP Top 10 & API Security 2026' },
      { id: 2, title: 'Compliance', value: 'SOC 2, ISO 27001, GDPR' },
      { id: 3, title: 'Formats', value: 'PDF, Interactive Excel, Notion Template' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Can I share this checklist with my internal engineering team?',
        answer: 'Yes! The team license grants organization-wide distribution rights for internal security audits.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 104, name: 'Elena Rostova', photo: '/assets/images/students-1.jpg' },
        rating: 5,
        review: 'Helped us pass our SOC 2 Type II audit with zero major findings. Highly recommended.',
        created_at: '2026-09-02'
      }
    ],
    files: [
      { id: 1, name: 'owasp-security-audit-suite.zip', size: '12.6 MB', extension: 'zip', url: '#' },
      { id: 2, name: 'compliance-audit-matrix.xlsx', size: '4.8 MB', extension: 'xlsx', url: '#' }
    ]
  },
  {
    id: 4,
    title: 'Production PostgreSQL Indexing Cheatsheet & SQL Scripts',
    slug: 'postgresql-indexing-cheatsheet',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 0,
    discount: false,
    discount_price: null,
    pricing_type: 'free',
    featured: true,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 2400,
    average_rating: 4.92,
    reviews_count: 110,
    summary: 'A free, comprehensive cheat sheet covering B-Tree, GIN, GiST, BRIN indexing, query performance tuning scripts, and slow-query diagnostic tools.',
    description: `### Master High-Performance PostgreSQL Queries

Learn how to optimize database read/write throughput by 10x with real-world query execution plan analysis and index selection heuristics. Free for all students and developers.`,
    product_category: {
      id: 4,
      title: 'Database',
      slug: 'database',
      description: 'Database optimization guides, query playbooks, and migration scripts.'
    },
    instructor: {
      id: 1,
      user: {
        id: 2,
        name: 'David Miller',
        email: 'david@mentor.test',
        photo: '/assets/images/students-1.jpg',
        bio: 'Senior Database Architect and performance specialist.'
      }
    },
    specifications: [
      { id: 1, title: 'Database Versions', value: 'PostgreSQL 14, 15, 16+' },
      { id: 2, title: 'Price', value: '100% Free Community Resource' },
      { id: 3, title: 'Contents', value: 'SQL Scripts & High-Res PDF' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Is this completely free?',
        answer: 'Yes! You can claim it instantly with one click and download the complete bundle.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 105, name: 'Alex Johnson', photo: '/assets/images/students-3.jpg' },
        rating: 5,
        review: 'The BRIN and GIN indexing examples cleared up months of confusion. Fantastic resource!',
        created_at: '2026-09-18'
      }
    ],
    files: [
      { id: 1, name: 'postgresql-performance-cheatsheet.pdf', size: '5.2 MB', extension: 'pdf', url: '#' },
      { id: 2, name: 'diagnostic-queries.sql', size: '34 KB', extension: 'sql', url: '#' }
    ]
  },
  {
    id: 5,
    title: 'Autonomous AI Agent Prompts & LangChain Workflow Templates',
    slug: 'ai-agent-prompts-langchain-templates',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 79,
    discount: true,
    discount_price: 49,
    pricing_type: 'paid',
    featured: true,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 740,
    average_rating: 4.97,
    reviews_count: 65,
    summary: 'Battle-tested system prompt chains, LangGraph multi-agent templates, tool execution guards, and vector search evaluation scripts.',
    description: `### Production-Ready Autonomous AI Agent Workflows

Build self-correcting, tool-using autonomous AI agents. Includes complete code implementations for LangGraph, OpenAI Assistant API, and local Ollama integrations with automated evaluation harnesses.`,
    product_category: {
      id: 5,
      title: 'AI Engineering',
      slug: 'ai-engineering',
      description: 'Agentic workflows, prompt libraries, and LLMOps deployment templates.'
    },
    instructor: {
      id: 4,
      user: {
        id: 5,
        name: 'Elena Rostova',
        email: 'elena@mentor.test',
        photo: '/assets/images/students-2.jpg',
        bio: 'AI Research Engineer specializing in autonomous multi-agent reasoning systems.'
      }
    },
    specifications: [
      { id: 1, title: 'Frameworks', value: 'LangGraph, LangChain, PydanticAI' },
      { id: 2, title: 'Language', value: 'Python 3.11+ & TypeScript' },
      { id: 3, title: 'Models Supported', value: 'Claude 3.7, GPT-4o, Llama 3.3' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Are sample API keys or mocks included for testing?',
        answer: 'Yes! Mock responses and integration tests are provided so you can run all agent pipelines without paying API fees.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 106, name: 'Michael Chang', photo: '/assets/images/students-1.jpg' },
        rating: 5,
        review: 'The structured output retry loops and tool execution guards are pure gold for production agents.',
        created_at: '2026-09-17'
      }
    ],
    files: [
      { id: 1, name: 'ai-agent-workflows-python.zip', size: '32.1 MB', extension: 'zip', url: '#' },
      { id: 2, name: 'multi-agent-orchestration-guide.pdf', size: '4.6 MB', extension: 'pdf', url: '#' }
    ]
  },
  {
    id: 6,
    title: 'Complete SaaS Landing Page Framer & Tailwind Source',
    slug: 'saas-landing-page-framer-source',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    images: [
      { id: 1, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80' }
    ],
    price: 35,
    discount: false,
    discount_price: null,
    pricing_type: 'paid',
    featured: false,
    unlimited_inventory: true,
    status: 'approved',
    orders_count: 430,
    average_rating: 4.85,
    reviews_count: 19,
    summary: 'A conversion-optimized SaaS marketing website template built in React and Framer with responsive animations, pricing toggles, and testimonial carousels.',
    description: `### Ultra High-Converting SaaS Landing Page

Designed to boost trial signups and customer trust. Fully responsive with fluid typography, dark mode support, interactive demo tabs, and smooth GSAP micro-animations.`,
    product_category: {
      id: 1,
      title: 'UI Kits & Templates',
      slug: 'ui-kits-templates',
      description: 'Production-ready templates, Figma kits, and code libraries for modern developers.'
    },
    instructor: {
      id: 1,
      user: {
        id: 2,
        name: 'David Miller',
        email: 'david@mentor.test',
        photo: '/assets/images/students-1.jpg',
        bio: 'Senior Design Systems Architect.'
      }
    },
    specifications: [
      { id: 1, title: 'Format', value: 'React 19 + Framer Motion + Next.js' },
      { id: 2, title: 'Responsive', value: 'Mobile, Tablet, Desktop 4K' },
      { id: 3, title: 'Dark Mode', value: 'Automatic & Toggleable' }
    ],
    faqs: [
      {
        id: 1,
        question: 'Can I deploy directly to Vercel?',
        answer: 'Yes! One-click deploy button and environment config guide are included.'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { id: 107, name: 'Lisa Ray', photo: '/assets/images/students-3.jpg' },
        rating: 5,
        review: 'Setup took under 15 minutes. Very high visual fidelity and clean component organization.',
        created_at: '2026-09-10'
      }
    ],
    files: [
      { id: 1, name: 'saas-landing-page-source.zip', size: '22.0 MB', extension: 'zip', url: '#' }
    ]
  }
]

export function getProductById(id: number | string): ProductItem | undefined {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id
  return PRODUCTS_DATA.find((p) => p.id === numId)
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS_DATA.find((p) => p.slug === slug)
}

export function getProductBySlugOrId(identifier: string): ProductItem | undefined {
  const numId = parseInt(identifier, 10)
  if (!isNaN(numId)) {
    const byId = getProductById(numId)
    if (byId) return byId
  }
  return getProductBySlug(identifier)
}

export function getAllCategories() {
  const map = new Map<string, { id: number; title: string; slug: string; count: number }>()
  for (const prod of PRODUCTS_DATA) {
    const cat = prod.product_category
    if (map.has(cat.slug)) {
      map.get(cat.slug)!.count += 1
    } else {
      map.set(cat.slug, { id: cat.id, title: cat.title, slug: cat.slug, count: 1 })
    }
  }
  return Array.from(map.values())
}
