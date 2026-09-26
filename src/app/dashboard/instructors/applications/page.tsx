'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Edit, ArrowUpDown, Loader2, FileText, Download } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ApplicationItem {
  instructor_id: number
  user_id: number
  name: string
  email: string
  photo?: string
  skills?: string
  biography?: string
  resume?: string
  designation?: string
  status: string
  created_at?: string
}

export default function DashboardInstructorApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Resume Modal
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [viewingApp, setViewingApp] = useState<ApplicationItem | null>(null)

  // Status Approval Modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [newStatus, setNewStatus] = useState<'approved' | 'pending' | 'rejected'>('approved')
  const [feedback, setFeedback] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  const loadApplications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/instructors/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      } else {
        toast.error('Failed to load applications')
      }
    } catch (err) {
      console.error('Error loading applications:', err)
      toast.error('Error loading applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const filtered = applications.filter((app) => {
    const term = search.toLowerCase()
    return (
      (app.name && app.name.toLowerCase().includes(term)) ||
      (app.email && app.email.toLowerCase().includes(term)) ||
      (app.designation && app.designation.toLowerCase().includes(term))
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const cmp = (a.name || '').localeCompare(b.name || '')
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleOpenResume = (app: ApplicationItem) => {
    setViewingApp(app)
    setResumeModalOpen(true)
  }

  const handleOpenApproval = (app: ApplicationItem) => {
    setSelectedApp(app)
    setNewStatus(
      app.status === 'approved'
        ? 'pending'
        : ('approved' as 'approved' | 'pending' | 'rejected')
    )
    setFeedback('')
    setApprovalModalOpen(true)
  }

  const handleSaveApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    try {
      setSavingStatus(true)
      const res = await fetch(`/api/admin/instructors/status/${selectedApp.instructor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          feedback: feedback.trim(),
        }),
      })

      if (res.ok) {
        toast.success(`Application updated to ${newStatus}`)
        setApprovalModalOpen(false)
        loadApplications()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update application status')
      }
    } catch {
      toast.error('Error updating status')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Instructor Applications"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Instructors', href: '/dashboard/instructors' },
          { title: 'Applications' },
        ]}
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Instructor List"
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setCurrentPage(1)
          }}
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz)
            setCurrentPage(1)
          }}
          tablePageSizes={[10, 15, 20, 25]}
        />

        <Table className="border-y border-border py-0">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-medium"
                  onClick={toggleSort}
                >
                  Name
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="px-6">Resume</TableHead>
              <TableHead className="px-6">Status</TableHead>
              <TableHead className="px-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading applications...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="py-6">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No applications found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No candidate submissions match your query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((app) => (
                <TableRow key={app.instructor_id}>
                  {/* Name */}
                  <TableCell className="px-6 py-3">
                    <div className="capitalize">
                      <p className="font-medium text-foreground">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                      {app.designation && (
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                          {app.designation}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Resume */}
                  <TableCell className="px-6 py-3 capitalize">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => handleOpenResume(app)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Resume
                    </Button>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-3 capitalize">
                    <Badge
                      variant={
                        app.status === 'approved'
                          ? 'default'
                          : app.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="rounded-full capitalize text-xs"
                    >
                      {app.status}
                    </Badge>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full h-8 w-8"
                        onClick={() => handleOpenApproval(app)}
                        title="Edit Status"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TableFooter
          className="border-none p-4 sm:p-6"
          currentPage={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {/* View Resume Modal */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume & Profile: {viewingApp?.name}</DialogTitle>
          </DialogHeader>

          {viewingApp && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 text-xs">
                <div>
                  <span className="font-semibold text-foreground block">Email:</span>
                  <span className="text-muted-foreground">{viewingApp.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Designation:</span>
                  <span className="text-muted-foreground">{viewingApp.designation || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Status:</span>
                  <span className="capitalize text-muted-foreground">{viewingApp.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Applied At:</span>
                  <span className="text-muted-foreground">
                    {viewingApp.created_at ? new Date(viewingApp.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {viewingApp.skills && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Skills & Expertise</Label>
                  <p className="text-xs text-muted-foreground bg-card border rounded-lg p-3">
                    {viewingApp.skills}
                  </p>
                </div>
              )}

              {viewingApp.biography && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Professional Biography</Label>
                  <p className="text-xs text-muted-foreground bg-card border rounded-lg p-3 whitespace-pre-wrap">
                    {viewingApp.biography}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Resume Document</Label>
                <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {viewingApp.resume || 'resume.pdf'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Verified Document Portfolio</p>
                    </div>
                  </div>
                  {viewingApp.resume ? (
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                      <a href={viewingApp.resume.startsWith('/') ? viewingApp.resume : `/${viewingApp.resume}`} target="_blank" rel="noreferrer">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No document attached</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setResumeModalOpen(false)}>
              Close
            </Button>
            {viewingApp && (
              <Button
                onClick={() => {
                  setResumeModalOpen(false)
                  handleOpenApproval(viewingApp)
                }}
              >
                Change Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Status Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveApproval} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="app-status">Approval Status *</Label>
              <Select
                value={newStatus}
                onValueChange={(val: 'approved' | 'pending' | 'rejected') =>
                  setNewStatus(val)
                }
              >
                <SelectTrigger id="app-status">
                  <SelectValue placeholder="Select approval status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-feedback">Feedback (Optional)</Label>
              <Textarea
                id="app-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback or notes to the applicant..."
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApprovalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingStatus}>
                {savingStatus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
