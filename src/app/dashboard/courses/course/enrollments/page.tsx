'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  Loader2,
  CheckCircle2,
  Mail
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CourseEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/enrollments/courses')
      if (res.ok) {
        const data = await res.json()
        if (data.enrollments) {
          setEnrollments(data.enrollments)
        }
      }
    } catch (err) {
      console.error('Error fetching course enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnrollments()
  }, [])

  const filtered = enrollments.filter((e) => {
    const term = search.toLowerCase()
    return (
      (e.user_name && e.user_name.toLowerCase().includes(term)) ||
      (e.user_email && e.user_email.toLowerCase().includes(term)) ||
      (e.course_title && e.course_title.toLowerCase().includes(term))
    )
  })

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Course Enrollments"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Course Enrollments' },
        ]}
        className="mb-4"
      />

      <div className="space-y-6">
        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Enrollments Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading course enrollments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No enrollments recorded</p>
              <p className="text-xs text-muted-foreground mt-1">Student course enrollments will show up here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Enrollment Type</th>
                    <th className="py-3 px-4">Enrolled At</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#007867]/10 text-[#007867] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {(item.user_name || 'U')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{item.user_name || 'Anonymous Learner'}</p>
                            <p className="text-[11px] text-muted-foreground">{item.user_email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground line-clamp-1">{item.course_title || `Course #${item.course_id}`}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {item.enrollment_type || 'regular'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
