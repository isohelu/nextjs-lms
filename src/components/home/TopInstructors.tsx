'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import InstructorCard, { InstructorData } from '@/components/cards/InstructorCard'
import { cn } from '@/lib/utils'

const DEFAULT_INSTRUCTORS: InstructorData[] = [
  {
    id: 1,
    name: 'David Miller',
    designation: 'Senior Full-Stack Architect',
    photo: '/assets/images/instructor-david-miller.jpg?v=2',
    coursesCount: 6,
  },
  {
    id: 2,
    name: 'Elena Rostova',
    designation: 'Principal AI Researcher',
    photo: '/assets/images/instructor-elena-rostova.jpg?v=2',
    coursesCount: 6,
  },
  {
    id: 3,
    name: 'Marcus Chen',
    designation: 'Lead Cloud DevOps Engineer',
    photo: '/assets/images/instructor-marcus-chen.jpg?v=2',
    coursesCount: 6,
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    designation: 'Head of Design & UX',
    photo: '/assets/images/instructor-sarah-jenkins.jpg?v=2',
    coursesCount: 6,
  },
]

const CATEGORY_TABS = ['All', 'Development', 'Design', 'Data', 'Business']

export default function TopInstructors({
  instructors = DEFAULT_INSTRUCTORS,
}: {
  instructors?: InstructorData[]
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [slideIndex, setSlideIndex] = useState(0)

  // Use provided instructors or fallback to default
  const baseList = instructors && instructors.length > 0 ? instructors : DEFAULT_INSTRUCTORS

  const handlePrev = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, baseList.length - 4)))
  }

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 4 < baseList.length ? prev + 1 : 0))
  }

  // Active slice of 4 instructors
  const visibleInstructors = baseList.slice(slideIndex, slideIndex + 4)
  const displayList = visibleInstructors.length === 4 ? visibleInstructors : baseList.slice(0, 4)

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. Section Header: Centered & Clean (Badge Removed)                        */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Learn from Industry Experts
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineers, designers, and system architects actively building at top global companies.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. Filter Category Tabs + Carousel Navigation Controls                     */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-10">
          
          {/* Filter Tabs with Hairline Dividers */}
          <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((cat, idx) => (
              <React.Fragment key={cat}>
                {idx > 0 && (
                  <span className="mx-2 sm:mx-3 text-slate-200 dark:text-slate-800 select-none">
                    |
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat)
                    setSlideIndex(0)
                  }}
                  className={cn(
                    'relative pb-1 transition-colors cursor-pointer whitespace-nowrap',
                    activeCategory === cat
                      ? 'text-slate-950 dark:text-white font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <span>{cat}</span>
                  {activeCategory === cat && (
                    <span className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-[#D8FC38] rounded-full" />
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Previous instructors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="h-10 w-10 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Next instructors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 Instructors Grid: 1:1 Match with Exact Portraits & Meta                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {displayList.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>

        {/* ========================================================================= */}
        {/* Bottom Action: "Meet all instructors ->" Pill Button                       */}
        {/* ========================================================================= */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            href="/instructors"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold shadow-xs transition-colors group"
          >
            <span>Meet all instructors</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
