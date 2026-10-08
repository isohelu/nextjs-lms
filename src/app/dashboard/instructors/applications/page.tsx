'use client'

import React, { useState, useEffect } from 'react'
import { Eye, Edit, ArrowUpDown, Loader2, FileText } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import DocumentViewer from '@/components/document-viewer'
import { Editor } from '@/components/rich-editor'
import LoadingButton from '@/components/loading-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
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

  // Resume Modal (1:1 with Laravel DocumentViewer dialog)
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [viewingApp, setViewingApp] = useState<ApplicationItem | null>(null)

  // Status Approval Modal (1:1 with Laravel ApplicationApproval)
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
    const availableStatuses = ['pending', 'approved', 'rejected'].filter(
      (s) => s !== app.status
    )
    setNewStatus((availableStatuses[0] as 'approved' | 'pending' | 'rejected') || 'approved')
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
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          {app.designation}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Resume (exact match with Laravel View Resume dialog) */}
                  <TableCell className="px-6 py-3 capitalize">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs font-normal"
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

      {/* ── VIEW RESUME MODAL (1:1 with Laravel DocumentViewer in Dialog) ── */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <ScrollArea className="min-h-[85vh] max-h-[90vh]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-lg font-semibold">Resume</DialogTitle>
            </DialogHeader>

            <div className="p-2">
              <DocumentViewer
                src={viewingApp?.resume || ''}
                applicantName={viewingApp?.name}
                className="min-h-[75vh]"
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── APPROVAL STATUS MODAL (1:1 with Laravel ApplicationApproval) ── */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveApproval} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="approval_status">Approval Status *</Label>
              <Select
                value={newStatus}
                onValueChange={(val: 'approved' | 'pending' | 'rejected') =>
                  setNewStatus(val)
                }
              >
                <SelectTrigger id="approval_status" className="mt-1">
                  <SelectValue placeholder="Select the approval status" />
                </SelectTrigger>
                <SelectContent>
                  {['pending', 'approved', 'rejected']
                    .filter((s) => s !== selectedApp?.status)
                    .map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="capitalize"
                      >
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pb-2">
              <Label htmlFor="approval_feedback" className="mb-1.5 block">Feedback</Label>
              <Editor
                ssr={true}
                output="html"
                placeholder={{
                  paragraph: 'Enter feedback...',
                  imageCaption: 'Enter image URL...',
                }}
                contentMinHeight={200}
                contentMaxHeight={360}
                value={feedback}
                onContentChange={(val) => setFeedback(val)}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={savingStatus}
              className="w-full"
            >
              Submit
            </LoadingButton>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
