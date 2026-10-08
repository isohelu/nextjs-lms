'use client'

import React from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MarksheetBuilderForm from '@/components/certification/MarksheetBuilderForm'

export default function CreateMarksheetPage() {
  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Create Marksheet"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Marksheets', href: '/dashboard/certification/marksheet' },
          { title: 'Create Marksheet Template' },
        ]}
        className="mb-6"
      />

      <MarksheetBuilderForm />
    </DashboardLayout>
  )
}
