'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Star, TrendingUp, Users, Heart, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CourseData {
  id: string | number
  title: string
  slug: string
  thumbnail?: string
  enrollments_count?: number
  lessons_duration?: number | string
  average_rating?: number
  reviews_count?: number
  price?: number
  discount?: boolean
  discount_price?: number
  pricing_type?: 'free' | 'paid'
  instructor_name?: string
  instructor_avatar?: string
  instructor_designation?: string
  category_name?: string
  badge?: string
  level?: string
  lessons_count?: number
}

interface CourseCardProps {
  course: CourseData
  className?: string
  index?: number
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const isFree = course.pricing_type === 'free' || course.price === 0

  // Format lesson duration
  const formattedDuration =
    typeof course.lessons_duration === 'number'
      ? `${Math.round(course.lessons_duration / 3600)} hrs`
      : course.lessons_duration || '32 hrs'

  // Curated fallback thumbnail
  const fallbackThumb = '/assets/images/students-1.jpg'
  const displayThumbnail =
    imageError || !course.thumbnail || course.thumbnail.trim() === ''
      ? fallbackThumb
      : course.thumbnail

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-card-foreground shadow-xs overflow-hidden select-none transition-[border-color,box-shadow] duration-200 hover:border-[#D8FC38]/70 dark:hover:border-[#D8FC38]/70 hover:shadow-md',
        className
      )}
    >
      <div className="relative z-10">
        {/* ========================================================================= */}
        {/* 1. Media Artwork (rounded-t-2xl, inner subtle zoom, wishlist tactile btn) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link
            href={`/courses/${course.slug}`}
            className="block relative h-[210px] sm:h-[225px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
          >
            <Image
              src={displayThumbnail}
              alt={course.title}
              fill
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {/* Wishlist Heart Button: subtle tactile active feedback */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsWishlisted(!isWishlisted)
            }}
            aria-label="Add to wishlist"
            className="absolute top-3 right-3 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all hover:bg-white dark:hover:bg-slate-900 active:scale-95 cursor-pointer"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isWishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
              )}
            />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. Card Body: Category, Price, Title, Stats & Instructor                  */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 pb-3">
          
          {/* Top Row: Category (Left) and Price (Right) */}
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-md bg-[#D8FC38]/20 px-2.5 py-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              {course.category_name || 'Development'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {course.discount && course.discount_price ? (
                <>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 line-through">
                    ${course.price}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${course.discount_price}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isFree ? 'Free' : `$${course.price ?? 89}`}
                </span>
              )}
            </div>
          </div>

          {/* Course Title: clean Inter font-bold, natural letter-spacing */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-2 min-h-[50px] leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Rating & Enrolled Students */}
          <div className="flex items-center gap-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-normal">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {course.average_rating ? Number(course.average_rating).toFixed(1) : '4.9'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ({course.reviews_count || 146})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {course.enrollments_count || 215}
              </span>
              <span className="text-slate-500 dark:text-slate-400">Students</span>
            </div>
          </div>

          {/* Instructor Profile */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative h-6.5 w-6.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700/80">
              <Image
                src={course.instructor_avatar || '/assets/avatars/avatar-1.png'}
                alt={course.instructor_name || 'Instructor'}
                fill
                sizes="26px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {course.instructor_name || 'Sarah Jenkins'}
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Card Footer: Duration, Level & Action CTA Button                       */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 pt-3 pb-3.5">
        <div className="flex items-center gap-3.5 text-sm text-slate-600 dark:text-slate-400 font-normal">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDuration}</span>
          </div>

          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
            <span>{course.level || 'Intermediate'}</span>
          </div>
        </div>

        {/* Action CTA Button ("Enroll Now"): Brand Electric Lime #D8FC38 with #CBF128 hover */}
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="group/btn relative inline-flex items-center justify-center rounded-lg bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 text-xs sm:text-sm font-semibold px-3.5 py-1.5 transition-all duration-200 shadow-2xs active:scale-[0.98] cursor-pointer select-none">
            <span>Enroll Now</span>
            <span className="inline-flex items-center ml-1 transition-transform duration-200 ease-out group-hover:translate-x-[3px]">
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
