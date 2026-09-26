'use client'

import React, { useState, useEffect } from 'react'
import CourseCard3 from '@/components/cards/CourseCard3'
import { cn } from '@/lib/utils'

export default function Home5Hero() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHeroCourses() {
      try {
        const res = await fetch('/api/courses?limit=4')
        if (res.ok) {
          const json = await res.json()
          setCourses(json.data?.courses || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadHeroCourses()
  }, [])

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 text-center md:max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Featured Masterclasses
          </p>
          <h1 className="text-3xl font-bold md:text-5xl text-foreground">
            Top Courses Hero Showcase
          </h1>
          <p className="mt-3 text-muted-foreground">
            Deep dive into our most celebrated courses curated by leading industry mentors.
          </p>
        </div>

        {courses.length > 0 ? (
          <div
            className={cn(
              'relative z-10 grid grid-cols-1 items-center gap-x-12 gap-y-10',
              courses.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'
            )}
          >
            {courses.map((course) => (
              <CourseCard3 key={course.id} course={course} className="h-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Top Courses Hero Section. Loading courses...
          </div>
        )}

        <div className="after:pointer-events-none after:absolute after:bottom-10 after:left-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(0,167,111,0.15)] after:blur-[140px] after:content-['']"></div>
        <div className="after:pointer-events-none after:absolute after:top-10 after:right-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(97,95,255,0.15)] after:blur-[140px] after:content-['']"></div>
      </div>
    </section>
  )
}
