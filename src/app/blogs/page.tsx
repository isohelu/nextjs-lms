import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Clock, ArrowRight, Grid, List, Tag } from 'lucide-react'
import BlogCard, { BlogData } from '@/components/cards/BlogCard'

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Articles, architectural tutorials, and career insights from industry-leading practitioners.',
  openGraph: {
    title: 'Blogs | Mentor Learning Management System',
    description: 'Articles, architectural tutorials, and career insights.',
  },
}

export const BLOG_POSTS: (BlogData & { category: string; description: string })[] = [
  {
    id: 1,
    uuid: 'nextjs-15-architecture-deep-dive',
    slug: 'nextjs-15-architecture-deep-dive',
    title: 'Next.js 15 Deep Dive: Server Components, Streaming SSR & Dynamic Nonce Security',
    summary: 'An architectural exploration of React 19 Server Components, streaming boundary strategies, and hardened CSP implementations in production.',
    description: `Next.js 15 represents a major milestone for enterprise full-stack web applications. With native React 19 support, Server Actions, and enhanced caching semantics, engineers have unprecedented control over how server and client workloads interact.

In this deep dive, we explore how streaming SSR boundary strategies prevent hydration waterfalls and how dynamic cryptographic nonces ensure bulletproof Content-Security-Policy enforcement without sacrificing static caching.`,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    published_at: 'Feb 18, 2025',
    read_time: '8 min read',
    author_name: 'Sarah Jenkins',
    author_avatar: '/assets/avatars/avatar-2.png',
  },
  {
    id: 2,
    uuid: 'scaling-postgresql-vector-embeddings-supabase',
    slug: 'scaling-postgresql-vector-embeddings-supabase',
    title: 'Scaling Vector Similarity Search with pgvector and Supabase in 2025',
    summary: 'How to design high-throughput semantic search and retrieval-augmented generation pipelines using PostgreSQL HNSW indexes.',
    description: `As generative AI applications mature, having vector databases tightly coupled with relational application data is becoming the industry gold standard.

By utilizing pgvector on Supabase with HNSW indexing, queries on millions of 1536-dimensional embeddings can execute in sub-10ms latency while preserving row-level security.`,
    category: 'Database & AI',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    published_at: 'Feb 12, 2025',
    read_time: '12 min read',
    author_name: 'Rachel Adams',
    author_avatar: '/assets/avatars/avatar-3.png',
  },
  {
    id: 3,
    uuid: 'mastering-design-systems-with-tailwind-v4',
    slug: 'mastering-design-systems-with-tailwind-v4',
    title: 'Building Modern Design Systems with Tailwind CSS v4 and OKLCH Tokens',
    summary: 'A complete guide to CSS-first configurations, perceptual color harmony, and fluid container queries for modern frontend interfaces.',
    description: `Tailwind CSS v4 revolutionizes frontend styling by shifting configuration from JavaScript into native CSS @theme blocks. Combined with OKLCH color spaces, design systems gain consistent contrast across both light and dark modes.

In this guide, we break down step-by-step token structuring, accessible contrast verification, and responsive component libraries.`,
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    published_at: 'Jan 28, 2025',
    read_time: '6 min read',
    author_name: 'Jessica Miller',
    author_avatar: '/assets/avatars/avatar-4.png',
  },
  {
    id: 4,
    uuid: 'zero-downtime-kubernetes-deployments',
    slug: 'zero-downtime-kubernetes-deployments',
    title: 'Zero-Downtime Microservices Deployments on Kubernetes with GitOps',
    summary: 'Automating multi-cluster canary releases, health probes, and rollback triggers using ArgoCD and Linkerd service mesh.',
    description: `Deploying updates without dropping a single active customer HTTP connection requires disciplined orchestration.

We examine how combining Linkerd traffic splits with ArgoCD automated progressive delivery allows engineering teams to ship hundreds of deployments per week safely.`,
    category: 'DevOps & Cloud',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    published_at: 'Jan 15, 2025',
    read_time: '10 min read',
    author_name: 'Michael Chang',
    author_avatar: '/assets/avatars/avatar-1.png',
  },
  {
    id: 5,
    uuid: 'owasp-top-10-application-security-guide',
    slug: 'owasp-top-10-application-security-guide',
    title: 'The Developer Guide to Defending Against OWASP Top 10 Web Vulnerabilities',
    summary: 'Practical code patterns to eliminate SQL injections, IDOR, SSRF, and cross-site scripting in modern TypeScript backends.',
    description: `Application security is not something to bolt on at the end of the development cycle. It must be foundational to every line of code written.

This article reviews the latest OWASP Top 10 threat vectors with concrete defensive examples in Node.js, Next.js middleware, and Zod input sanitization.`,
    category: 'Cybersecurity',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    published_at: 'Jan 05, 2025',
    read_time: '14 min read',
    author_name: 'Alexander Wright',
    author_avatar: '/assets/avatars/avatar-2.png',
  },
  {
    id: 6,
    uuid: 'how-to-land-senior-engineering-role-2025',
    slug: 'how-to-land-senior-engineering-role-2025',
    title: 'Navigating Tech Career Growth: From Junior Developer to Senior Architect',
    summary: 'A tactical roadmap covering system design interviews, open source contributions, and engineering leadership soft skills.',
    description: `Technical skill is necessary, but high-impact engineering leadership demands communication, trade-off analysis, and cross-functional empathy.

Here is a pragmatic guide to advancing your career and taking ownership of business-critical technical initiatives.`,
    category: 'Career & Growth',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    published_at: 'Dec 22, 2024',
    read_time: '7 min read',
    author_name: 'Dr. Angela Yu',
    author_avatar: '/assets/avatars/avatar-1.png',
  }
]

const CATEGORIES = [
  'All',
  'Web Development',
  'Database & AI',
  'UI/UX Design',
  'DevOps & Cloud',
  'Cybersecurity',
  'Career & Growth'
]

interface BlogPageProps {
  searchParams?: Promise<{
    category?: string
    search?: string
    view?: string
  }>
}

import { blogRepository } from '@/lib/repositories/blogRepository'

export default async function BlogDirectoryPage({ searchParams }: BlogPageProps) {
  const sp = searchParams ? await searchParams : {}
  const selectedCategory = sp?.category || 'All'
  const searchQuery = (sp?.search || '').toLowerCase()
  const viewType = sp?.view === 'list' ? 'list' : 'grid'

  let mappedDbBlogs: typeof BLOG_POSTS = []
  try {
    const { blogs: dbBlogs } = blogRepository.listAll({
      search: searchQuery || undefined,
      limit: 20
    })

    if (dbBlogs && dbBlogs.length > 0) {
      mappedDbBlogs = dbBlogs.map((b) => ({
        id: b.id,
        uuid: b.uuid || b.slug,
        slug: b.slug,
        title: b.title,
        summary: b.description ? b.description.slice(0, 160) + '...' : '',
        description: b.description || '',
        category: b.category_name || 'Web Development',
        thumbnail: b.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        published_at: b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        read_time: '8 min read',
        author_name: b.author_name || 'Sarah Jenkins',
        author_avatar: b.author_photo || '/assets/avatars/avatar-2.png',
      }))
    }
  } catch {}

  const allPosts = [...mappedDbBlogs, ...BLOG_POSTS]
  const uniquePosts = Array.from(new Map(allPosts.map((p) => [p.slug, p])).values())

  const filteredBlogs = uniquePosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery) ||
      post.summary?.toLowerCase().includes(searchQuery)

    return matchesCategory && matchesSearch
  })

  const featuredPost = filteredBlogs[0] || BLOG_POSTS[0]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <div className="max-w-3xl space-y-4">
        <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
          Articles & Insights
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Engineering Insights, Guides & Industry Perspectives
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Stay ahead of the technology curve with in-depth architectural guides, tutorials, and career insights written by industry practitioners.
        </p>
      </div>

      {/* Featured Banner Post */}
      {selectedCategory === 'All' && !searchQuery && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm group">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 relative h-72 sm:h-96 w-full overflow-hidden bg-muted">
              <img
                src={featuredPost.thumbnail}
                alt={featuredPost.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-10 space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">{featuredPost.category}</Badge>
                <span>•</span>
                <span>{featuredPost.published_at}</span>
                <span>•</span>
                <span>{featuredPost.read_time}</span>
              </div>

              <Link href={`/blogs/${featuredPost.slug}`}>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPost.summary}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={featuredPost.author_avatar}
                  alt={featuredPost.author_name}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-xs font-semibold text-foreground">{featuredPost.author_name}</p>
                  <p className="text-[11px] text-muted-foreground">Lead Contributor</p>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/blogs/${featuredPost.slug}`}>
                  <Button size="sm" className="font-semibold text-xs">
                    Read Full Article
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/blogs' : `/blogs?category=${encodeURIComponent(cat)}`}
              >
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  className="text-xs font-semibold rounded-full"
                >
                  {cat}
                </Button>
              </Link>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          Showing {filteredBlogs.length} articles
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}
