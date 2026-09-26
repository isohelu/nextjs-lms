'use client'

import React, { useState, useEffect } from 'react'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'

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
  },
]

export default function TopCourses({
  courses = sampleCourses,
}: {
  courses?: CourseData[]
}) {
  const displayCourses = courses.length > 0 ? courses : sampleCourses
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!api) return

    setCurrentSlide(api.selectedScrollSnap())

    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)
    api.on('reInit', handleSelect)
    return () => {
      api.off('select', handleSelect)
      api.off('reInit', handleSelect)
    }
  }, [api])

  return (
    <section className="relative overflow-hidden bg-[url('/assets/images/intro/home-1/bg-line.png')] bg-cover bg-center py-20">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header matching Laravel 1:1 */}
        <div className="mx-auto mb-10 text-center md:max-w-xl">
          <p className="mb-1 font-medium text-secondary-foreground">
            Courses
          </p>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
            Popular Courses
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your professional development is supported by Mentor covering
            everything from technical subjects to essential abilities.
          </p>
        </div>

        {/* Embla Carousel with Autoplay */}
        <Carousel
          setApi={setApi}
          className="py-10"
          opts={{ align: 'start', loop: true }}
          plugins={[Autoplay({ delay: 3000 })]}
        >
          <CarouselContent className="items-stretch">
            {displayCourses.map((course) => (
              <CarouselItem
                key={course.id}
                className="basis-full md:basis-1/2 lg:basis-1/4 self-stretch"
              >
                <div className="h-full px-1.5 py-0.5">
                  <CourseCard course={course} className="h-full" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots and Prev/Next Navigation matching Laravel 1:1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2.5">
            {displayCourses.map(({ id }, index) => (
              <button
                key={id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'cursor-pointer rounded-full transition-all duration-200',
                  currentSlide === index
                    ? 'h-2 w-4 bg-foreground'
                    : 'h-2 w-2 bg-muted-foreground/30'
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>

          <div className="space-x-4">
            <Button
              size="icon"
              variant="outline"
              disabled={!api?.canScrollPrev()}
              onClick={() => api?.scrollPrev()}
              className="hover:border-primary hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={!api?.canScrollNext()}
              onClick={() => api?.scrollNext()}
              className="hover:border-primary hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Radial Backgrounds matching Laravel Home-1 */}
      <div className="pointer-events-none absolute -top-40 -right-60 h-200 w-200 rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.45)_0%,transparent_70%)] opacity-50" />
      <div className="pointer-events-none absolute -bottom-60 -left-60 h-200 w-200 rounded-full bg-[radial-gradient(circle,rgba(0,120,103,0.45)_0%,transparent_70%)] opacity-50" />
    </section>
  )
}
