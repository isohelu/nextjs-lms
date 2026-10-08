'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AboutSectionEditor from '@/components/dashboard/AboutSectionEditor'

export default function AboutSectionAdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <AboutSectionEditor />
      </div>
    </DashboardLayout>
  )
}
