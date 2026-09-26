'use client'

import React from 'react'
import AdminPayoutsView from '@/components/dashboard/views/AdminPayoutsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPayoutRequestsPage() {
  return (
    <DashboardLayout role="admin">
      <AdminPayoutsView defaultStatus="pending" pageTitle="Payout Requests" />
    </DashboardLayout>
  )
}
