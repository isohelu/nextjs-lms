import React from 'react'
import StudentPortalPage, { StudentTab } from '../page'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ tab: string }>
}

const VALID_TABS: Record<string, StudentTab> = {
  courses: 'courses',
  dashboard: 'courses',
  exams: 'exams',
  products: 'products',
  wishlist: 'wishlist',
  certificates: 'certificates',
  profile: 'profile',
  settings: 'settings',
  instructor: 'instructor',
}

export default async function StudentTabRoute({ params }: Props) {
  const { tab } = await params

  if (tab === 'instructor') {
    redirect('/student/become-instructor')
  }

  const validTab = VALID_TABS[tab] || 'courses'

  return <StudentPortalPage initialTab={validTab} />
}
