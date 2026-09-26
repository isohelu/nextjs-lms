'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText,
  Mail,
  UserCheck,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function AdminInstructorsApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'approved' | 'rejected'>('All')

  const loadApplications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/instructors/applications')
      if (res.ok) {
        const data = await res.json()
        if (data.applications) {
          setApplications(data.applications)
        }
      }
    } catch (err) {
      console.error('Error loading applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleStatusChange = async (id: number | string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/instructors/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app))
      } else {
        alert('Failed to update applicant status.')
      }
    } catch (err) {
      console.error('Error changing applicant status:', err)
    }
  }

  const filtered = applications.filter((app) => {
    const matchesSearch =
      (app.name && app.name.toLowerCase().includes(search.toLowerCase())) ||
      (app.email && app.email.toLowerCase().includes(search.toLowerCase())) ||
      (app.expertise && app.expertise.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = filterStatus === 'All' || (app.status || 'pending').toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Instructor Candidate Applications</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review credential submissions, verify resume portfolios, and promote candidates to instructor roles.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search applicant name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={filterStatus === tab ? 'default' : 'outline'}
                onClick={() => setFilterStatus(tab)}
                className="text-xs font-semibold h-8 capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Application Cards */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading instructor candidates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No candidate applications found</p>
            <p className="text-xs text-muted-foreground mt-1">Pending instructor applications will appear here for review.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <Card key={app.id} className="p-6 border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{app.name}</h3>
                    <span className={cn(
                      'text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1',
                      (app.status || 'pending').toLowerCase() === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : (app.status || 'pending').toLowerCase() === 'rejected'
                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    )}>
                      {(app.status || 'pending').toLowerCase() === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {(app.status || 'pending').toLowerCase() === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                      {(app.status || 'pending').toLowerCase() === 'pending' && <Clock className="h-3.5 w-3.5" />}
                      {app.status || 'pending'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {app.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Expertise: <strong className="text-foreground">{app.expertise || 'Specialist'}</strong></span>
                    <span>•</span>
                    <span>Experience: <strong className="text-foreground">{app.experienceYears || app.experience || '5'} years</strong></span>
                    <span>•</span>
                    <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}</span>
                  </div>

                  {app.bio && (
                    <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border mt-1">
                      {app.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 self-end md:self-center shrink-0">
                  {app.cvUrl && app.cvUrl !== '#' && (
                    <Button asChild size="sm" variant="outline" className="text-xs h-8">
                      <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View CV / Resume
                      </a>
                    </Button>
                  )}

                  {(app.status || 'pending').toLowerCase() === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(app.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Approve Candidate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                        className="text-xs h-8 text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
