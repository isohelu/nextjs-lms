import React from 'react'
import type { Metadata } from 'next'
import ExamsPage from '../page'

export const metadata: Metadata = {
  title: 'All Exams',
  description: 'Browse professional certification exams from expert instructors. Test your skills with our comprehensive exam catalog.',
  openGraph: {
    title: 'All Exams | Mentor Learning Management System',
    description: 'Browse professional certification exams from expert instructors. Test your skills with our comprehensive exam catalog.',
  },
}

export default function ExamsAllPage() {
  return <ExamsPage />
}
