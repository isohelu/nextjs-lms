import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CourseUpdateManager from '@/components/dashboard/courses/CourseUpdateManager'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const courseId = parseInt(resolvedParams.id, 10)

  return (
    <DashboardLayout>
      <CourseUpdateManager
        initialCourseId={courseId}
        initialTab={resolvedSearchParams.tab || 'curriculum'}
      />
    </DashboardLayout>
  )
}
