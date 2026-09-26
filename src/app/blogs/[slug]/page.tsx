import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MessageSquare,
  CheckCircle2
} from 'lucide-react'
import { BLOG_POSTS } from '../page'

import { blogRepository } from '@/lib/repositories/blogRepository'
import BlogCommentsSection from '@/components/blogs/BlogCommentsSection'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const dbBlog = blogRepository.findBySlug(slug) || blogRepository.findByUuid(slug)
  const fallback = BLOG_POSTS.find((p) => p.slug === slug || p.uuid === slug) || BLOG_POSTS[0]
  const title = dbBlog?.title || fallback.title
  const description = dbBlog?.description ? dbBlog.description.slice(0, 160) : fallback.summary
  const thumbnail = dbBlog?.thumbnail || fallback.thumbnail

  return {
    title: `${title} | Mentor LMS Blog`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: thumbnail || '', width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const dbBlog = blogRepository.findBySlug(slug) || blogRepository.findByUuid(slug)
  const dbComments = dbBlog ? blogRepository.getComments(dbBlog.id) : []

  const mappedComments = dbComments.map((c) => ({
    id: c.id,
    author: c.user_name || 'Verified Learner',
    avatar: c.user_photo || '/assets/avatars/avatar-2.png',
    time: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
    content: c.content,
  }))

  const fallback = BLOG_POSTS.find((p) => p.slug === slug || p.uuid === slug) || {
    ...BLOG_POSTS[0],
    title: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug,
  }

  const post = dbBlog
    ? {
        ...fallback,
        id: dbBlog.id,
        uuid: dbBlog.uuid,
        slug: dbBlog.slug,
        title: dbBlog.title,
        summary: dbBlog.description ? dbBlog.description.slice(0, 180) + '...' : fallback.summary,
        description: dbBlog.description || fallback.description,
        thumbnail: dbBlog.thumbnail || fallback.thumbnail,
        author_name: dbBlog.author_name || fallback.author_name,
        author_avatar: dbBlog.author_photo || fallback.author_avatar,
      }
    : fallback

  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3)

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.thumbnail,
    datePublished: '2025-02-15T08:00:00Z',
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mentor LMS',
      url: 'https://mentorlms.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <article className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {post.published_at}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.read_time}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Author Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={post.author_avatar} alt={post.author_name} />
                <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-foreground">{post.author_name}</p>
                <p className="text-xs text-muted-foreground">Lead Technical Specialist</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Bookmark className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {post.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-md">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Prose Body Content */}
        <div className="prose dark:prose-invert max-w-none text-foreground/90 space-y-6 leading-relaxed">
          <p className="text-lg font-medium text-muted-foreground leading-relaxed">
            {post.summary}
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-foreground pt-4">
            1. The Evolution of Full-Stack Architecture
          </h2>
          <p>
            Modern applications require performance guarantees that legacy client-side SPAs struggle to deliver. By shifting the computational load closer to data stores through React Server Components and Edge runtimes, round-trip latency is reduced dramatically.
          </p>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm space-y-2">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Core Architectural Principle
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Always isolate client interactivity to leaf components while orchestrating data queries in async Server Components. This keeps the client JavaScript bundle minimal and eliminates waterfall network requests.
            </p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground pt-4">
            2. Hardening Security: Nonce CSP and OWASP Best Practices
          </h2>
          <p>
            Zero-trust application security mandates strict Content Security Policies. Using static hash headers is insufficient when scripts need dynamic runtime hydration. Generating cryptographically random nonces inside Next.js edge middleware prevents any unauthorized script execution or cross-site scripting vulnerabilities.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-foreground pt-4">
            3. Summary and Key Takeaways
          </h2>
          <p>
            Building production-ready systems is an exercise in managing trade-offs. By combining Next.js 15, PostgreSQL, and strict design token systems, teams can deliver applications that are fast, accessible, and resilient against modern attack surfaces.
          </p>
        </div>

        <Separator />

        {/* Reactions Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 rounded-xl bg-card border border-border px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">Was this article helpful?</span>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ThumbsUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              Helpful (142)
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ThumbsDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              (3)
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{mappedComments.length > 0 ? mappedComments.length : 2} Comments</span>
          </div>
        </div>

        {/* Comments Section */}
        <BlogCommentsSection slug={post.slug} initialComments={mappedComments} />

        {/* Related Articles */}
        <div className="space-y-4 pt-8 border-t border-border">
          <h3 className="text-xl font-bold text-foreground">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blogs/${related.slug}`}
                className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <Badge variant="secondary" className="text-[10px] mb-2">
                    {related.category}
                  </Badge>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {related.read_time}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}
