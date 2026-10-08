'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CertificateBuilderForm from '@/components/certification/CertificateBuilderForm'
import { CertificateTemplate } from '@/components/certification/CertificateCard'
import { Loader2 } from 'lucide-react'

export default function EditCertificatePage() {
  const params = useParams()
  const id = params?.id as string
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/certificates/templates')
        if (res.ok) {
          const data = await res.json()
          const found = (data.templates || []).find((t: CertificateTemplate) => t.id.toString() === id)
          setTemplate(found || null)
        }
      } catch (err) {
        console.error('Error loading template:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      loadTemplate()
    }
  }, [id])

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Edit Certificate"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Certificates', href: '/dashboard/certification/certificate' },
          { title: 'Edit Certificate Template' },
        ]}
        className="mb-6"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : template ? (
        <CertificateBuilderForm template={template} />
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Certificate template not found
        </div>
      )}
    </DashboardLayout>
  )
}
