import React from 'react'
import Link from 'next/link'
import RatingStars from '@/components/common/RatingStars'
import { cn } from '@/lib/utils'

export default function Hero() {
  const avatars = [
    { name: 'Student 1', image: '/assets/avatars/avatar-1.png' },
    { name: 'Student 2', image: '/assets/avatars/avatar-2.png' },
    { name: 'Student 3', image: '/assets/avatars/avatar-3.png' },
    { name: 'Student 4', image: '/assets/avatars/avatar-4.png' },
    { name: 'Student 5', image: '/assets/avatars/avatar-5.png' },
  ]

  return (
    <section className="container pt-20 pb-10">
      <div className={cn('flex flex-col items-center justify-between gap-12 md:flex-row md:gap-3')}>
        {/* Left Column */}
        <div className="relative w-full md:max-w-120">
          <div className="relative z-10 mb-6">
            <p className="mb-2 text-lg font-medium text-secondary-foreground">
              YOUR JOURNEY BEGINS HERE
            </p>
            <h1 className="text-3xl leading-tight font-bold md:text-4xl lg:text-[42px] lg:leading-14 text-foreground">
              Grow Your Knowledge with Leading Online Courses
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start learning today with top-rated courses and instructors Take your team&apos;s learning and development to new heights Take your team&apos;s learning
            </p>
          </div>

          <div className="relative z-10 mb-10 md:mb-14">
            <Link
              href="/courses/all"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-none!"
            >
              Browse Courses
            </Link>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex -space-x-4">
              {avatars.map((item, index) => (
                <img
                  key={index}
                  src={item.image}
                  alt={item.name}
                  className="h-11! w-11! rounded-full object-cover ring-2 ring-background"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <RatingStars rating={5} starClass="w-4 h-4" />
                <p className="font-medium text-foreground">5.0</p>
              </div>
              <p className="text-sm text-muted-foreground">
                +2000 readers worldwide
              </p>
            </div>
          </div>

          <div className="after:pointer-events-none after:absolute after:top-0 after:-right-20 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(97,95,255,1)] after:blur-[290px] after:content-['']" />
        </div>

        {/* Right Image */}
        <div className="relative w-full max-w-160">
          <img
            src="/assets/images/intro/home-1/hero-image.png"
            alt="Student learning online"
            className="relative z-10 h-full w-full object-contain"
          />

          <div className="after:pointer-events-none after:absolute after:right-0 after:bottom-20 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(0,167,111,1)] after:blur-[290px] after:content-['']" />
        </div>
      </div>
    </section>
  )
}

