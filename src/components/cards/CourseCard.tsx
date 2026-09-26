'use client'

import React from 'react'
import Link from 'next/link'
import { Users, Clock, Star } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  category_name?: string
  badge?: string
}

interface CourseCardProps {
  course: CourseData
  className?: string
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const isFree = course.pricing_type === 'free' || course.price === 0

  return (
    <Card
      className={cn(
        'group flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-300 shadow-card hover:shadow-card-hover',
        className
      )}
    >
      {/* Thumbnail Header */}
      <CardHeader className="p-0">
        <div className="relative p-2.5 pb-0">
          <Link href={`/courses/${course.slug}`}>
            <div className="relative h-47.5 w-full overflow-hidden rounded-xl bg-muted">
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
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col justify-between p-4 pb-2">
        <div>
          {/* Meta Stats: Students & Duration */}
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-secondary-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.enrollments_count || 120} Students</span>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {typeof course.lessons_duration === 'number'
                  ? `${Math.round(course.lessons_duration / 3600)} hrs`
                  : course.lessons_duration || '12 hrs'}
              </span>
            </div>
          </div>

          {/* Course Title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary-foreground min-h-11">
              {course.title}
            </h3>
          </Link>
        </div>

        {/* Star Ratings */}
        <div className="mt-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">
            {course.average_rating ? course.average_rating.toFixed(1) : '5.0'}
          </span>
          <span>({course.reviews_count || 32} reviews)</span>
        </div>
      </CardContent>

      {/* Footer: Price & CTA */}
      <CardFooter className="mt-auto flex items-center justify-between p-4 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          {isFree ? (
            <span className="text-lg font-bold text-secondary-foreground">
              Free
            </span>
          ) : course.discount && course.discount_price ? (
            <>
              <span className="text-lg font-bold text-foreground">
                ${course.discount_price}
              </span>
              <span className="text-sm font-medium text-muted-foreground line-through">
                ${course.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground">
              ${course.price ?? 49}
            </span>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          className="h-8 rounded-lg border-border px-3 text-xs font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link href={`/courses/${course.slug}`}>Learn More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
