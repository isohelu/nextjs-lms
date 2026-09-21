'use client'

import React, { useState, useMemo } from 'react'
import { Course, Category } from '@/types/database'
import { AnimatedCourseCard } from '@/components/animations/AnimatedCourseCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react'

interface CourseCatalogProps {
  initialCourses: Course[]
  categories: Category[]
}

export function CourseCatalog({ initialCourses, categories }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || course.category_id === selectedCategory

      const matchesLevel =
        selectedLevel === 'all' || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [initialCourses, searchQuery, selectedCategory, selectedLevel])

  return (
    <section id="catalog" className="py-16 md:py-24 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <Badge variant="outline" className="mb-2 text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
            Curated Curriculum
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Explore Courses
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Choose from industry-vetted courses designed to bring you to senior and staff level engineering competency.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, skills, instructors..."
            className="pl-10 rounded-xl bg-card/60 border-border/80 focus:border-indigo-500/50 text-sm"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 border-b border-border/40">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-card/80 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-accent'
          }`}
        >
          All Domains
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-card/80 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-accent'
            }`}
          >
            {cat.name}
          </button>
        ))}

        <div className="ml-auto hidden sm:flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                selectedLevel === lvl
                  ? 'bg-accent text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lvl === 'all' ? 'All Levels' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <AnimatedCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/20">
          <BookOpen className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No courses found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or domain filters.
          </p>
        </div>
      )}
    </section>
  )
}
