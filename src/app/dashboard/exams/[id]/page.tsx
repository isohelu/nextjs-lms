import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExamUpdateManager from '@/components/dashboard/exams/ExamUpdateManager'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function ExamDetailPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const examId = parseInt(resolvedParams.id, 10)

  return (
    <DashboardLayout>
      <ExamUpdateManager
        initialExamId={examId}
        initialTab={resolvedSearchParams.tab || 'questions'}
      />
    </DashboardLayout>
  )
}
