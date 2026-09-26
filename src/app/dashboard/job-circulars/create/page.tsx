'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export default function CreateJobCircularPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Remote')
  const [jobType, setJobType] = useState('full-time')
  const [workType, setWorkType] = useState('remote')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [deadline, setDeadline] = useState('2026-12-31')
  const [contactEmail, setContactEmail] = useState('careers@mentorlms.com')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    try {
      setSaving(true)
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          location,
          job_type: jobType,
          work_type: workType,
          experience_level: experienceLevel,
          application_deadline: deadline,
          contact_email: contactEmail,
          description: description.trim(),
          skills_required: ['React', 'TypeScript', 'Node.js']
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/job-circulars')
        }, 1200)
      } else {
        alert(data.message || 'Failed to create job posting.')
      }
    } catch (err) {
      console.error('Error creating job posting:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/job-circulars" className="hover:text-foreground">Job Circulars</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Create Job</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Post Job Opening</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create new employment circulars for your organization or teaching faculty.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Job circular published successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Full-Stack Next.js Instructor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold">Job Type</Label>
                <select
                  id="type"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="work" className="text-xs font-semibold">Work Arrangement</Label>
                <select
                  id="work"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-Site</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc" className="text-xs font-semibold">Location</Label>
                <Input
                  id="loc"
                  placeholder="e.g. Global Remote or New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-xs font-semibold">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">Job Description & Responsibilities</Label>
              <Textarea
                id="desc"
                rows={7}
                placeholder="Responsibilities, requirements, qualifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/job-circulars">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Job
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
