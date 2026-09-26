'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import CourseCard2 from '@/components/cards/CourseCard2'
import { Button } from '@/components/ui/button'

interface CategoryWithCourses {
  id: number | string
  title: string
  slug: string
  courses: any[]
}

export default function Home3CategoryCourses() {
  const [categories, setCategories] = useState<CategoryWithCourses[]>([])
  const [activeSlug, setActiveSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/courses?limit=12')
        if (res.ok) {
          const json = await res.json()
          const coursesList = json.data?.courses || []
          
          // Group by category
          const catMap: Record<string, CategoryWithCourses> = {}
          coursesList.forEach((c: any) => {
            const cat = c.course_category || { id: 1, title: 'Development', slug: 'development' }
            if (!catMap[cat.slug]) {
              catMap[cat.slug] = {
                id: cat.id,
                title: cat.title,
                slug: cat.slug,
                courses: [],
              }
            }
            catMap[cat.slug].courses.push(c)
          })

          const catArray = Object.values(catMap)
          if (catArray.length > 0) {
            setCategories(catArray)
            setActiveSlug(catArray[0].slug)
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentCategory = categories.find((c) => c.slug === activeSlug)

  return (
    <section className="relative overflow-hidden py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 text-center md:max-w-2xl">
          <p className="mb-2 font-semibold uppercase tracking-wider text-secondary-foreground text-xs">
            Course Explorer
          </p>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-foreground">
            Explore Courses by Category
          </h2>
          <p className="text-muted-foreground">
            Select an area of interest to view featured masterclasses and interactive learning paths.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="space-y-10">
            {/* Tabs bar */}
            <div className="flex justify-center overflow-x-auto pb-2">
              <div className="inline-flex h-14 items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-sm backdrop-blur-md">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveSlug(cat.slug)}
                    className={`h-11 rounded-xl px-5 text-sm font-semibold transition-all duration-200 ${
                      activeSlug === cat.slug
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            {currentCategory && currentCategory.courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentCategory.courses.slice(0, 6).map((course) => (
                  <CourseCard2 key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-muted-foreground">
                No courses found in this category.
              </p>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-xl px-8 font-semibold">
            <Link href="/courses">
              Explore All Courses →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
