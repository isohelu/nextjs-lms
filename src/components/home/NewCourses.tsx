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

const sampleNewCourses: CourseData[] = [
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
  },
  {
    id: 13,
    title: 'Digital Brand Strategy & Performance Marketing',
    slug: 'digital-brand-strategy',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 73,
    lessons_duration: 16200,
    average_rating: 4.87,
    reviews_count: 15,
    price: 65,
    discount: true,
    discount_price: 45,
    instructor_name: 'Sarah Jenkins',
  },
  {
    id: 14,
    title: 'Data Engineering Pipelines with Kafka and PySpark',
    slug: 'data-engineering-kafka-pyspark',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 124,
    lessons_duration: 31200,
    average_rating: 4.94,
    reviews_count: 32,
    price: 115,
    discount: false,
    instructor_name: 'Sophia Martinez',
  },
  {
    id: 15,
    title: 'Cross-Platform App Development with Flutter 3',
    slug: 'cross-platform-flutter-3',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 138,
    lessons_duration: 22800,
    average_rating: 4.91,
    reviews_count: 28,
    price: 85,
    discount: true,
    discount_price: 59,
    instructor_name: 'Elena Rostova',
  },
  {
    id: 16,
    title: 'Enterprise Security & ISO 27001 Compliance Architecture',
    slug: 'enterprise-security-iso27001',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 92,
    lessons_duration: 27600,
    average_rating: 4.98,
    reviews_count: 23,
    price: 140,
    discount: true,
    discount_price: 99,
    instructor_name: 'Alexander Wright',
  },
]

export default function NewCourses({
  courses = sampleNewCourses,
}: {
  courses?: CourseData[]
}) {
  const displayCourses = courses.length > 0 ? courses : sampleNewCourses
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
            Latest Courses
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
          plugins={[Autoplay({ delay: 4000 })]}
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
      <div className="pointer-events-none absolute -top-40 -right-60 h-200 w-200 rounded-full bg-[radial-gradient(circle,rgba(0,120,103,0.45)_0%,transparent_70%)] opacity-50" />
      <div className="pointer-events-none absolute -bottom-40 -left-60 h-200 w-200 rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.45)_0%,transparent_70%)] opacity-50" />
    </section>
  )
}
