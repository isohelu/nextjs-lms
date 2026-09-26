'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowUpDown, Eye, ChevronsUpDown, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/breadcrumbs'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function DashboardManageExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<'instructor' | 'enrollments' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const loadExams = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        status: statusFilter,
      })
      if (search.trim()) {
        queryParams.set('search', search.trim())
      }

      const res = await fetch(`/api/exams?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.exams) {
          setExams(data.exams)
          setTotal(data.total || 0)
        }
      }
    } catch (err) {
      console.error('Error loading exams:', err)
      toast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
  }, [currentPage, pageSize, statusFilter, search])

  const handleDeleteExam = async (examId: number) => {
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Exam deleted successfully')
        loadExams()
      } else {
        toast.error(data.message || 'Failed to delete exam')
      }
    } catch (err) {
      console.error('Failed to delete exam:', err)
      toast.error('Failed to delete exam')
    }
  }

  const toggleSort = (field: 'instructor' | 'enrollments') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedExams = [...exams].sort((a, b) => {
    if (!sortField) return 0
    if (sortField === 'instructor') {
      const nameA = (a.instructor_name || '').toLowerCase()
      const nameB = (b.instructor_name || '').toLowerCase()
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    }
    if (sortField === 'enrollments') {
      const countA = Number(a.enrollments_count || 0)
      const countB = Number(b.enrollments_count || 0)
      return sortOrder === 'asc' ? countA - countB : countB - countA
    }
    return 0
  })

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Exams"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Exams' },
        ]}
        action={
          <Button asChild className="h-9 px-4">
            <Link href="/dashboard/exams/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Link>
          </Button>
        }
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Exam List"
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
              {/* Instructor */}
              <TableHead>
                <div className="flex items-center pl-1">
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-semibold"
                    onClick={() => toggleSort('instructor')}
                  >
                    Instructor
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>

              {/* Exam Title */}
              <TableHead className="font-semibold">Exam Title</TableHead>

              {/* Status */}
              <TableHead className="text-center font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground capitalize h-8 gap-1 mx-auto"
                    >
                      <span>{statusFilter === 'all' ? 'Status' : statusFilter}</span>
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="min-w-25">
                    {['all', 'draft', 'published', 'archived'].map((st) => (
                      <DropdownMenuItem
                        key={st}
                        onClick={() => {
                          setStatusFilter(st)
                          setCurrentPage(1)
                        }}
                        className={cn(
                          'cursor-pointer text-center capitalize justify-center',
                          statusFilter === st && 'bg-primary/10 text-primary font-bold'
                        )}
                      >
                        {st}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>

              {/* Level */}
              <TableHead className="text-center font-semibold">Level</TableHead>

              {/* Enrollments */}
              <TableHead className="text-center font-semibold">
                <Button
                  variant="ghost"
                  className="hover:bg-transparent font-semibold mx-auto"
                  onClick={() => toggleSort('enrollments')}
                >
                  Enrollments
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>

              {/* Price */}
              <TableHead className="text-center font-semibold">Price</TableHead>

              {/* Attempts */}
              <TableHead className="text-center font-semibold">Attempts</TableHead>

              {/* Actions */}
              <TableHead className="pr-4 text-end font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading exams...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedExams.length > 0 ? (
              sortedExams.map((exam) => {
                const discountPrice = exam.discount_price ? Number(exam.discount_price) : null
                const price = exam.price ? Number(exam.price) : 0
                const displayPrice = discountPrice || price

                return (
                  <TableRow key={exam.id}>
                    {/* Instructor */}
                    <TableCell className="py-3">
                      <div className="pl-4">
                        <p className="mb-0.5 text-base font-medium">
                          {exam.instructor_name || 'Admin Instructor'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exam.instructor_email || 'instructor@example.com'}
                        </p>
                      </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-3">
                      <div className="py-1">
                        <Link
                          href={`/dashboard/exams/${exam.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          {exam.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {exam.category_title || 'General'}
                        </p>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant={exam.status === 'published' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {exam.status || 'draft'}
                      </Badge>
                    </TableCell>

                    {/* Level */}
                    <TableCell className="py-3 text-center">
                      {exam.level ? (
                        <Badge variant="outline" className="capitalize">
                          {exam.level}
                        </Badge>
                      ) : (
                        '--'
                      )}
                    </TableCell>

                    {/* Enrollments */}
                    <TableCell className="py-3 text-center font-medium">
                      {exam.enrollments_count || 0}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3 text-center">
                      {exam.pricing_type === 'paid' ? (
                        <span className="font-semibold">
                          ${displayPrice.toFixed(2)}
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800"
                        >
                          Free
                        </Badge>
                      )}
                    </TableCell>

                    {/* Attempts */}
                    <TableCell className="py-3 text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/exams/${exam.id}/attempts`}>
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          {exam.attempts_count || 0}{' '}
                          {(exam.attempts_count || 0) === 1 ? 'Attempt' : 'Attempts'}
                        </Link>
                      </Button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3">
                      <div className="flex justify-end pr-4">
                        <ActionsDropdown
                          className="max-w-36"
                          routes={[
                            {
                              label: 'View',
                              method: 'get',
                              route: `/exams/${exam.slug || exam.id}`,
                            },
                            {
                              label: 'Edit',
                              method: 'get',
                              route: `/dashboard/exams/${exam.id}`,
                            },
                            {
                              label: 'Delete',
                              method: 'delete',
                              route: `/api/exams/${exam.id}`,
                              message: `Are you sure you want to delete "${exam.title}"? This action cannot be undone.`,
                            },
                          ]}
                          onDeleteSuccess={loadExams}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No exams found.
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
    </DashboardLayout>
  )
}
