'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import { ArrowRight } from 'lucide-react'

export interface CategoryWithCourses {
  id: number | string
  title: string
  slug: string
  courses: CourseData[]
}

const DEFAULT_CATEGORY_COURSES: CategoryWithCourses[] = [
  {
    id: 1,
    title: 'Web Development',
    slug: 'web-development',
    courses: [
      {
        id: 1,
        title: 'The Complete 2025 Web Development Bootcamp',
        slug: 'complete-web-development-bootcamp-2025',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Dr. Angela Yu',
        instructor_avatar: '/assets/avatars/avatar-1.png',
        price: 19.99,
        lessons_duration: '65 hrs',
        average_rating: 4.8,
        reviews_count: 3200,
        badge: 'Bestseller',
      },
      {
        id: 2,
        title: 'Next.js 15 & React 19 Enterprise Architecture',
        slug: 'fullstack-nextjs-15-architecture',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Sarah Jenkins',
        instructor_avatar: '/assets/avatars/avatar-2.png',
        price: 24.99,
        lessons_duration: '38 hrs',
        average_rating: 4.9,
        reviews_count: 1420,
        badge: 'Popular',
      },
      {
        id: 3,
        title: 'TypeScript Fullstack Masterclass: From Basics to Advanced Patterns',
        slug: 'complete-web-development-bootcamp-2025',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Michael Chang',
        instructor_avatar: '/assets/avatars/avatar-3.png',
        price: 18.99,
        lessons_duration: '29 hrs',
        average_rating: 4.7,
        reviews_count: 980,
      }
    ]
  },
  {
    id: 2,
    title: 'Data Science & AI',
    slug: 'data-science',
    courses: [
      {
        id: 4,
        title: '100 Days of Code: The Complete Python Pro Bootcamp',
        slug: '100-days-of-code-python-pro-bootcamp',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Dr. Angela Yu',
        instructor_avatar: '/assets/avatars/avatar-1.png',
        price: 24.99,
        lessons_duration: '58 hrs',
        average_rating: 4.9,
        reviews_count: 5400,
        badge: 'Top Rated',
      },
      {
        id: 5,
        title: 'Machine Learning A-Z: Hands-On Python & Scikit-Learn',
        slug: '100-days-of-code-python-pro-bootcamp',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Rachel Adams',
        instructor_avatar: '/assets/avatars/avatar-3.png',
        price: 22.99,
        lessons_duration: '44 hrs',
        average_rating: 4.8,
        reviews_count: 1890,
      }
    ]
  },
  {
    id: 3,
    title: 'UI/UX Design',
    slug: 'design',
    courses: [
      {
        id: 6,
        title: 'UI/UX Design Masterclass: High-Fidelity Prototypes in Figma',
        slug: 'ui-ux-design-figma-masterclass',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Jessica Miller',
        instructor_avatar: '/assets/avatars/avatar-4.png',
        price: 19.99,
        lessons_duration: '32 hrs',
        average_rating: 4.9,
        reviews_count: 1650,
        badge: 'Bestseller',
      },
      {
        id: 7,
        title: 'Design Systems Architecture with Tailwind CSS & Design Tokens',
        slug: 'ui-ux-design-figma-masterclass',
        thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523b9320e61?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Jessica Miller',
        instructor_avatar: '/assets/avatars/avatar-4.png',
        price: 21.99,
        lessons_duration: '26 hrs',
        average_rating: 4.8,
        reviews_count: 820,
      }
    ]
  },
  {
    id: 4,
    title: 'Cloud & DevOps',
    slug: 'cloud-devops',
    courses: [
      {
        id: 8,
        title: 'Kubernetes & Docker Microservices Orchestration',
        slug: 'fullstack-nextjs-15-architecture',
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
        instructor_name: 'Michael Chang',
        instructor_avatar: '/assets/avatars/avatar-3.png',
        price: 25.99,
        lessons_duration: '40 hrs',
        average_rating: 4.8,
        reviews_count: 2100,
        badge: 'Hot',
      }
    ]
  }
]

export default function CategoryCourses({ categories }: { categories?: CategoryWithCourses[] }) {
  const data = categories || DEFAULT_CATEGORY_COURSES
  const [activeTab, setActiveTab] = useState(data[0]?.slug || 'web-development')

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Curated Curricula
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Explore Courses by Discipline
          </h2>
          <p className="text-sm text-muted-foreground">
            Specialized learning paths designed to take you from foundational syntax to enterprise production mastery.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-12 bg-muted/50 p-1 rounded-2xl gap-1 inline-flex">
              {data.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.slug}
                  className="rounded-xl px-5 text-xs sm:text-sm font-semibold transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm"
                >
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {data.map((category) => (
            <TabsContent key={category.id} value={category.slug} className="m-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-center pt-4">
          <Link href="/courses/all">
            <Button variant="outline" size="lg" className="rounded-xl font-semibold text-xs sm:text-sm">
              Browse All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
