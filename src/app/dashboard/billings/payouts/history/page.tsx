'use client'

import React from 'react'
import AdminPayoutsView from '@/components/dashboard/views/AdminPayoutsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPayoutHistoryPage() {
  return (
    <DashboardLayout role="admin">
      <AdminPayoutsView defaultStatus="completed" pageTitle="Payout History" />
    </DashboardLayout>
  )
}
