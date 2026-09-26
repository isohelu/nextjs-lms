import React from 'react'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import ContactUsContent from '@/components/contact/ContactUsContent'
import legalPages from '@/lib/data/legal-pages.json'

const pageData = legalPages['contact-us']

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.meta_description,
  openGraph: {
    title: `${pageData.title} | Mentor Learning Management System`,
    description: pageData.meta_description,
  },
}

export default function ContactUsPage() {
  return (
    <>
      <InnerHero title="Contact Us" slug="contact-us" />
      <ContactUsContent />
    </>
  )
}
