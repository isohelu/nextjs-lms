import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Book, Grid, List, Star, Users, ArrowLeft, Mail, ShieldCheck } from 'lucide-react'
import RatingStars from '@/components/common/RatingStars'
import CourseCard from '@/components/cards/CourseCard'
import CourseCardList from '@/components/cards/CourseCardList'
import { INSTRUCTORS, getDatabaseInstructors } from '../page'
import { courseRepository } from '@/lib/repositories/courseRepository'

export const dynamic = 'force-dynamic'

interface InstructorShowProps {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    view?: string
  }>
}

const INSTRUCTOR_COURSES: Record<string, any[]> = {
  '1': [
    {
      id: 1,
      title: 'The Complete 2025 Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp-2025',
      category: 'Web Development',
      price: 89.99,
      discount_price: 19.99,
      duration: '65 Hours',
      level: 'Beginner',
      rating: 4.8,
      reviews_count: 3200,
      students_count: 14200,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
      instructor_name: 'Dr. Angela Yu',
      instructor_avatar: '/assets/avatars/avatar-1.png',
      badge: 'Bestseller',
    },
    {
      id: 2,
      title: '100 Days of Code: The Complete Python Pro Bootcamp',
      slug: '100-days-of-code-python-pro-bootcamp',
      category: 'Data Science',
      price: 94.99,
      discount_price: 24.99,
      duration: '58 Hours',
      level: 'All Levels',
      rating: 4.9,
      reviews_count: 5400,
      students_count: 22000,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      instructor_name: 'Dr. Angela Yu',
      instructor_avatar: '/assets/avatars/avatar-1.png',
      badge: 'Popular',
    },
    {
      id: 3,
      title: 'iOS & Swift - The Complete iOS App Development Bootcamp',
      slug: 'ios-swift-complete-bootcamp',
      category: 'Mobile Development',
      price: 89.99,
      discount_price: 19.99,
      duration: '48 Hours',
      level: 'Beginner',
      rating: 4.8,
      reviews_count: 2900,
      students_count: 11000,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      instructor_name: 'Dr. Angela Yu',
      instructor_avatar: '/assets/avatars/avatar-1.png',
    }
  ]
}

export async function generateMetadata({ params }: InstructorShowProps): Promise<Metadata> {
  const { id } = await params
  const allInst = getDatabaseInstructors()
  const instructor = allInst.find((i) => i.id.toString() === id) || INSTRUCTORS[0]

  return {
    title: `${instructor.name} - Expert Instructor | Mentor LMS`,
    description: instructor.bio,
    openGraph: {
      title: `${instructor.name} - Expert Instructor`,
      description: instructor.bio,
      images: [{ url: instructor.avatar, width: 400, height: 400, alt: instructor.name }],
      type: 'profile',
    },
  }
}

export default async function InstructorProfilePage({ params, searchParams }: InstructorShowProps) {
  const { id } = await params
  const sp = searchParams ? await searchParams : {}
  const viewType = sp?.view === 'list' ? 'list' : 'grid'

  const allInst = getDatabaseInstructors()
  const instructor = allInst.find((i) => i.id.toString() === id) || {
    ...INSTRUCTORS[0],
    id: Number(id) || 1,
  }

  // Get courses taught by this instructor dynamically from database
  const dbCourses = courseRepository.listAll({ instructorId: Number(id), limit: 50 }).courses
  const courses = dbCourses.length > 0
    ? dbCourses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category_title || 'Web Development',
        price: Number(c.price || 0),
        discount_price: c.discount_price ? Number(c.discount_price) : null,
        duration: '40 Hours',
        level: c.level || 'All Levels',
        rating: 4.9,
        reviews_count: 24,
        students_count: Number(c.enrollments_count || 150),
        thumbnail: c.thumbnail || '/assets/images/students-1.jpg',
        instructor_name: instructor.name,
        instructor_avatar: instructor.avatar,
        badge: 'Popular',
      }))
    : (INSTRUCTOR_COURSES[id] || [
        {
          id: 101,
          title: `Advanced Architecture & Production Mastery with ${instructor.name}`,
          slug: 'complete-web-development-bootcamp-2025',
          category: 'Software Engineering',
          price: 79.99,
          discount_price: 19.99,
          duration: '38 Hours',
          level: 'Intermediate',
          rating: instructor.rating,
          reviews_count: instructor.reviews_count,
          students_count: instructor.students_count,
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
          instructor_name: instructor.name,
          instructor_avatar: instructor.avatar,
          badge: 'Featured',
        },
      ])

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: instructor.name,
    email: instructor.email,
    jobTitle: instructor.designation,
    description: instructor.bio,
    image: instructor.avatar,
    worksFor: {
      '@type': 'Organization',
      name: 'Mentor LMS',
      url: 'https://mentorlms.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: instructor.rating,
      reviewCount: instructor.reviews_count,
      bestRating: 5,
      worstRating: 1,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/instructors" className="hover:text-foreground">Instructors</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{instructor.name}</span>
        </div>

        {/* 1:1 Profile Header Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {instructor.name}
                  </h1>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {instructor.designation}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{instructor.email}</span>
                </div>
              </div>
            </div>

            {/* Rating Stars Box */}
            <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-4 py-2 self-start sm:self-center">
              <span className="text-2xl font-black text-foreground">
                {instructor.rating.toFixed(1)}
              </span>
              <div>
                <RatingStars rating={instructor.rating} starClass="h-4 w-4" />
                <p className="text-[11px] text-muted-foreground">
                  {instructor.reviews_count.toLocaleString()} reviews
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {instructor.bio}
          </p>

          <Separator />

          {/* Key Metrics Counters */}
          <div className="flex flex-wrap gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-foreground/70" />
              <span>
                <strong className="text-foreground font-bold">{instructor.students_count.toLocaleString()}</strong> Students
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Book className="h-5 w-5 text-foreground/70" />
              <span>
                <strong className="text-foreground font-bold">{courses.length}</strong> Courses
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-5 w-5 text-foreground/70" />
              <span>
                <strong className="text-foreground font-bold">{instructor.reviews_count.toLocaleString()}</strong> Student Reviews
              </span>
            </div>
          </div>
        </div>

        {/* 1:1 Course List Header with View Type Switcher */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              All Courses by {instructor.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {courses.length} published courses
            </p>
          </div>

          {/* Grid / List Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/20">
            <Link href={`/instructors/${id}?view=grid`}>
              <Button
                size="icon"
                variant={viewType === 'grid' ? 'default' : 'ghost'}
                className="h-8 w-8"
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </Link>

            <Link href={`/instructors/${id}?view=list`}>
              <Button
                size="icon"
                variant={viewType === 'list' ? 'default' : 'ghost'}
                className="h-8 w-8"
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Courses Display */}
        {viewType === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCardList key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
