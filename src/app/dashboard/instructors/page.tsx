'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, ArrowUpDown, Loader2, Users } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface InstructorItem {
  id: number
  user_id: number
  name: string
  email: string
  photo?: string
  status: string
  courses_count: number
}

export default function DashboardManageInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Status Approval Modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorItem | null>(null)
  const [newStatus, setNewStatus] = useState<'approved' | 'pending' | 'rejected'>('approved')
  const [feedback, setFeedback] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  const loadInstructors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      })
      if (search.trim()) {
        params.append('search', search.trim())
      }

      const res = await fetch(`/api/admin/instructors?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const list = data.instructors || []
        setInstructors(list)
        setTotal(data.total || list.length)
      } else {
        toast.error('Failed to load instructors')
      }
    } catch (err) {
      console.error('Error loading instructors:', err)
      toast.error('Error loading instructors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInstructors()
  }, [currentPage, pageSize, search])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedInstructors = [...instructors].sort((a, b) => {
    const cmp = (a.name || '').localeCompare(b.name || '')
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const handleOpenApproval = (inst: InstructorItem) => {
    setSelectedInstructor(inst)
    setNewStatus(
      inst.status === 'approved'
        ? 'pending'
        : ('approved' as 'approved' | 'pending' | 'rejected')
    )
    setFeedback('')
    setApprovalModalOpen(true)
  }

  const handleSaveApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInstructor) return

    try {
      setSavingStatus(true)
      const res = await fetch(`/api/admin/instructors/status/${selectedInstructor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          feedback: feedback.trim(),
        }),
      })

      if (res.ok) {
        toast.success(`Instructor status updated to ${newStatus}`)
        setApprovalModalOpen(false)
        loadInstructors()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update instructor status')
      }
    } catch {
      toast.error('Error updating instructor status')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Instructors"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Instructors' },
        ]}
        action={
          <Button asChild className="gap-2">
            <Link href="/dashboard/instructors/create">
              <Plus className="h-4 w-4" />
              Add Instructor
            </Link>
          </Button>
        }
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

        <Table className="border-y border-border">
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
              <TableHead className="px-6">Number of Course</TableHead>
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
                    <span className="text-xs text-muted-foreground">Loading instructors...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedInstructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="py-6">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No instructors found</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Add certified educators or approve instructor applications.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/dashboard/instructors/create">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Instructor
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedInstructors.map((inst) => (
                <TableRow key={inst.id}>
                  {/* Instructor Profile */}
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage src={inst.photo || ''} className="object-cover" />
                        <AvatarFallback>
                          {(inst.name || 'IN').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="mb-0.5 text-base font-medium leading-tight text-foreground">
                          {inst.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inst.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Number of Courses */}
                  <TableCell className="px-6 py-3 capitalize">
                    <p className="text-sm font-medium">{inst.courses_count || 0}</p>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-3 capitalize">
                    <span className="text-foreground">{inst.status}</span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-6 py-3 text-right">
                    <div className="flex justify-end">
                      <ActionsDropdown
                        onDeleteSuccess={loadInstructors}
                        routes={[
                          {
                            label: 'Delete',
                            method: 'delete',
                            route: `/api/admin/instructors?id=${inst.id}`,
                            message: 'Are you sure you want to delete this instructor?',
                          },
                        ]}
                        component={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start has-[svg]:px-2!"
                            onClick={() => handleOpenApproval(inst)}
                          >
                            <Pencil size={15} />
                            Status
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TableFooter
          className="border-none p-5 sm:p-6"
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {/* Approval Status Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveApproval} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="approval-status">Approval Status *</Label>
              <Select
                value={newStatus}
                onValueChange={(val: 'approved' | 'pending' | 'rejected') =>
                  setNewStatus(val)
                }
              >
                <SelectTrigger id="approval-status">
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
              <Label htmlFor="approval-feedback">Feedback (Optional)</Label>
              <Textarea
                id="approval-feedback"
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
