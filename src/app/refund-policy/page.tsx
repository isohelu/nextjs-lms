import React from 'react'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import legalPages from '@/lib/data/legal-pages.json'

const pageData = legalPages['refund-policy']

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.meta_description,
  openGraph: {
    title: `${pageData.title} | Mentor Learning Management System`,
    description: pageData.meta_description,
  },
}

export default function RefundPolicyPage() {
  return (
    <>
      <InnerHero title={pageData.name} slug={pageData.slug} />

      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto my-20 max-w-3xl rounded-2xl bg-muted px-6 py-10 md:px-20 prose dark:prose-invert">
          <div
            className="leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: pageData.description }}
          />
        </div>
      </div>
    </>
  )
}
