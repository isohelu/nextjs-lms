'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  GraduationCap,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export default function CreateInstructorPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [headline, setHeadline] = useState('Senior Course Instructor')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('React, Next.js, Node.js, Python')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users)
          if (data.users.length > 0) {
            setSelectedUserId(data.users[0].id.toString())
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return

    try {
      setSaving(true)
      // Upgrade user role to instructor and update profile
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'instructor',
          headline,
          bio
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/instructors')
        }, 1200)
      } else {
        alert(data.message || 'Failed to create instructor.')
      }
    } catch (err) {
      console.error('Error creating instructor:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/instructors" className="hover:text-foreground">Instructors</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Create Instructor</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Promote User to Instructor</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grant educator permissions, authoring capabilities, and profile badges to a registered learner.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Instructor created successfully! Redirecting to directory...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user" className="text-xs font-semibold">Select User Account</Label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs"
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - Current Role: {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="headline" className="text-xs font-semibold">Professional Headline / Title</Label>
              <Input
                id="headline"
                placeholder="e.g. Lead Software Architect & Tech Speaker"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills" className="text-xs font-semibold">Core Expertise / Skills</Label>
              <Input
                id="skills"
                placeholder="e.g. Full-Stack, Machine Learning, UI/UX"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold">Instructor Bio & Experience</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Brief summary of teaching experience and achievements..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/instructors">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Instructor
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
