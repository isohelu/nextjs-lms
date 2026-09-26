'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Send,
  Loader2,
  ArrowLeft,
  Download,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AssignmentSubmissionDetailPage() {
  const params = useParams()
  const assignmentId = params?.id || '1'

  const [notes, setNotes] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/student/assignments" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Assignment #{assignmentId}: Dynamic Nonce-based CSP Middleware
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Course: Full-Stack Next.js 15 & Modern React Architecture</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Instructions Brief Card */}
        <Card className="p-6 border-border shadow-sm space-y-4 bg-card">
          <h2 className="text-base font-bold text-foreground">Instructor Instructions & Criteria</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>1. Implement a Next.js 15 middleware that generates a cryptographically random base64 nonce using the Web Crypto API.</p>
            <p>2. Configure strict OWASP headers: HSTS (max-age=63072000), X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, and Referrer-Policy: strict-origin-when-cross-origin.</p>
            <p>3. Bind the generated nonce to script-src and style-src without allowing &apos;unsafe-inline&apos; execution on production routes.</p>
          </div>

          <div className="rounded-xl bg-muted/40 p-3.5 border border-border flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Starter Code Repository</span>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Download Starter Zip
            </Button>
          </div>
        </Card>

        {/* Submission Form */}
        <Card className="p-6 border-border shadow-sm space-y-5 bg-card">
          <h2 className="text-base font-bold text-foreground">Submit Your Solution</h2>

          {isSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base">Assignment Submitted Successfully!</h3>
                <p className="text-xs text-muted-foreground">Your instructor has been notified. Evaluation and grade feedback will appear here once reviewed.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="repo">GitHub Solution Repository URL</Label>
                <Input
                  id="repo"
                  required
                  placeholder="https://github.com/username/nextjs-csp-middleware"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Implementation Notes / Architectural Decisions</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Briefly describe how you handled static generation fallbacks and edge proxying..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">Attach Zip Archive or PDF Report</p>
                <p className="text-[11px] text-muted-foreground">Up to 25MB</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl font-bold shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Solution...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Review
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
