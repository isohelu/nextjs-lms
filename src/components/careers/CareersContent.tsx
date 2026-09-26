'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Eye,
  MapPin,
  TrendingUp,
  Search,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import jobCircularsData from '@/lib/data/job-circulars.json'

interface JobCircular {
  id: number
  uuid: string
  title: string
  status: string
  location: string
  job_type: string
  work_type: string
  experience_level: string
  positions_available: number
  application_deadline: string
}

export default function CareersContent() {
  const [search, setSearch] = useState('')
  const jobs = (jobCircularsData as JobCircular[]) || []

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase())
    )
  }, [jobs, search])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      active: 'default',
      paused: 'secondary',
      closed: 'destructive',
      expired: 'destructive',
    }

    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 my-20">
      <Card className="shadow-none! border border-border bg-card">
        {/* Table Header / Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Job Circulars</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job circulars..."
              className="pl-9 rounded-xl h-9 text-xs"
            />
          </div>
        </div>

        <CardContent className="p-6">
          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 hover:underline">
                        <Link href={`/job-circulars/${job.uuid || job.id}`}>
                          <h3 className="text-lg font-semibold text-foreground">
                            {job.title}
                          </h3>
                        </Link>
                        {getStatusBadge(job.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <Building2 className="h-4 w-4" />
                          {job.work_type}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <TrendingUp className="h-4 w-4" />
                          {job.experience_level}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <BriefcaseBusiness className="h-4 w-4" />
                          {job.positions_available} Position
                          {job.positions_available !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.application_deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="secondary" size="icon" asChild>
                      <Link href={`/job-circulars/${job.uuid || job.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No job circulars found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first job circular
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
