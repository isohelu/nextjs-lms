'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Award, Plus, Loader2 } from 'lucide-react'
import CertificateCard, { CertificateTemplate } from '@/components/certification/CertificateCard'

export default function CertificateIndexPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/certificates/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Error loading certificate templates:', err)
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
        title="Certificates"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Certificate Templates' },
        ]}
        action={
          <Link href="/dashboard/certification/certificate/create">
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
          {/* Course Certificate Templates Section */}
          <section>
            <h6 className="mb-4 text-xl font-semibold">Course Certificate Templates</h6>
            {courseTemplates.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Award className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">No certificate templates yet</h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first certificate template to get started
                  </p>
                  <Link href="/dashboard/certification/certificate/create">
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
                  <CertificateCard
                    key={template.id}
                    type="course"
                    template={template}
                    onRefresh={loadTemplates}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Exam Certificate Templates Section */}
          <section>
            <h6 className="mb-4 text-xl font-semibold">Exam Certificate Templates</h6>
            {examTemplates.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Award className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">No certificate templates yet</h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first certificate template to get started
                  </p>
                  <Link href="/dashboard/certification/certificate/create">
                    <Button>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examTemplates.map((template) => (
                  <CertificateCard
                    key={template.id}
                    type="exam"
                    template={template}
                    onRefresh={loadTemplates}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  )
}
