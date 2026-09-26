'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function VerifyCertificatePage() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [searchedCode, setSearchedCode] = useState('')
  const [certData, setCertData] = useState<{
    student_name: string
    course_title: string
    issue_date: string
    identifier: string
    instructor_name?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    const clean = code.trim().toUpperCase()
    setSearchedCode(clean)
    setLoading(true)

    try {
      const res = await fetch(`/api/certificates/verify/${clean}`)
      const data = await res.json()
      if (res.ok && data.success && data.certificate) {
        setCertData(data.certificate)
        setStatus('valid')
      } else {
        setCertData(null)
        setStatus('invalid')
      }
    } catch {
      setCertData(null)
      setStatus('invalid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b border-border bg-muted/40 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">Verify Certificate</span>
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Certificate Authenticity Verification
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Validate the authenticity of official qualifications, diplomas, and course completion certificates issued by Mentor LMS.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-10">
        {/* Search Box */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-border shadow-md bg-card">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="certCode" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Enter Certificate Credential ID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="certCode"
                    type="text"
                    placeholder="e.g. CERT-2025-98421"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 uppercase font-mono tracking-wider bg-background h-11 border-border"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-11 px-6 font-bold shadow-sm cursor-pointer">
                  {loading ? 'Verifying...' : 'Verify Record'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sample valid ID: <button type="button" onClick={() => setCode('CERT-MLMS-2026-9901')} className="text-primary underline font-mono cursor-pointer">CERT-MLMS-2026-9901</button>
              </p>
            </div>
          </form>

          {/* Validation Result Output */}
          {status === 'valid' && certData && (
            <div className="mt-8 pt-6 border-t border-border space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Official Record Verified</h4>
                  <p className="text-xs opacity-90">Credential is authentic and registered in the Mentor LMS ledger.</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">Recipient Name</span>
                  <span className="font-bold text-foreground">{certData.student_name}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">Course / Examination</span>
                  <span className="font-bold text-foreground text-right">{certData.course_title}</span>
                </div>
                {certData.instructor_name && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="text-xs text-muted-foreground">Instructor</span>
                    <span className="font-medium text-foreground">{certData.instructor_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">Date of Completion</span>
                  <span className="font-semibold text-foreground">
                    {new Date(certData.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <span className="text-xs text-muted-foreground">Accreditation ID</span>
                  <span className="font-mono text-xs font-bold text-primary">{certData.identifier}</span>
                </div>
              </div>

              <Button asChild className="w-full h-11 font-bold shadow-md" size="lg">
                <Link href={`/certificates/${searchedCode}`}>
                  View Official Digital Certificate
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {status === 'invalid' && (
            <div className="mt-8 pt-6 border-t border-border space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Certificate ID Not Found</h4>
                  <p className="text-xs opacity-90">
                    No active accreditation matches the identifier &quot;{searchedCode}&quot;. Please verify spelling.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
