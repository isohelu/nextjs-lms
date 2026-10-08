'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, Plus, Loader2 } from 'lucide-react'
import MarksheetCard, { MarksheetTemplate } from '@/components/certification/MarksheetCard'

export default function MarksheetIndexPage() {
  const [templates, setTemplates] = useState<MarksheetTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/marksheets/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Error loading marksheet templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const courseTemplates = templates.filter((t) => t.type === 'course')
  const examTemplates = templates.filter((t) => t.type === 'exam')

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Marksheets"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Marksheet Templates' },
        ]}
        action={
          <Link href="/dashboard/certification/marksheet/create">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        }
        className="mb-6"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Course Marksheet Templates Section */}
          <section className="pb-6">
            <h6 className="mb-4 text-xl font-semibold">Course Marksheet Templates</h6>
            {courseTemplates.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">No marksheet templates yet</h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first marksheet template to get started
                  </p>
                  <Link href="/dashboard/certification/marksheet/create">
                    <Button>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courseTemplates.map((template) => (
                  <MarksheetCard
                    key={template.id}
                    type="course"
                    template={template}
                    onRefresh={loadTemplates}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Exam Marksheet Templates Section (if any) */}
          {examTemplates.length > 0 && (
            <section className="pb-6">
              <h6 className="mb-4 text-xl font-semibold">Exam Marksheet Templates</h6>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examTemplates.map((template) => (
                  <MarksheetCard
                    key={template.id}
                    type="exam"
                    template={template}
                    onRefresh={loadTemplates}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
