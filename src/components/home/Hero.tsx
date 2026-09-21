import React from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
  const avatars = [
    '/assets/avatars/avatar-1.png',
    '/assets/avatars/avatar-2.png',
    '/assets/avatars/avatar-3.png',
    '/assets/avatars/avatar-4.png',
    '/assets/avatars/avatar-5.png',
  ]

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-20">
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-between gap-12 px-4 md:flex-row md:gap-8">
        {/* Left Column */}
        <div className="relative w-full md:max-w-[500px]">
          <div className="relative z-10 mb-6">
            <p className="mb-2 text-base font-semibold uppercase tracking-wider text-secondary-foreground">
              YOUR JOURNEY BEGINS HERE
            </p>
            <h1 className="text-3xl leading-tight font-bold text-foreground md:text-4xl lg:text-[44px] lg:leading-[1.2]">
              Grow Your Knowledge with Leading Online Courses
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
              Start learning today with top-rated courses and instructors. Take
              your team's learning and development to new heights with structured
              hands-on projects.
            </p>
          </div>

          {/* CTA Button */}
          <div className="relative z-10 mb-10 md:mb-12">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-primary px-8 text-base font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Link href="/courses/all">Browse Courses</Link>
            </Button>
          </div>

          {/* Social Proof & Rating Stack */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Student ${index + 1}`}
                  className="h-11 w-11 rounded-full border-2 border-background object-cover ring-2 ring-background"
                />
              ))}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-foreground">5.0</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                +2000 readers worldwide
              </p>
            </div>
          </div>

          {/* Violet Glow Blur */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.3)_0%,transparent_70%)] blur-3xl" />
        </div>

        {/* Right Hero Image */}
        <div className="relative w-full max-w-[620px]">
          <img
            src="/assets/images/intro/home-1/hero-image.png"
            alt="Student learning online with Mentor LMS"
            className="relative z-10 h-auto w-full object-contain drop-shadow-xl"
          />

          {/* Emerald Green Glow Blur */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,167,111,0.25)_0%,transparent_70%)] blur-3xl" />
        </div>
      </div>
    </section>
  )
}
