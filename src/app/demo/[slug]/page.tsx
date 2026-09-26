import React from 'react'
import { notFound } from 'next/navigation'
import Hero from '@/components/home/Hero'
import Partners from '@/components/home/Partners'
import Features from '@/components/home/Features'
import TopCategories from '@/components/home/TopCategories'
import TopCourses from '@/components/home/TopCourses'
import Statistics from '@/components/home/Statistics'
import Overview from '@/components/home/Overview'
import TopCourseSpotlight from '@/components/home/TopCourseSpotlight'
import NewCourses from '@/components/home/NewCourses'
import InstructorSpotlight from '@/components/home/InstructorSpotlight'
import TopInstructors from '@/components/home/TopInstructors'
import Testimonials from '@/components/home/Testimonials'
import Faqs from '@/components/home/Faqs'
import Blogs from '@/components/home/Blogs'
import CallToAction from '@/components/home/CallToAction'

// Dedicated Homepage Variant Partials
import Home2Hero from '@/components/home/home-2/Hero'
import Home2Overview from '@/components/home/home-2/Overview'
import Home2CallToAction from '@/components/home/home-2/CallToAction'

import Home3Hero from '@/components/home/home-3/Hero'
import Home3Features from '@/components/home/home-3/Features'
import Home3CategoryCourses from '@/components/home/home-3/CategoryCourses'

import Home4Hero from '@/components/home/home-4/Hero'

import Home5Hero from '@/components/home/home-5/Hero'

import pageRepository from '@/lib/repositories/pageRepository'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function DemoHomePage({ params }: PageProps) {
  const { slug } = await params
  const data = pageRepository.getPageBySlug(slug)

  switch (slug) {
    case 'home-1':
      return (
        <>
          <Hero />
          <Partners />
          <TopCategories />
          <TopCourses />
          <Overview />
          <NewCourses />
          <TopInstructors />
          <Faqs />
          <Blogs />
          <CallToAction />
        </>
      )

    case 'home-2':
      return (
        <>
          <Home2Hero heroSection={data?.sectionsMap['hero']} />
          <Partners />
          <TopCategories />
          <TopCourses />
          <Home2Overview />
          <Testimonials />
          <TopInstructors />
          <Blogs />
          <Home2CallToAction />
        </>
      )

    case 'home-3':
      return (
        <>
          <Home3Hero />
          <Partners />
          <Home3Features />
          <Home3CategoryCourses />
          <TopInstructors />
          <Testimonials />
          <Blogs />
          <CallToAction />
        </>
      )

    case 'home-4':
      return (
        <>
          <Home4Hero />
          <Statistics />
          <TopCourseSpotlight />
          <InstructorSpotlight />
          <Faqs />
          <CallToAction />
        </>
      )

    case 'home-5':
      return (
        <>
          <Home5Hero />
          <Statistics />
          <TopCategories />
          <TopCourses />
          <InstructorSpotlight />
          <Testimonials />
          <Blogs />
          <CallToAction />
        </>
      )

    default:
      notFound()
  }
}
