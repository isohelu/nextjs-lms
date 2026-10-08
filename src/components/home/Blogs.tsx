'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  BlogSectionData,
  DEFAULT_BLOG_SECTION_DATA,
} from '@/lib/data/blog-section'

interface BlogsProps {
  initialData?: Partial<BlogSectionData>
}

export default function Blogs({ initialData }: BlogsProps) {
  const data: BlogSectionData = {
    ...DEFAULT_BLOG_SECTION_DATA,
    ...initialData,
  }

  const blogs = data.blogs && data.blogs.length > 0 ? data.blogs : DEFAULT_BLOG_SECTION_DATA.blogs

  return (
    <section className="relative py-14 sm:py-16 lg:py-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* Section Header: Centered & Clean                                          */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {data.titleLine1 || 'Our Latest Blog'} {data.titleLine2 || 'Update'}
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3-Column Editorial Grid of Articles                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 lg:gap-x-9 lg:gap-y-12 items-start">
          {blogs.map((blog) => (
            <article key={blog.id} className="group flex flex-col">
              {/* Image Container with smooth rounded corners */}
              <Link
                href={`/blogs/${blog.slug}`}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800 shadow-2xs"
              >
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </Link>

              {/* Category Label */}
              <div className="mt-3.5 mb-1.5">
                <span className="text-[13px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {blog.category}
                </span>
              </div>

              {/* Post Title */}
              <Link href={`/blogs/${blog.slug}`}>
                <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-slate-700 dark:group-hover:text-[#D8FC38]">
                  {blog.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>

        {/* Bottom CTA Button: Centered */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            href={data.buttonUrl || '/blogs'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#E2FD70] hover:bg-[#D8FC38] text-slate-950 font-bold text-sm transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
          >
            <span>{data.buttonText || 'Browse All Articles'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  )
}
