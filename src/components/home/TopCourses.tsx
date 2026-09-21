'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import { Button } from '@/components/ui/button'

const sampleCourses: CourseData[] = [
  {
    id: 1,
    title: 'Full-Stack Next.js 15 & Modern React Architecture',
    slug: 'fullstack-nextjs-15-architecture',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 240,
    lessons_duration: 36000,
    average_rating: 4.95,
    reviews_count: 85,
    price: 99,
    discount: true,
    discount_price: 69,
    instructor_name: 'David Miller',
  },
  {
    id: 2,
    title: 'Mastering AI Agent Development & Autonomous Workflows',
    slug: 'mastering-ai-agent-development',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 310,
    lessons_duration: 28800,
    average_rating: 5.0,
    reviews_count: 114,
    price: 120,
    discount: true,
    discount_price: 89,
    instructor_name: 'Elena Rostova',
  },
  {
    id: 3,
    title: 'Modern UI/UX Design System with Figma & Tailwind',
    slug: 'modern-ui-ux-design-systems',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 195,
    lessons_duration: 21600,
    average_rating: 4.88,
    reviews_count: 62,
    price: 79,
    discount: false,
    instructor_name: 'Marcus Chen',
  },
  {
    id: 4,
    title: 'Enterprise PostgreSQL, Supabase & Real-time Scaling',
    slug: 'enterprise-postgresql-supabase',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 145,
    lessons_duration: 25200,
    average_rating: 4.92,
    reviews_count: 47,
    price: 0,
    pricing_type: 'free',
    instructor_name: 'Sarah Jenkins',
  },
]

export default function TopCourses({
  courses = sampleCourses,
}: {
  courses?: CourseData[]
}) {
  const displayCourses = courses.length > 0 ? courses : sampleCourses

  return (
    <section className="relative overflow-hidden bg-[url('/assets/images/intro/home-1/bg-line.png')] bg-cover bg-center py-20">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-14 text-center md:max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Courses
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Courses
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Your professional development is supported by Mentor, covering everything
            from technical software development to essential production skills.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCourses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Explore All Link */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline" className="rounded-xl border-border px-8 hover:border-primary">
            <Link href="/courses/all">Explore All Courses</Link>
          </Button>
        </div>
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.25)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,120,103,0.25)_0%,transparent_70%)] blur-3xl" />
    </section>
  )
}
