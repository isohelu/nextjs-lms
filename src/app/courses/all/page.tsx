import React from 'react'
import type { Metadata } from 'next'
import CoursesAllContent from '@/components/courses/CoursesAllContent'

export const metadata: Metadata = {
  title: 'All Courses',
  description: 'Browse 16+ online courses from expert instructors. Learn new skills with our comprehensive course catalog.',
  openGraph: {
    title: 'All Courses | Mentor Learning Management System',
    description: 'Browse 16+ online courses from expert instructors. Learn new skills with our comprehensive course catalog.',
  },
}

export default function CoursesAllPage() {
  return <CoursesAllContent />
}
