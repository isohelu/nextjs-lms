'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MarksheetBuilderForm from '@/components/certification/MarksheetBuilderForm'
import { MarksheetTemplate } from '@/components/certification/MarksheetCard'
import { Loader2 } from 'lucide-react'

export default function EditMarksheetPage() {
  const params = useParams()
  const id = params?.id as string
  const [template, setTemplate] = useState<MarksheetTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/marksheets/templates')
        if (res.ok) {
          const data = await res.json()
          const found = (data.templates || []).find((t: MarksheetTemplate) => t.id.toString() === id)
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
        title="Edit Marksheet"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Marksheets', href: '/dashboard/certification/marksheet' },
          { title: 'Edit Marksheet Template' },
        ]}
        className="mb-6"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : template ? (
        <MarksheetBuilderForm template={template} />
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Marksheet template not found
        </div>
      )}
    </DashboardLayout>
  )
}
