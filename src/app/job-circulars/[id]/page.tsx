'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Upload,
  Loader2,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function JobCircularDetailPage() {
  const params = useParams()
  const jobId = params?.id || '1'

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [applicant, setApplicant] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    coverLetter: '',
  })

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-muted/20 py-4">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/careers" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> All Openings
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Job #{jobId}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          {/* Main Content (8 cols) */}
          <div className="space-y-8 lg:col-span-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Engineering & Pedagogy
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Full-time • Remote Allowed
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Senior Next.js & Full-Stack Curriculum Architect
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> $140,000 - $180,000 / yr
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Deadline: October 30, 2026
                </span>
              </div>
            </div>

            {/* Role Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Role Overview</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are searching for an experienced full-stack engineering lead and educator to design, review, and maintain our highest-enrolled software engineering learning paths. You will collaborate directly with Fortune 500 guest lecturers to build real-world lab environments, capstone projects, and video curricula.
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Key Responsibilities</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
                  <span>Design comprehensive syllabus structures covering Next.js 15, React Server Components, TypeScript, and Supabase.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
                  <span>Create interactive assessment question pools, coding exercises, and grading rubrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
                  <span>Conduct weekly live office hour webinars and moderate advanced student forum discussions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
                  <span>Maintain open-source demonstration codebases with zero security vulnerabilities and 100% CI pass rates.</span>
                </li>
              </ul>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Qualifications & Requirements</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-1" />
                  <span>5+ years of production experience in TypeScript, React, and server-side Node.js architectures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-1" />
                  <span>Demonstrated passion for technical writing, video instruction, or mentoring junior-to-mid level developers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-1" />
                  <span>Deep familiarity with Web Security standards (OWASP Top 10, CSP, HSTS, secure session tokens).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar Action Card (4 cols) */}
          <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
            <Card className="p-6 border-border shadow-md space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Compensation Range</p>
                <p className="text-2xl font-bold text-foreground">$140k - $180k</p>
                <p className="text-[11px] text-muted-foreground">Includes equity options + full health benefits</p>
              </div>

              {/* Apply Dialog Trigger */}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger
                  render={
                    <Button className="w-full h-12 rounded-xl font-bold text-base shadow-md gap-2">
                      <Briefcase className="h-4 w-4" />
                      Apply for Position
                    </Button>
                  }
                />

                <DialogContent className="max-w-lg p-6 bg-card border border-border">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-bold">Apply for Position</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Senior Next.js & Full-Stack Curriculum Architect
                    </DialogDescription>
                  </DialogHeader>

                  {isSuccess ? (
                    <div className="py-8 text-center space-y-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-foreground">Application Dispatched!</h3>
                        <p className="text-xs text-muted-foreground">Our hiring team will review your portfolio and get back to you within 3 business days.</p>
                      </div>
                      <Button onClick={() => setIsOpen(false)} variant="outline" className="rounded-xl">
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-xs">Full Name</Label>
                        <Input
                          id="name"
                          required
                          placeholder="Jane Doe"
                          value={applicant.name}
                          onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-xs">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="jane@example.com"
                            value={applicant.email}
                            onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                            className="h-10 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="phone" className="text-xs">Phone</Label>
                          <Input
                            id="phone"
                            placeholder="+1 (555) 000-0000"
                            value={applicant.phone}
                            onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="portfolio" className="text-xs">Portfolio / GitHub / LinkedIn</Label>
                        <Input
                          id="portfolio"
                          placeholder="https://github.com/username"
                          value={applicant.portfolio}
                          onChange={(e) => setApplicant({ ...applicant, portfolio: e.target.value })}
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="coverLetter" className="text-xs">Brief Note / Cover Letter</Label>
                        <Textarea
                          id="coverLetter"
                          rows={3}
                          placeholder="Describe your background and why you want to lead this curriculum..."
                          value={applicant.coverLetter}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApplicant({ ...applicant, coverLetter: e.target.value })}
                          className="text-xs"
                        />
                      </div>

                      <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-1 cursor-pointer hover:border-primary/60 transition-colors">
                        <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="text-xs font-semibold text-foreground">Attach Resume / CV (PDF, DOCX)</p>
                        <p className="text-[11px] text-muted-foreground">Up to 10MB</p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl font-bold shadow-md gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="space-y-3 border-t border-border pt-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Company Perks</p>
                <div className="space-y-2">
                  <p>• Flexible working hours and async-first culture</p>
                  <p>• Annual $3,000 learning & equipment stipend</p>
                  <p>• 401(k) retirement matching</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
