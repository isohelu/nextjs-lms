'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LearningJourneyEditor from '@/components/dashboard/LearningJourneyEditor'

export default function LearningJourneyAdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <LearningJourneyEditor />
      </div>
    </DashboardLayout>
  )
}
