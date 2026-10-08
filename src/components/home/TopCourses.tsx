'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const sampleCourses: CourseData[] = [
  {
    id: 1,
    title: 'Enterprise Cloud Architecture with AWS & Terraform',
    slug: 'enterprise-cloud-architecture-aws',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 215,
    lessons_duration: 115200, // 32 hrs
    average_rating: 4.9,
    reviews_count: 146,
    price: 89,
    discount: true,
    discount_price: 69,
    instructor_name: 'Sarah Jenkins',
    instructor_avatar: '/assets/avatars/avatar-4.png',
    instructor_designation: 'Cloud Architect • AWS Core',
    category_name: 'AI Engineering',
    level: 'Intermediate',
    lessons_count: 32,
  },
  {
    id: 2,
    title: 'Advanced UX Systems & Modern Design Tokens',
    slug: 'advanced-ux-systems-design-tokens',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 250,
    lessons_duration: 129600, // 36 hrs
    average_rating: 5.0,
    reviews_count: 168,
    price: 89,
    discount: false,
    instructor_name: 'Marcus Chen',
    instructor_avatar: '/assets/avatars/avatar-3.png',
    instructor_designation: 'Design Systems Lead',
    category_name: 'UI/UX Design',
    level: 'All Levels',
    lessons_count: 28,
  },
  {
    id: 3,
    title: 'Full-Stack React Native & Expo Development',
    slug: 'fullstack-react-native-expo',
    thumbnail: '/assets/images/hero-student-laptop.jpg',
    enrollments_count: 285,
    lessons_duration: 144000, // 40 hrs
    average_rating: 4.8,
    reviews_count: 190,
    price: 89,
    discount: true,
    discount_price: 69,
    instructor_name: 'Elena Rostova',
    instructor_avatar: '/assets/avatars/avatar-2.png',
    instructor_designation: 'Staff Mobile Engineer',
    category_name: 'Cloud & Database',
    level: 'Advanced',
    lessons_count: 38,
  },
  {
    id: 4,
    title: 'Mastering Machine Learning & Neural Networks',
    slug: 'mastering-machine-learning-neural-networks',
    thumbnail: '/assets/images/hero-bento-engineer.jpg',
    enrollments_count: 320,
    lessons_duration: 158400, // 44 hrs
    average_rating: 4.9,
    reviews_count: 212,
    price: 89,
    discount: false,
    instructor_name: 'David Miller',
    instructor_avatar: '/assets/avatars/avatar-1.png',
    instructor_designation: 'Principal ML Engineer',
    category_name: 'Full-Stack',
    level: 'Intermediate',
    lessons_count: 42,
  },
  {
    id: 5,
    title: 'Enterprise PostgreSQL, Supabase & Real-time Scaling',
    slug: 'enterprise-postgresql-supabase',
    thumbnail: '/assets/images/bento-hero-student.jpg',
    enrollments_count: 145,
    lessons_duration: 90000, // 25 hrs
    average_rating: 4.92,
    reviews_count: 47,
    price: 0,
    pricing_type: 'free',
    instructor_name: 'Sarah Jenkins',
    instructor_avatar: '/assets/avatars/avatar-4.png',
    instructor_designation: 'Database Architect',
    category_name: 'Cloud & Database',
    level: 'Intermediate',
    lessons_count: 30,
  },
  {
    id: 6,
    title: 'Zero-Trust Cybersecurity & Penetration Testing',
    slug: 'zero-trust-cybersecurity',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 115,
    lessons_duration: 97200, // 27 hrs
    average_rating: 4.85,
    reviews_count: 39,
    price: 110,
    discount: true,
    discount_price: 75,
    instructor_name: 'Alex Rivera',
    instructor_avatar: '/assets/avatars/avatar-2.png',
    instructor_designation: 'SecOps Director',
    category_name: 'Full-Stack',
    level: 'Intermediate',
    lessons_count: 36,
  },
]

const FILTER_CATEGORIES = [
  { label: 'All Courses', value: 'all' },
  { label: 'New Releases', value: 'new' },
  { label: 'Full-Stack', value: 'Full-Stack' },
  { label: 'AI Engineering', value: 'AI Engineering' },
  { label: 'UI/UX Design', value: 'UI/UX Design' },
  { label: 'Cloud & Database', value: 'Cloud & Database' },
]

export default function TopCourses({
  courses = sampleCourses,
}: {
  courses?: CourseData[]
}) {
  const baseCourses = courses && courses.length > 0 ? courses : sampleCourses
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [api, setApi] = useState<CarouselApi>()
  const [, setCurrentSlide] = useState(0)

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return baseCourses
    if (selectedCategory === 'new') {
      return [...baseCourses].reverse()
    }
    return baseCourses.filter((c) =>
      c.category_name?.toLowerCase().includes(selectedCategory.toLowerCase())
    )
  }, [baseCourses, selectedCategory])

  useEffect(() => {
    if (!api) return
    setCurrentSlide(api.selectedScrollSnap())
    api.on('select', () => {
      setCurrentSlide(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="relative py-14 sm:py-18 lg:py-22 bg-background overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. Section Header: Centered & Clean (Arrows Removed From Here)            */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Top Courses
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            High-impact, hands-on courses rated 4.9+ by thousands of successful graduates.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. Category Filter Pills: Centered                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 scrollbar-none mb-8 sm:mb-10">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer select-none',
                  isActive
                    ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:text-slate-950 dark:hover:text-white hover:border-[#D8FC38]/70 shadow-xs'
                )}
              >
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. Course Cards Carousel                                                  */}
        {/* ========================================================================= */}
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: filteredCourses.length > 3,
            skipSnaps: false,
            inViewThreshold: 0.7,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 sm:-ml-5">
            {filteredCourses.map((course, idx) => (
              <CarouselItem
                key={course.id}
                className="pl-4 sm:pl-5 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <CourseCard course={course} index={idx} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* ========================================================================= */}
        {/* 4. Bottom Navigation Controls (Placed Below Cards as Marked)              */}
        {/* ========================================================================= */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => api?.scrollPrev()}
            aria-label="Previous Slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-2xs transition-colors hover:border-[#D8FC38] hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => api?.scrollNext()}
            aria-label="Next Slide"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 5. Bottom Explore All Button                                              */}
        {/* ========================================================================= */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 px-7 py-3 text-sm sm:text-base font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <span>Explore All 500+ Verified Courses</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  )
}
