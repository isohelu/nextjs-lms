'use client'

import React, { useState, useEffect } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ReviewCard1, { Review1Item } from '@/components/cards/ReviewCard1'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const sampleReviews: Review1Item[] = [
  {
    id: 1,
    name: 'Emily Watson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    address: 'Full Stack Engineer, London UK',
    description: 'The Next.js 15 course changed how I approach React architecture. The interactive quizzes and real-world project modules gave me the confidence to step into a senior engineering role.',
  },
  {
    id: 2,
    name: 'Michael Torres',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    address: 'DevOps Specialist, Austin TX',
    description: 'Hands down the best LMS experience I have ever had. The Docker and Kubernetes curriculum covers production scenarios that tutorials normally gloss over.',
  },
  {
    id: 3,
    name: 'Sophia Patel',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    address: 'Product Designer, San Francisco CA',
    description: 'The design systems course is world-class. From Figma token setup to React component sync, every lesson was packed with practical, high-value insights.',
  },
  {
    id: 4,
    name: 'David Kim',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    address: 'Security Analyst, Toronto Canada',
    description: 'The OWASP and network security lab exercises were incredibly comprehensive. I was able to pass my industry certifications on the very first try!',
  },
  {
    id: 5,
    name: 'Amina Al-Mansoor',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    address: 'AI Engineer, Dubai UAE',
    description: 'Direct access to mentors during weekly office hours made all the difference when building complex autonomous agent workflows with LangChain and Python.',
  },
]

export default function Testimonials({
  reviews = sampleReviews,
}: {
  reviews?: Review1Item[]
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)
    handleSelect()

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  return (
    <section className="relative overflow-hidden py-20 bg-muted/20">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-70 w-70 rounded-full bg-[rgba(0,167,111,0.08)] blur-[140px]" />
      <div className="pointer-events-none absolute top-0 right-0 h-70 w-70 rounded-full bg-[rgba(97,95,255,0.08)] blur-[140px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
            Student Testimonials
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Over 68,000+ Learners
          </h2>
          <p className="text-base text-muted-foreground">
            Discover how professionals and ambitious career-switchers use our curriculum to master modern tech and land top jobs.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          className="w-full pb-10"
          opts={{
            loop: true,
            align: 'start',
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem
                key={review.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full py-1">
                  <ReviewCard1 review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Controls and Indicator Dots */}
        <div className="flex items-center justify-between border-t border-border/50 pt-6">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  currentSlide === index
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>

          {/* Chevrons */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous testimonial"
              disabled={!api?.canScrollPrev()}
              onClick={() => api?.scrollPrev()}
              className="h-10 w-10 rounded-full border-border hover:border-primary hover:bg-background shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next testimonial"
              disabled={!api?.canScrollNext()}
              onClick={() => api?.scrollNext()}
              className="h-10 w-10 rounded-full border-border hover:border-primary hover:bg-background shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
