'use client'

import React from 'react'
import Link from 'next/link'
import { Users, Clock, Star, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CourseData } from './CourseCard'
import { cn } from '@/lib/utils'

export default function CourseCardList({
  course,
  className,
}: {
  course: CourseData
  className?: string
}) {
  const isFree = course.pricing_type === 'free' || course.price === 0

  return (
    <Card
      className={cn(
        'group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/80 bg-card p-0 transition-all duration-200 hover:border-[#D8FC38]/60 hover:shadow-md',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative sm:w-72 shrink-0 p-3 pb-0 sm:pb-3">
        <Link href={`/courses/${course.slug}`}>
          <div className="relative h-52 sm:h-full w-full overflow-hidden rounded-xl bg-muted">
            <img
              src={course.thumbnail || '/assets/images/blank-image.jpg'}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/assets/images/blank-image.jpg'
              }}
            />
            {course.category_name && (
              <span className="absolute top-2.5 left-2.5 rounded-md bg-[#D8FC38] px-2.5 py-1 text-xs font-bold text-slate-950 shadow-xs">
                {course.category_name}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Details Content */}
      <CardContent className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Metadata Row */}
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span>{course.enrollments_count || 120} Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span>
                  {typeof course.lessons_duration === 'number'
                    ? `${Math.round(course.lessons_duration / 3600)} hrs`
                    : course.lessons_duration || '12 hrs'}
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Wishlist"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:text-red-500 hover:bg-muted"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug text-slate-950 dark:text-white transition-colors group-hover:text-slate-800 dark:group-hover:text-slate-200">
              {course.title}
            </h3>
          </Link>

          {/* Instructor and Rating */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            {course.instructor_name && (
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                By {course.instructor_name}
              </span>
            )}
            <div className="flex items-center gap-1.5 font-medium">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-950 dark:text-white">
                {course.average_rating
                  ? course.average_rating.toFixed(2)
                  : '5.00'}
              </span>
              <span>({course.reviews_count || 24} reviews)</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            ) : course.discount && course.discount_price ? (
              <>
                <span className="text-xl font-extrabold text-slate-950 dark:text-white">
                  ${course.discount_price}
                </span>
                <span className="text-sm font-medium text-muted-foreground line-through">
                  ${course.price}
                </span>
              </>
            ) : (
              <span className="text-xl font-extrabold text-slate-950 dark:text-white">
                ${course.price ?? 49}
              </span>
            )}
          </div>

          <Button
            asChild
            className="rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            <Link href={`/courses/${course.slug}`}>Learn More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
