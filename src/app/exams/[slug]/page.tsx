import React from 'react'
import { Metadata } from 'next'
import ExamDetailContent from '@/components/exams/ExamDetailContent'
import { EXAMS_DATA } from '@/lib/data/exams'

export const dynamic = 'force-dynamic'

interface ExamPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  const { slug } = await params
  const exam = EXAMS_DATA.find((e) => e.slug === slug) || EXAMS_DATA[0]

  return {
    title: exam.title,
    description:
      exam.short_description ||
      'Prepare with realistic practice questions, in-depth architectural explanations, and comprehensive simulated exams on Mentor LMS.',
    openGraph: {
      title: `${exam.title} | Mentor Learning Management System`,
      description:
        exam.short_description ||
        'Prepare with realistic practice questions, in-depth architectural explanations, and comprehensive simulated exams on Mentor LMS.',
      images: [
        {
          url:
            exam.thumbnail ||
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
          width: 1200,
          height: 630,
          alt: exam.title,
        },
      ],
    },
  }
}

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { slug } = await params
  return <ExamDetailContent slug={slug} />
}
