'use client'

import React from 'react'
import OfflinePaymentsView from '@/components/dashboard/views/OfflinePaymentsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <OfflinePaymentsView />
    </DashboardLayout>
  )
}
