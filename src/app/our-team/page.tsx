import React from 'react'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import TopInstructors from '@/components/home/TopInstructors'
import Partners from '@/components/home/Partners'

export const metadata: Metadata = {
  title: 'Our Team - Meet the People Behind Mentor',
  description: 'Meet the Mentor team - passionate educators, skilled developers, and dedicated professionals working to democratize education.',
  keywords: 'our team, instructors, educators, team behind mentor, mentors',
}

export default function OurTeamPage() {
  return (
    <>
      {/* 1. Header Banner & Breadcrumbs matching Laravel */}
      <InnerHero title="Our Team" slug="our-team" />

      {/* 2. Top Instructors: Meet Our Experts */}
      <TopInstructors />

      {/* 3. Partners: Trusted by over 100 leading companies worldwide */}
      <Partners />
    </>
  )
}
