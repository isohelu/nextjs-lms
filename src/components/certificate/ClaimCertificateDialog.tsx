'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Award, ClipboardList, Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import DynamicCertificate, { CertificateTemplate } from './DynamicCertificate'
import DynamicMarksheet, { MarksheetTemplate, StudentMarks } from './DynamicMarksheet'

interface ClaimCertificateDialogProps {
  courseId: number | string
  courseTitle: string
  studentName?: string
  completionDate?: string
  studentMarks?: StudentMarks | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export default function ClaimCertificateDialog({
  courseId,
  courseTitle,
  studentName = 'Alex Mercer',
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  studentMarks,
  open,
  onOpenChange,
  trigger,
}: ClaimCertificateDialogProps) {
  const [activeTab, setActiveTab] = useState<'certificate' | 'marksheet'>('certificate')
  const [certTemplate, setCertTemplate] = useState<CertificateTemplate | null>(null)
  const [markTemplate, setMarkTemplate] = useState<MarksheetTemplate | null>(null)
  const [credentialCode, setCredentialCode] = useState(`MLMS-CERT-${(Number(courseId) || 1) * 10007}`)
  const [currentUser, setCurrentUser] = useState(studentName)

  useEffect(() => {
    // Load active templates & current student name
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user?.name) {
          setCurrentUser(data.user.name)
        }
      })
      .catch(() => {})

    // Load active certificate template
    fetch('/api/admin/certificates/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.templates)) {
          const activeCourseCert = data.templates.find((t: any) => t.is_active && t.type === 'course') || data.templates[0]
          if (activeCourseCert) {
            setCertTemplate(activeCourseCert)
          }
        }
      })
      .catch(() => {})

    // Load course overview data for marksheet
    if (courseId) {
      fetch(`/api/student/courses/${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.certificate_template) {
              setCertTemplate(data.certificate_template)
            }
            if (data.marksheet_template) {
              setMarkTemplate(data.marksheet_template)
            }
            if (data.student?.name) {
              setCurrentUser(data.student.name)
            }
          }
        })
        .catch(() => {})
    }
  }, [courseId])

  const dialogContent = (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card border-border">
      <DialogHeader className="pb-2 text-center space-y-1">
        <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-foreground">
          <Award className="h-6 w-6 text-amber-500" />
          <span>Course Completion Credential</span>
        </DialogTitle>
        <p className="text-xs text-muted-foreground">
          Congratulations! You have completed all curriculum milestones. View and download your official certificate and academic marksheet.
        </p>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-3 mb-4">
          <TabsList className="grid w-full sm:w-72 grid-cols-2">
            <TabsTrigger value="certificate" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <Award className="h-3.5 w-3.5" />
              Certificate
            </TabsTrigger>
            <TabsTrigger value="marksheet" className="text-xs font-semibold gap-1.5 cursor-pointer">
              <ClipboardList className="h-3.5 w-3.5" />
              Marksheet
            </TabsTrigger>
          </TabsList>

          <Link
            href={`/certificates/${credentialCode}`}
            target="_blank"
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>Public Verification URL</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Tab 1: Official Certificate */}
        <TabsContent value="certificate" className="mt-0">
          <DynamicCertificate
            template={certTemplate}
            courseName={courseTitle}
            studentName={currentUser}
            completionDate={completionDate}
            credentialCode={credentialCode}
          />
        </TabsContent>

        {/* Tab 2: Academic Marksheet */}
        <TabsContent value="marksheet" className="mt-0">
          <DynamicMarksheet
            template={markTemplate}
            courseName={courseTitle}
            studentName={currentUser}
            completionDate={completionDate}
            studentMarks={studentMarks}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  )
}
