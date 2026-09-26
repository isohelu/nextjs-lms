'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home3Hero() {
  const stats = [
    { value: '350+', label: 'Expert Mentors' },
    { value: '1,200+', label: 'Online Courses' },
    { value: '45K+', label: 'Graduated Students' },
  ]

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-8">
          {/* Left Content */}
          <div className="relative w-full space-y-8 md:max-w-135 lg:space-y-10">
            <div className="relative z-10">
              <p className="mb-2 text-lg font-medium text-secondary-foreground">
                Build Practical Future-Proof Skills
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-[44px] lg:leading-tight text-foreground">
                Elevate Your Career with Industry-Accredited Courses
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Join our comprehensive global learning hub. Master software engineering, cloud security, AI architecture, and creative leadership.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                <Link href="/courses">
                  Explore Courses
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
                <Link href="/about-us">
                  Learn About Us
                </Link>
              </Button>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-8 pt-4 border-t border-border/60">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="text-2xl font-bold text-foreground lg:text-3xl">
                    {stat.value}
                  </h4>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="after:pointer-events-none after:absolute after:top-0 after:-right-20 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(97,95,255,0.2)] after:blur-[120px] after:content-['']"></div>
          </div>

          {/* Right Image */}
          <div className="relative flex w-full max-w-160 items-center justify-center lg:justify-end">
            <img
              src="/assets/images/intro/home-1/hero-image.png"
              alt="Student learning online"
              className="relative z-10 w-full object-contain drop-shadow-2xl"
            />

            <div className="after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(0,167,111,0.2)] after:blur-[120px] after:content-['']"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
