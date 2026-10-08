'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, ArrowUpRight } from 'lucide-react'
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
    <div
      className={cn(
        'group flex flex-col justify-between h-full overflow-hidden rounded-[22px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4 transition-all duration-200 hover:shadow-xl hover:border-[#D8FC38]/60',
        className
      )}
    >
      <div>
        {/* Article Image Container: Static & Clean */}
        <div className="relative h-48 w-full overflow-hidden rounded-[16px] bg-slate-100 dark:bg-slate-800">
          <Link href={`/blogs/${blog.uuid || blog.slug}`}>
            <img
              src={blog.thumbnail || '/assets/images/blank-image.jpg'}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/assets/images/blank-image.jpg'
              }}
            />
          </Link>

          {/* Read Time Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-xs">
            <Clock className="h-3.5 w-3.5 text-[#D8FC38]" />
            <span>{blog.read_time || '5 min read'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-4 px-1">
          <Link href={`/blogs/${blog.uuid || blog.slug}`}>
            <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 transition-colors duration-200 hover:text-slate-950 dark:hover:text-white">
              {blog.title}
            </h3>
          </Link>

          {blog.summary && (
            <p className="mt-2.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {blog.summary}
            </p>
          )}
        </div>
      </div>

      {/* Author Footer */}
      <div className="mt-5 flex items-center justify-between pt-3.5 px-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <img
            src={blog.author_avatar || '/assets/avatars/avatar-1.png'}
            alt={blog.author_name || 'Author'}
            className="h-7 w-7 rounded-full object-cover bg-slate-200"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {blog.author_name || 'Staff Practitioner'}
          </span>
        </div>

        <Link
          href={`/blogs/${blog.uuid || blog.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-200 hover:text-[#CBF128] dark:hover:text-[#D8FC38] transition-colors"
        >
          <span>Read</span>
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  )
}
