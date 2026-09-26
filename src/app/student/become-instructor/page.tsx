'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function BecomeInstructorPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    expertise: 'Web Development',
    biography: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/instructors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation: formData.designation || 'Software Engineer',
          biography: formData.biography || 'Passionate educator and engineer.',
          skills: [formData.expertise],
          resume: 'https://linkedin.com/in/' + (formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : 'engineer')
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsSubmitted(true)
      } else {
        setErrorMessage(data.message || 'Failed to submit instructor application.')
      }
    } catch {
      setErrorMessage('Network error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-3xl flex items-center gap-3">
          <Link href="/student" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Apply to Become an Instructor</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Share your real-world engineering expertise with over 68,000+ ambitious learners.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-3xl py-10">
        <Card className="p-8 border-border shadow-md space-y-6 bg-card">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {errorMessage}
            </div>
          )}
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Application Received!</h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Our pedagogical review council will examine your qualifications and track record. Expect an onboarding decision within 3 business days.
                </p>
              </div>
              <Button asChild className="rounded-xl mt-4">
                <Link href="/student">Return to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Legal Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Dr. Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work / Academic Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="alex@stanford.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="designation">Professional Designation / Current Title</Label>
                  <Input
                    id="designation"
                    required
                    placeholder="Staff Infrastructure Architect"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expertise">Primary Field of Expertise</Label>
                  <select
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                  >
                    <option>Web Development & React</option>
                    <option>Cloud Infrastructure & Kubernetes</option>
                    <option>AI, LLMs & Autonomous Agents</option>
                    <option>Cybersecurity & Pen Testing</option>
                    <option>Database Systems & Performance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Professional Biography & Teaching Experience</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  required
                  placeholder="Outline your engineering pedigree, past teaching engagements, or published technical works..."
                  value={formData.biography}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, biography: e.target.value })}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">Attach Curriculum Vitae / Resume (PDF)</p>
                <p className="text-[11px] text-muted-foreground">Up to 10MB</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-bold shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Instructor Application
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
