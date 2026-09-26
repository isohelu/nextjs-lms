'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Star, Users, ArrowUpRight, BookOpen } from 'lucide-react'
import { Course } from '@/types/database'

interface AnimatedCourseCardProps {
  course: Course
}

export function AnimatedCourseCard({ course }: AnimatedCourseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const handleMouseEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.015,
      boxShadow: '0 20px 30px -10px rgba(99, 102, 241, 0.18)',
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(imageRef.current, {
      scale: 1.06,
      duration: 0.4,
      ease: 'power2.out',
    })
  })

  const handleMouseLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(imageRef.current, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    })
  })

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="transition-shadow rounded-2xl"
    >
      <Card className="overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md flex flex-col h-full rounded-2xl group">
        {/* Course Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <div ref={imageRef} className="h-full w-full">
            <Image
              src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
              alt={course.title}
              fill
              className="object-cover transition-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/80 text-foreground backdrop-blur-md border border-border/50 text-[11px] font-semibold">
              {course.level}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-indigo-600 text-white font-bold text-xs shadow-md">
              {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
            </Badge>
          </div>

          {/* Category Pill */}
          {course.category?.name && (
            <div className="absolute bottom-3 left-3">
              <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/70 border border-indigo-500/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {course.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Header & Title */}
        <CardHeader className="p-5 pb-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-muted-foreground" />
              {course.duration_hours}h
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="size-3.5 fill-amber-400" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {course.students_count}
            </span>
          </div>

          <h3 className="font-bold text-base text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 pt-0 flex-1">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {course.short_description || course.description}
          </p>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="size-6 border border-border">
                <AvatarImage src={course.instructor_avatar} />
                <AvatarFallback className="text-[10px]">
                  {course.instructor_name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground truncate max-w-32.5">
                {course.instructor_name}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Footer actions */}
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Link href={`/courses/${course.slug}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all rounded-lg"
            >
              <BookOpen className="size-3.5 mr-1.5" />
              View Syllabus
            </Button>
          </Link>
          <Link href={`/courses/${course.slug}/learn`}>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3"
              title="Start Learning Now"
            >
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
