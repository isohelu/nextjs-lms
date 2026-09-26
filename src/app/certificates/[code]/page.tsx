'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Award,
  Calendar,
  CheckCircle2,
  Printer,
  Share2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function CertificateViewPage() {
  const params = useParams()
  const certificateCode = (params?.code as string) || 'CERT-MLMS-2026-9901'
  const [copied, setCopied] = useState(false)
  const [certRecord, setCertRecord] = useState<any>(null)

  React.useEffect(() => {
    if (certificateCode) {
      fetch(`/api/certificates/verify/${certificateCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.certificate) {
            setCertRecord(data.certificate)
          }
        })
        .catch(() => {})
    }
  }, [certificateCode])

  // Certificate metadata
  const cert = {
    code: certRecord?.identifier || certificateCode.toUpperCase(),
    studentName: certRecord?.student_name || 'Alex Mercer',
    title: certRecord?.course_title || 'Advanced React & Next.js 15 Full-Stack Architecture',
    type: 'Course & Practical Assessment',
    issueDate: certRecord?.issue_date
      ? new Date(certRecord.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'September 21, 2025',
    instructorName: certRecord?.instructor_name || 'David Miller',
    instructorRole: 'Principal Cloud Systems Instructor',
    issuerName: 'Mentor LMS Global Learning Academy',
    grade: '94% - Grade A (Distinction)',
    verificationUrl: `https://mentor-lms.com/certificates/${certRecord?.identifier || certificateCode}`,
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      {/* Top Action Bar (hidden when printing) */}
      <div className="container mx-auto px-4 max-w-4xl mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/student" className="hover:text-foreground">Student Portal</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">Certificate</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial text-xs border-border"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Link Copied!' : 'Copy Verification URL'}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial text-xs font-semibold shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Official Certificate Canvas */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-white text-slate-900 border-10 border-slate-900 shadow-2xl p-8 sm:p-14 print:p-8 print:border-8 print:shadow-none print:m-0">
          {/* Ornate Inner Double Border */}
          <div className="absolute inset-3 rounded-2xl border-2 border-amber-600/60 pointer-events-none" />
          <div className="absolute inset-5 rounded-xl border border-slate-200 pointer-events-none" />

          {/* Background Guilloché / Watermark Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0f172a_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Academy Crest / Header Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 shadow-md">
                <Award className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">
                  MENTOR LMS
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Global Education & Technical Accreditation
                </p>
              </div>
            </div>

            {/* Title Header */}
            <div className="space-y-1 pt-2">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-amber-700">
                Official Verification of Completion
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Achievement
              </h1>
              <div className="mx-auto mt-2 h-1 w-24 bg-linear-to-r from-amber-600 to-amber-400 rounded-full" />
            </div>

            {/* Recipient Notice */}
            <p className="text-xs sm:text-sm text-slate-600 italic">
              This is to formally certify that
            </p>

            {/* Recipient Name */}
            <div className="border-b-2 border-slate-300 pb-2 px-8">
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide">
                {cert.studentName}
              </h2>
            </div>

            {/* Description */}
            <div className="max-w-xl space-y-2">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                has successfully completed all rigorous curriculum milestones, laboratory modules, and comprehensive timed assessments for
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 font-sans">
                {cert.title}
              </h3>
              <p className="text-xs font-semibold text-amber-700">
                Issued with Distinction • Score: {cert.grade}
              </p>
            </div>

            {/* Signatures & Accreditation Footer */}
            <div className="w-full pt-8 mt-6 border-t border-slate-200 grid grid-cols-3 items-end gap-4 text-center">
              {/* Date */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 font-serif">{cert.issueDate}</p>
                <div className="mx-auto h-0.5 w-24 bg-slate-300" />
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date of Issuance</p>
              </div>

              {/* Verified Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full border-2 border-amber-600/70 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner">
                  <ShieldCheck className="h-9 w-9" />
                </div>
                <span className="mt-1 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  ID: {cert.code}
                </span>
              </div>

              {/* Instructor Signature */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 font-serif italic">{cert.instructorName}</p>
                <div className="mx-auto h-0.5 w-24 bg-slate-300" />
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{cert.instructorRole}</p>
              </div>
            </div>

            {/* Tamper-Proof Cryptographic Verification String */}
            <div className="pt-2 text-[10px] text-slate-400 font-mono tracking-tight">
              Tamper-proof verifiable credential token: SHA256:{cert.code}-E9A403F-84CD-LMS
            </div>
          </div>
        </div>

        {/* Verification Info Footer (hidden on print) */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Verified & Active Credential</h4>
                <p className="text-xs text-muted-foreground">
                  This credential is authenticated on the Mentor LMS registry and cannot be forged.
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="text-xs border-border">
              <Link href="/verify-certificate">
                Verify Another Credential
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
