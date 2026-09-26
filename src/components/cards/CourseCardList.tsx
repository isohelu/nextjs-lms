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
        'group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-300 shadow-card hover:shadow-card-hover',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative sm:w-70 shrink-0 p-3 pb-0 sm:pb-3">
        <Link href={`/courses/${course.slug}`}>
          <div className="relative h-50 sm:h-full w-full overflow-hidden rounded-xl bg-muted">
            <img
              src={course.thumbnail || '/assets/images/blank-image.jpg'}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/assets/images/blank-image.jpg'
              }}
            />
          </div>
        </Link>
      </div>

      {/* Details Content */}
      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Metadata Row */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-medium text-secondary-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{course.enrollments_count || 120} Students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
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
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary-foreground">
              {course.title}
            </h3>
          </Link>

          {/* Instructor and Rating */}
          <div className="mt-2.5 flex items-center gap-4 text-sm text-muted-foreground">
            {course.instructor_name && (
              <span className="font-medium text-foreground/80">
                By {course.instructor_name}
              </span>
            )}
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">
                {course.average_rating
                  ? course.average_rating.toFixed(2)
                  : '5.00'}
              </span>
              <span>({course.reviews_count || 24} reviews)</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <div className="flex items-center gap-2">
            {isFree ? (
              <span className="text-xl font-bold text-secondary-foreground">
                Free
              </span>
            ) : course.discount && course.discount_price ? (
              <>
                <span className="text-xl font-bold text-foreground">
                  ${course.discount_price}
                </span>
                <span className="text-sm font-medium text-muted-foreground line-through">
                  ${course.price}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-foreground">
                ${course.price ?? 49}
              </span>
            )}
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-xl border-border px-4 text-xs font-semibold hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href={`/courses/${course.slug}`}>Learn More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
