'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import HeroSectionEditor from '@/components/dashboard/HeroSectionEditor'

export default function AdminHeroSectionPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <HeroSectionEditor />
      </div>
    </DashboardLayout>
  )
}
