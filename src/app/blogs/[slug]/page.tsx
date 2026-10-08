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
} from 'lucide-react'
import { BLOG_POSTS } from '../page'
import { blogRepository } from '@/lib/repositories/blogRepository'
import BlogCommentsSection from '@/components/blogs/BlogCommentsSection'
import '@/components/rich-editor/style/editor.css'

export const dynamic = 'force-dynamic'

function stripHtml(html?: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
}

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
  const cleanDescription = stripHtml(dbBlog?.description) || fallback.summary || ''
  const thumbnail = dbBlog?.thumbnail || fallback.thumbnail

  return {
    title: `${title} | Mentor LMS Blog`,
    description: cleanDescription.slice(0, 160),
    openGraph: {
      title,
      description: cleanDescription.slice(0, 160),
      images: [{ url: thumbnail || '', width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanDescription.slice(0, 160),
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

  const cleanDbSummary = stripHtml(dbBlog?.description)

  const post = dbBlog
    ? {
        ...fallback,
        id: dbBlog.id,
        uuid: dbBlog.uuid,
        slug: dbBlog.slug,
        title: dbBlog.title,
        summary: cleanDbSummary ? cleanDbSummary.slice(0, 180) + '...' : fallback.summary,
        description: dbBlog.description || fallback.description,
        thumbnail: dbBlog.thumbnail || fallback.thumbnail,
        author_name: dbBlog.author_name || fallback.author_name,
        author_avatar: dbBlog.author_photo || fallback.author_avatar,
        category: dbBlog.category_name || fallback.category || 'Technology',
        published_at: dbBlog.created_at
          ? new Date(dbBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : fallback.published_at,
      }
    : fallback

  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id && p.slug !== post.slug).slice(0, 3)

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

        {/* Article Header: Category, Date, Read Time & Title */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold border-transparent">
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
              {post.read_time || '5 min read'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Hero Image / Thumbnail */}
        {post.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-md">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Author Bar & Actions (Positioned directly below the thumbnail) */}
        <div className="flex items-center justify-between py-3 border-y border-border/60">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={post.author_avatar} alt={post.author_name} />
              <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-foreground">{post.author_name}</p>
              <p className="text-xs text-muted-foreground">Author & Contributor</p>
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

        {/* Dynamic Rich HTML Article Content */}
        <div className="rte-renderer prose prose-lg dark:prose-invert max-w-none text-foreground/90 space-y-4 leading-relaxed pt-2 [&_img]:rounded-xl [&_img]:my-4 [&_img]:shadow-sm">
          {post.description ? (
            <div
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          ) : (
            <p className="text-muted-foreground italic">No article content provided.</p>
          )}
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
                className="group rounded-2xl border border-border/80 bg-card p-5 hover:border-[#D8FC38]/60 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {related.category}
                  </Badge>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-foreground transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
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
