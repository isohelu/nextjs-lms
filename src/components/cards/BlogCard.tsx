'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, Calendar } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface BlogData {
  id: string | number
  uuid: string
  title: string
  slug: string
  thumbnail?: string
  published_at?: string
  read_time?: string
  author_name?: string
  author_avatar?: string
  summary?: string
}

export default function BlogCard({
  blog,
  className,
}: {
  blog: BlogData
  className?: string
}) {
  return (
    <Card
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-300 shadow-card hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="p-0">
        <div className="p-2.5 pb-0">
          <Link href={`/blogs/${blog.uuid || blog.slug}`}>
            <div className="relative h-[190px] w-full overflow-hidden rounded-xl bg-muted">
              <img
                src={blog.thumbnail || '/assets/images/blank-image.jpg'}
                alt={blog.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/assets/images/blank-image.jpg'
                }}
              />
            </div>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pb-2">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{blog.published_at || 'Recently'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{blog.read_time || '5 min read'}</span>
          </div>
        </div>

        <Link href={`/blogs/${blog.uuid || blog.slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary-foreground">
            {blog.title}
          </h3>
        </Link>

        {blog.summary && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {blog.summary}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-2 p-4 pt-2 border-t border-border/40">
        <img
          src={blog.author_avatar || '/assets/avatars/avatar-1.png'}
          alt={blog.author_name || 'Author'}
          className="h-7 w-7 rounded-full object-cover"
        />
        <span className="text-xs font-medium text-foreground">
          {blog.author_name || 'Admin'}
        </span>
      </CardFooter>
    </Card>
  )
}
