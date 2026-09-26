'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Grid,
  List,
  Filter,
  X,
  Star,
  BookOpen,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import CourseCardList from '@/components/cards/CourseCardList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const allCoursesData: CourseData[] = [
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
    category_name: 'Web Development',
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
    category_name: 'Artificial Intelligence',
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
    instructor_name: 'Sarah Jenkins',
    category_name: 'UI/UX Design',
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
    instructor_name: 'Marcus Chen',
    category_name: 'Cloud & DevOps',
  },
  {
    id: 5,
    title: 'Modern TypeScript 5 & Advanced Generics Mastery',
    slug: 'modern-typescript-5-generics',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 186,
    lessons_duration: 18000,
    average_rating: 4.98,
    reviews_count: 52,
    price: 49,
    discount: true,
    discount_price: 35,
    instructor_name: 'David Miller',
    category_name: 'Web Development',
  },
  {
    id: 6,
    title: 'Docker, Kubernetes & Cloud Native Microservices',
    slug: 'docker-kubernetes-microservices',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 212,
    lessons_duration: 32400,
    average_rating: 4.9,
    reviews_count: 68,
    price: 89,
    discount: false,
    instructor_name: 'Marcus Chen',
    category_name: 'Cloud & DevOps',
  },
  {
    id: 7,
    title: 'Cybersecurity Defense, Network Penetration & OWASP',
    slug: 'cybersecurity-defense-owasp',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 164,
    lessons_duration: 27000,
    average_rating: 5.0,
    reviews_count: 49,
    price: 110,
    discount: true,
    discount_price: 79,
    instructor_name: 'Alexander Wright',
    category_name: 'Cybersecurity',
  },
  {
    id: 8,
    title: 'Building Interactive Web Applications with GSAP & Three.js',
    slug: 'interactive-web-apps-gsap-threejs',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 175,
    lessons_duration: 16200,
    average_rating: 4.92,
    reviews_count: 35,
    price: 59,
    discount: false,
    instructor_name: 'Sarah Jenkins',
    category_name: 'Web Development',
  },
  {
    id: 9,
    title: 'Applied Machine Learning and Deep Neural Networks',
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
    category_name: 'Artificial Intelligence',
  },
  {
    id: 10,
    title: 'Cloud Architecture Masterclass on AWS & Azure',
    slug: 'cloud-architecture-masterclass',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 142,
    lessons_duration: 28800,
    average_rating: 4.89,
    reviews_count: 34,
    price: 105,
    discount: false,
    instructor_name: 'Marcus Chen',
    category_name: 'Cloud & DevOps',
  },
  {
    id: 11,
    title: 'Strategic Product Management & Technical Leadership',
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
    category_name: 'Business & Management',
  },
  {
    id: 12,
    title: 'High-Performance API Design with Rust and Go',
    slug: 'high-performance-api-design',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 110,
    lessons_duration: 25200,
    average_rating: 5.0,
    reviews_count: 41,
    price: 99,
    discount: false,
    instructor_name: 'Alexander Wright',
    category_name: 'Web Development',
  },
]

const categoriesList = [
  { name: 'Web Development', count: 4 },
  { name: 'Artificial Intelligence', count: 2 },
  { name: 'UI/UX Design', count: 1 },
  { name: 'Cloud & DevOps', count: 3 },
  { name: 'Cybersecurity', count: 1 },
  { name: 'Business & Management', count: 1 },
]

export default function CoursesAllContent() {
  const [coursesList, setCoursesList] = useState<CourseData[]>(allCoursesData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'>('popular')
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  React.useEffect(() => {
    fetch('/api/courses?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCoursesList(
            data.courses.map((c: any) => ({
              id: c.id,
              title: c.title,
              slug: c.slug,
              thumbnail: c.thumbnail || '/assets/images/students-1.jpg',
              enrollments_count: Number(c.enrollments_count || 120),
              lessons_duration: Number(c.lessons_duration || 21600),
              average_rating: Number(c.average_rating || 4.9),
              reviews_count: Number(c.reviews_count || 18),
              price: Number(c.price || 0),
              discount: Boolean(c.discount),
              discount_price: c.discount_price ? Number(c.discount_price) : null,
              instructor_name: c.instructor_name || 'Instructor',
              category_name: c.category_name || 'Web Development',
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const categoriesList = useMemo(() => {
    const map = new Map<string, number>()
    coursesList.forEach((c) => {
      const cat = c.category_name || 'Web Development'
      map.set(cat, (map.get(cat) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [coursesList])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceFilter('all')
    setMinRating(0)
    setSortBy('popular')
  }

  const filteredCourses = useMemo(() => {
    return coursesList
      .filter((course) => {
        // Search
        if (
          searchQuery &&
          !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false
        }
        // Category
        if (
          selectedCategories.length > 0 &&
          (!course.category_name || !selectedCategories.includes(course.category_name))
        ) {
          return false
        }
        // Price
        if (priceFilter === 'free' && course.pricing_type !== 'free' && course.price !== 0) {
          return false
        }
        if (priceFilter === 'paid' && (course.pricing_type === 'free' || course.price === 0)) {
          return false
        }
        // Rating
        if (minRating > 0 && (course.average_rating || 0) < minRating) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          const priceA = a.discount ? (a.discount_price ?? a.price ?? 0) : (a.price ?? 0)
          const priceB = b.discount ? (b.discount_price ?? b.price ?? 0) : (b.price ?? 0)
          return priceA - priceB
        }
        if (sortBy === 'price-high') {
          const priceA = a.discount ? (a.discount_price ?? a.price ?? 0) : (a.price ?? 0)
          const priceB = b.discount ? (b.discount_price ?? b.price ?? 0) : (b.price ?? 0)
          return priceB - priceA
        }
        if (sortBy === 'rating') {
          return (b.average_rating || 0) - (a.average_rating || 0)
        }
        if (sortBy === 'newest') {
          return Number(b.id) - Number(a.id)
        }
        // Default popular
        return (b.enrollments_count || 0) - (a.enrollments_count || 0)
      })
  }, [searchQuery, selectedCategories, priceFilter, minRating, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* Banner / Breadcrumbs */}
      <div className="border-b border-border/40 bg-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Courses</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore All Courses
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Acquire high-demand tech skills from world-class industry engineers, complete hands-on projects, and earn recognized certificates.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filter Courses
                </h3>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Categories
                </h4>
                <div className="space-y-2.5">
                  {categoriesList.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id={`cat-${cat.name}`}
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={() => toggleCategory(cat.name)}
                        />
                        <Label htmlFor={`cat-${cat.name}`} className="text-sm cursor-pointer">
                          {cat.name}
                        </Label>
                      </div>
                      <span className="text-xs text-muted-foreground">({cat.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Filter */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price
                </h4>
                <div className="space-y-2">
                  {(['all', 'free', 'paid'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceFilter(p)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                        priceFilter === p
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground/70 hover:bg-muted'
                      )}
                    >
                      {p === 'all' ? 'All Prices' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Minimum Rating
                </h4>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors',
                        minRating === rating
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground/70 hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{rating.toFixed(1)} & above</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Catalog Area */}
          <main className="flex-1">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-card border border-border p-4 rounded-2xl shadow-xs">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search course title or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-background border-border"
                />
              </div>

              {/* Controls: Count, Sort, View Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Showing <strong className="text-foreground">{filteredCourses.length}</strong> courses
                </span>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>

                {/* Grid / List Switcher */}
                <div className="flex items-center rounded-xl border border-border p-1 bg-muted/40">
                  <button
                    type="button"
                    aria-label="Grid View"
                    onClick={() => setViewType('grid')}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      viewType === 'grid'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="List View"
                    onClick={() => setViewType('list')}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      viewType === 'list'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Display */}
            {filteredCourses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No courses found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search keywords or clearing active filters.
                </p>
                <Button onClick={resetFilters} variant="outline" className="mt-6 rounded-xl">
                  Clear All Filters
                </Button>
              </div>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <CourseCardList key={course.id} course={course} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
