'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LmsShowcaseEditor from '@/components/dashboard/LmsShowcaseEditor'

export default function LmsShowcaseAdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <LmsShowcaseEditor />
      </div>
    </DashboardLayout>
  )
}
