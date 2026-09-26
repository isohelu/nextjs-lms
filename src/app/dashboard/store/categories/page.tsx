'use client'

import React from 'react'
import StoreCategoriesView from '@/components/dashboard/views/StoreCategoriesView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <StoreCategoriesView />
    </DashboardLayout>
  )
}
