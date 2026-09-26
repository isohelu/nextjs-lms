import React from 'react'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import CareersContent from '@/components/careers/CareersContent'

export const metadata: Metadata = {
  title: 'Careers - Join Our Mission at Mentor',
  description: 'Join Mentor team and help transform education. Explore career opportunities, company culture, and growth prospects.',
  openGraph: {
    title: 'Careers - Join Our Mission at Mentor | Mentor Learning Management System',
    description: 'Join Mentor team and help transform education. Explore career opportunities, company culture, and growth prospects.',
  },
}

export default function CareersPage() {
  return (
    <>
      <InnerHero title="Careers" slug="careers" />
      <CareersContent />
    </>
  )
}
