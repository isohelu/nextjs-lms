'use client'

import React, { useState } from 'react'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import { cn } from '@/lib/utils'

const sampleNewCourses: CourseData[] = [
  {
    id: 9,
    title: 'Applied Machine Learning & Autonomous Agents',
    slug: 'applied-machine-learning-deep-neural-networks',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 98,
    lessons_duration: 34200,
    average_rating: 4.96,
    reviews_count: 26,
    price: 135,
    discount: true,
    discount_price: 95,
    instructor_name: 'Sophia Martinez',
    category_name: 'AI Engineering',
  },
  {
    id: 10,
    title: 'Cloud Architecture & Serverless Microservices on AWS',
    slug: 'cloud-architecture-masterclass',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 142,
    lessons_duration: 28800,
    average_rating: 4.89,
    reviews_count: 34,
    price: 105,
    discount: false,
    instructor_name: 'Marcus Chen',
    category_name: 'DevOps',
  },
  {
    id: 11,
    title: 'Strategic Product Management & Design Systems',
    slug: 'strategic-product-management',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 85,
    lessons_duration: 19800,
    average_rating: 4.92,
    reviews_count: 19,
    price: 75,
    discount: true,
    discount_price: 55,
    instructor_name: 'David Miller',
    category_name: 'UI/UX Design',
  },
  {
    id: 12,
    title: 'High-Performance Distributed Systems in Go & Rust',
    slug: 'high-performance-api-design',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 110,
    lessons_duration: 25200,
    average_rating: 5.0,
    reviews_count: 41,
    price: 99,
    discount: false,
    instructor_name: 'Alexander Wright',
    category_name: 'Full-Stack',
  },
]

const categories = ['All', 'Full-Stack', 'AI Engineering', 'DevOps', 'UI/UX Design']

export default function NewCourses({
  courses = sampleNewCourses,
}: {
  courses?: CourseData[]
}) {
  const displayCourses = courses.length > 0 ? courses : sampleNewCourses
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredCourses =
    activeCategory === 'All'
      ? displayCourses
      : displayCourses.filter(
          (c) => c.category_name?.toLowerCase() === activeCategory.toLowerCase()
        )

  return (
    <section className="relative py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E4D3B] dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-[#FF6B2C]" />
              LATEST RELEASES
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Newly Published Courses
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Fresh curriculums covering modern tools, frameworks, and architectural practices.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer',
                  activeCategory === cat
                    ? 'bg-[#1E4D3B] text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950'
                    : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {(filteredCourses.length > 0 ? filteredCourses : displayCourses).slice(0, 4).map((course) => (
            <div key={course.id} className="h-full">
              <CourseCard course={course} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
