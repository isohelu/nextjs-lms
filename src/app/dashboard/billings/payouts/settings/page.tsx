'use client'

import React from 'react'
import PayoutSettingsView from '@/components/dashboard/views/PayoutSettingsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPayoutSettingsPage() {
  return (
    <DashboardLayout role="instructor">
      <PayoutSettingsView />
    </DashboardLayout>
  )
}
