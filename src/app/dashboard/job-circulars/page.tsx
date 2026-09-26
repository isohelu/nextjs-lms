'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Plus,
  Eye,
  MapPin,
  Calendar,
  Loader2,
  Building2,
  Trash2,
  TrendingUp,
  BriefcaseBusiness,
  Power
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown, { ActionRoute } from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface JobCircular {
  id: number
  uuid?: string
  title: string
  slug: string
  job_type: string
  work_type: string
  experience_level: string
  location: string
  application_deadline: string
  positions_available?: number
  status: string
  created_at: string
}

export default function DashboardJobCircularsPage() {
  const [jobs, setJobs] = useState<JobCircular[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const loadJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/jobs?all=true')
      if (res.ok) {
        const data = await res.json()
        if (data.jobs) {
          setJobs(data.jobs)
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleToggleStatus = async (job: JobCircular) => {
    const newStatus = job.status === 'active' || job.status === 'published' ? 'draft' : 'active'
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
        )
      }
    } catch (err) {
      console.error('Failed to toggle job status:', err)
    }
  }

  const handleDeleteSuccess = (jobId: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs
    const q = search.toLowerCase()
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.job_type?.toLowerCase().includes(q)
    )
  }, [jobs, search])

  const total = filteredJobs.length
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredJobs.slice(start, start + pageSize)
  }, [filteredJobs, currentPage, pageSize])

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'active' || s === 'published') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300 text-[11px] font-semibold">
          Active
        </Badge>
      )
    }
    if (s === 'draft') {
      return (
        <Badge variant="outline" className="text-slate-600 border-slate-300 text-[11px] font-medium">
          Draft
        </Badge>
      )
    }
    if (s === 'closed') {
      return (
        <Badge variant="destructive" className="text-[11px] font-medium">
          Closed
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-[11px] font-medium">
        {status}
      </Badge>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Standard Breadcrumbs Header */}
        <Breadcrumbs
          title="Job Circulars"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Job Circulars' },
          ]}
          action={
            <Button asChild className="h-9 px-4 gap-2">
              <Link href="/dashboard/job-circulars/create">
                <Plus className="h-4 w-4" />
                <span>Job Circular</span>
              </Link>
            </Button>
          }
          className="mb-4"
        />

        {/* Job Circulars List Card */}
        <Card className="rounded-2xl border border-border/80 bg-white overflow-hidden shadow-xs">
          <TableFilter
            title="Job Circulars List"
            Icon={<Briefcase className="h-5 w-5 text-primary" />}
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setCurrentPage(1)
            }}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            tablePageSizes={[10, 15, 20, 25]}
          />

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading job circulars...</p>
            </div>
          ) : paginatedJobs.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No circulars posted</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Create job postings to hire instructors, educators, or engineers.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/job-circulars/create">
                  <Plus className="h-4 w-4 mr-1.5" /> Create Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[320px] font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Position
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Type & Arrangement
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Location
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Deadline
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => {
                    const isActive = job.status === 'active' || job.status === 'published'
                    const deleteRoutes: ActionRoute[] = [
                      {
                        label: 'Delete',
                        method: 'delete',
                        route: `/api/jobs/${job.id}`,
                        message: 'Are you sure you want to delete this job circular?',
                      },
                    ]

                    return (
                      <TableRow key={job.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                              {job.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">ID: #{job.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground capitalize">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {job.job_type || 'Full-time'} &bull; {job.work_type || 'Remote'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {job.application_deadline
                                ? new Date(job.application_deadline).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Ongoing'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="py-3.5 text-right">
                          <div className="flex items-center justify-end">
                            <ActionsDropdown
                              routes={deleteRoutes}
                              onDeleteSuccess={() => handleDeleteSuccess(job.id)}
                              component={
                                <>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                  >
                                    <Link href={`/job-circulars/${job.uuid || job.slug || job.id}`} target="_blank">
                                      <Eye className="h-4 w-4" />
                                      <span>View</span>
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    onClick={() => handleToggleStatus(job)}
                                  >
                                    <Power className="h-4 w-4" />
                                    <span>{isActive ? 'Set to Draft' : 'Activate'}</span>
                                  </Button>
                                </>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <TableFooter
            currentPage={currentPage}
            total={total}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}
