'use client'

import React from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CourseCard3Props {
  course: {
    id: number | string
    title: string
    slug: string
    thumbnail?: string | null
    short_description?: string | null
    price?: number | string | null
    pricing_type?: string | null
    course_category?: {
      title: string
    } | null
    curriculum_lessons_count?: number
  }
  className?: string
  onEnroll?: (id: number | string) => void
}

export default function CourseCard3({ course, className, onEnroll }: CourseCard3Props) {
  const isFree = course.pricing_type === 'free' || !course.price || Number(course.price) === 0
  const formattedPrice = isFree ? 'Free' : `$${Number(course.price).toFixed(2)}`

  return (
    <Card className={cn('overflow-hidden border border-border bg-card', className)}>
      <CardHeader className="p-0">
        <div className="relative p-2 pb-0">
          <Link href={`/courses/details/${course.slug}/${course.id}`}>
            <div className="group relative h-80 w-full overflow-hidden rounded-lg">
              <img
                src={course.thumbnail || '/assets/images/blank-image.jpg'}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/assets/images/blank-image.jpg'
                }}
              />

              <div className="absolute bottom-0 left-1/2 flex h-full w-full -translate-x-1/2 flex-col justify-end bg-linear-to-t from-primary p-4 text-center text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
                <h6 className="text-2xl font-semibold md:text-3xl line-clamp-2">
                  {course.title}
                </h6>
                {course.course_category?.title && (
                  <p className="mt-1 md:text-lg opacity-90">
                    {course.course_category.title}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.short_description || 'Master key skills with hands-on labs and comprehensive instructor guidance.'}
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto px-5 gap-2"
            onClick={() => onEnroll?.(course.id)}
            asChild={!onEnroll}
          >
            {onEnroll ? (
              <span>
                <Clock className="h-4 w-4" /> {formattedPrice} | Enroll Now
              </span>
            ) : (
              <Link href={`/courses/details/${course.slug}/${course.id}`}>
                <Clock className="h-4 w-4" /> {formattedPrice} | Enroll Now
              </Link>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href={`/courses/details/${course.slug}/${course.id}`}>
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
