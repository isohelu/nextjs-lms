'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Video, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CourseCard2Props {
  course: {
    id: number | string
    title: string
    slug: string
    thumbnail?: string | null
    price?: number | string | null
    discount_price?: number | string | null
    discount?: boolean | number | null
    pricing_type?: string | null
    level?: string | null
    duration?: string | null
    average_rating?: number | null
    total_reviews?: number | null
    course_category?: {
      title: string
    } | null
    instructor?: {
      name: string
      avatar?: string | null
    } | null
    curriculum_lessons_count?: number
  }
  className?: string
}

export default function CourseCard2({ course, className }: CourseCard2Props) {
  const isFree = course.pricing_type === 'free' || !course.price || Number(course.price) === 0
  const formattedPrice = isFree ? 'Free' : `$${Number(course.price).toFixed(2)}`
  const formattedDiscount = course.discount && course.discount_price ? `$${Number(course.discount_price).toFixed(2)}` : null

  return (
    <Card className={cn('overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="p-0">
        <div className="relative">
          <Link href={`/courses/details/${course.slug}/${course.id}`}>
            <div className="relative h-70 w-full overflow-hidden rounded-t-lg">
              <img
                src={course.thumbnail || '/assets/images/blank-image.jpg'}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/assets/images/blank-image.jpg'
                }}
              />
            </div>
          </Link>
        </div>
      </CardHeader>

      <div className="p-5">
        <CardContent className="p-0 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              {course.course_category?.title || 'General'}
            </span>

            <div className="flex items-center gap-2">
              {formattedDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formattedDiscount}
                </span>
              )}
              <span className="text-lg font-bold text-foreground">
                {formattedPrice}
              </span>
            </div>
          </div>

          <Link href={`/courses/details/${course.slug}/${course.id}`}>
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors hover:text-primary">
              {course.title}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-4 py-4 text-xs text-muted-foreground border-b border-border/60">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{course.average_rating || 5.0}</span>
              <span>({course.total_reviews || 12})</span>
            </div>

            <div className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5" />
              <span>{course.curriculum_lessons_count || 14} Lessons</span>
            </div>

            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{course.duration}</span>
              </div>
            )}

            {course.level && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="capitalize">{course.level}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between p-0 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-muted">
              {course.instructor?.avatar ? (
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                  {course.instructor?.name?.charAt(0) || 'I'}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {course.instructor?.name || 'Lead Instructor'}
            </span>
          </div>

          <Link
            href={`/courses/details/${course.slug}/${course.id}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Enroll Now →
          </Link>
        </CardFooter>
      </div>
    </Card>
  )
}
