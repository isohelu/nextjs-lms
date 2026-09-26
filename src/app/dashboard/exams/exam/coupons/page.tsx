'use client'

import React from 'react'
import CouponsView from '@/components/dashboard/views/CouponsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <CouponsView />
    </DashboardLayout>
  )
}
