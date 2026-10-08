'use client'

import React from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CertificateBuilderForm from '@/components/certification/CertificateBuilderForm'

export default function CreateCertificatePage() {
  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Create Certificate"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Certificates', href: '/dashboard/certification/certificate' },
          { title: 'Create Certificate Template' },
        ]}
        className="mb-6"
      />

      <CertificateBuilderForm />
    </DashboardLayout>
  )
}
