'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchInput from '@/components/common/SearchInput'

interface Home2HeroProps {
  heroSection?: {
    title?: string | null
    sub_title?: string | null
    description?: string | null
    thumbnail?: string | null
    properties?: Record<string, any>
  }
}

export default function Home2Hero({ heroSection }: Home2HeroProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const title = heroSection?.title || 'YOUR JOURNEY BEGINS HERE'
  const subTitle = heroSection?.sub_title || 'Unlock 5,500+ Expert-Led Courses Powered by 400+ Trusted Instructors'
  const description = heroSection?.description || 'Start learning today with top-rated courses and instructors.'
  const thumbnail = heroSection?.thumbnail || '/assets/images/intro/home-2/hero-image.png'

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-8 lg:space-y-10">
            <div>
              <p className="mb-2 text-lg font-medium text-secondary-foreground">
                {title}
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-[42px] lg:leading-tight text-foreground">
                {subTitle}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="relative">
              <form onSubmit={handleSearch} className="z-10 w-full max-w-110">
                <SearchInput
                  placeholder="Search for courses that fit your goals"
                  onChangeValue={(val) => setSearchValue(val)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(e)
                  }}
                  className="z-10 w-full rounded bg-background md:max-w-110 [&>input]:h-11 shadow-sm"
                />
              </form>

              <div className="after:pointer-events-none after:absolute after:top-1/2 after:-left-15 after:h-60 after:w-60 after:-translate-y-1/2 after:rounded-full after:bg-[rgba(0,167,111,0.25)] after:blur-[120px] after:content-['']"></div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <img
              src={thumbnail}
              alt="Student learning online"
              className="relative z-10 h-full max-h-115 object-contain drop-shadow-xl"
            />

            <div className="after:pointer-events-none after:absolute after:top-0 after:right-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(97,95,255,0.25)] after:blur-[120px] after:content-['']"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
