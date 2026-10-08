'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Loader2, Users } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
  } catch {
    return dateString
  }
}

interface Enrollment {
  id: number
  user?: {
    id: number
    name: string
    email: string
    photo?: string | null
  }
  user_name?: string
  user_email?: string
  course?: {
    id: number
    title: string
  }
  course_title?: string
  entry_date: string
  expiry_date?: string | null
}

export default function CourseEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

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
      toast.error('Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  const loadCoursesAndUsers = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        fetch('/api/courses?limit=100'),
        fetch('/api/users?limit=100'),
      ])
      if (coursesRes.ok) {
        const cData = await coursesRes.json()
        setCourses(cData.courses || [])
      }
      if (usersRes.ok) {
        const uData = await usersRes.json()
        setUsers(uData.users || [])
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  useEffect(() => {
    loadEnrollments()
    loadCoursesAndUsers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/enrollments/courses?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Enrollment removed')
        loadEnrollments()
      } else {
        toast.error('Failed to remove enrollment')
      }
    } catch {
      toast.error('Failed to remove enrollment')
    }
  }

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !selectedCourseId) {
      toast.error('Please select both a student and a course')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/enrollments/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(selectedUserId),
          course_id: Number(selectedCourseId),
        }),
      })
      if (res.ok) {
        toast.success('Student enrolled successfully')
        setModalOpen(false)
        setSelectedUserId('')
        setSelectedCourseId('')
        loadEnrollments()
      } else {
        toast.error('Failed to create enrollment')
      }
    } catch {
      toast.error('Error creating enrollment')
    } finally {
      setSaving(false)
    }
  }

  const filteredEnrollments = enrollments.filter((e) => {
    const term = search.toLowerCase()
    const name = e.user?.name || e.user_name || ''
    const email = e.user?.email || e.user_email || ''
    const title = e.course?.title || e.course_title || ''
    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      title.toLowerCase().includes(term)
    )
  })

  const total = filteredEnrollments.length
  const paginated = filteredEnrollments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Enrollments"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Course Enrollments' },
        ]}
        action={
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2 h-9 px-4">
            <Plus className="h-4 w-4" />
            <span>Add Enrollment</span>
          </Button>
        }
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Course List"
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setCurrentPage(1)
          }}
          pageSize={pageSize}
          onPageSizeChange={(val) => {
            setPageSize(val)
            setCurrentPage(1)
          }}
          tablePageSizes={[10, 15, 20, 25]}
        />

        <Table className="border-y border-border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">#</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Enrolled Course</TableHead>
              <TableHead className="font-semibold">Enrolled Date</TableHead>
              <TableHead className="font-semibold">Expiry Date</TableHead>
              <TableHead className="pr-4 text-end font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading enrollments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((row, idx) => {
                const userName = row.user?.name || row.user_name || 'Student'
                const userEmail = row.user?.email || row.user_email || 'student@mentor.test'
                const userPhoto = row.user?.photo
                const courseTitle = row.course?.title || row.course_title || 'Course'
                const entryDate = formatDate(row.entry_date) || 'N/A'
                const expiryDate = row.expiry_date ? formatDate(row.expiry_date) : null

                return (
                  <TableRow key={row.id || idx}>
                    <TableCell className="w-12 pl-4 text-center font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                          {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="h-full w-full object-cover" />
                          ) : (
                            userName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{userName}</p>
                          <p className="text-xs text-muted-foreground">{userEmail}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-md">
                        <p className="line-clamp-1 text-sm font-medium">{courseTitle}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">{entryDate}</TableCell>

                    <TableCell>
                      {expiryDate ? (
                        <span className="text-sm">{expiryDate}</span>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950 dark:text-green-300">
                          Lifetime Access
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="pr-4 text-end">
                      <div className="flex justify-end pr-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(row.id)}
                          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No enrollments recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TableFooter
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add Enrollment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course Enrollment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateEnrollment} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="student-select">Select Student *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="student-select" className="mt-1">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course-select">Select Course *</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger id="course-select" className="mt-1">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll Student'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
