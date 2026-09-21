import React from 'react'
import BlogCard, { BlogData } from '@/components/cards/BlogCard'

const defaultBlogs: BlogData[] = [
  {
    id: 1,
    uuid: 'nextjs-15-deep-dive',
    slug: 'nextjs-15-deep-dive',
    title: 'Next.js 15 Deep Dive: Server Actions, Nonces & React 19',
    summary:
      'Explore how Next.js 15 and React 19 redefine full-stack web applications with native async Server Components and strict security policies.',
    thumbnail: '/assets/images/students-1.jpg',
    published_at: '2 days ago',
    read_time: '6 min read',
    author_name: 'David Miller',
    author_avatar: '/assets/avatars/avatar-1.png',
  },
  {
    id: 2,
    uuid: 'scaling-supabase-production',
    slug: 'scaling-supabase-production',
    title: 'Architecting High-Throughput Relational Databases with Supabase',
    summary:
      'Learn best practices for indexing, connection pooling with PgBouncer, and Row Level Security for production SaaS platforms.',
    thumbnail: '/assets/images/students-2.jpg',
    published_at: '5 days ago',
    read_time: '8 min read',
    author_name: 'Marcus Chen',
    author_avatar: '/assets/avatars/avatar-3.png',
  },
  {
    id: 3,
    uuid: 'ui-ux-design-systems-2025',
    slug: 'ui-ux-design-systems-2025',
    title: 'Building Enterprise Design Systems with Tailwind v4 and OKLCH',
    summary:
      'A practical guide to implementing consistent, accessible color palettes and micro-interactions across large-scale frontend apps.',
    thumbnail: '/assets/images/students-3.jpg',
    published_at: '1 week ago',
    read_time: '5 min read',
    author_name: 'Sarah Jenkins',
    author_avatar: '/assets/avatars/avatar-4.png',
  },
]

export default function Blogs({ blogs = defaultBlogs }: { blogs?: BlogData[] }) {
  const displayBlogs = blogs.length > 0 ? blogs : defaultBlogs

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-14 text-center md:max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Blogs
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Latest Posts
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Stay up to date with engineering tutorials, industry insights, and
            career guides written by expert educators and tech leaders.
          </p>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayBlogs.slice(0, 3).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  )
}
