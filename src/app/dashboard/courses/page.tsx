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

export default function DashboardManageCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<'name' | 'price' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const loadCourses = async () => {
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

      const res = await fetch(`/api/courses?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.courses) {
          setCourses(data.courses)
          setTotal(data.total || 0)
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [currentPage, pageSize, statusFilter, search])

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Course deleted successfully')
        loadCourses()
      } else {
        toast.error(data.message || 'Failed to delete course')
      }
    } catch (err) {
      console.error('Failed to delete course:', err)
      toast.error('Failed to delete course')
    }
  }

  const toggleSort = (field: 'name' | 'price') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedCourses = [...courses].sort((a, b) => {
    if (!sortField) return 0
    if (sortField === 'name') {
      const nameA = (a.instructor_name || '').toLowerCase()
      const nameB = (b.instructor_name || '').toLowerCase()
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    }
    if (sortField === 'price') {
      const priceA = Number(a.price || 0)
      const priceB = Number(b.price || 0)
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
    }
    return 0
  })

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Courses"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Courses' },
        ]}
        action={
          <Button asChild className="h-9 px-4">
            <Link href="/dashboard/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
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
              {/* Instructor */}
              <TableHead>
                <Button
                  variant="ghost"
                  className="ml-1 hover:bg-transparent font-semibold"
                  onClick={() => toggleSort('name')}
                >
                  Name
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>

              {/* Course Title */}
              <TableHead className="font-semibold">Course Title</TableHead>

              {/* Status Filter */}
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
                    {['all', 'published', 'draft', 'archived'].map((st) => (
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

              {/* Category */}
              <TableHead className="text-center font-semibold">Category</TableHead>

              {/* Category Child */}
              <TableHead className="text-center font-semibold whitespace-nowrap">
                Category Child
              </TableHead>

              {/* Price */}
              <TableHead className="text-center font-semibold">
                <Button
                  variant="ghost"
                  className="hover:bg-transparent font-semibold mx-auto"
                  onClick={() => toggleSort('price')}
                >
                  Price
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>

              {/* Assignments */}
              <TableHead className="text-center font-semibold">Assignments</TableHead>

              {/* Actions */}
              <TableHead className="pr-4 text-end font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading courses...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedCourses.length > 0 ? (
              sortedCourses.map((course) => (
                <TableRow key={course.id}>
                  {/* Instructor */}
                  <TableCell>
                    <div className="pl-4">
                      <p className="mb-0.5 text-base font-medium">
                        {course.instructor_name || 'Admin Instructor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.instructor_email || 'instructor@example.com'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Course Title */}
                  <TableCell>
                    <div className="py-1 capitalize font-medium">
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {course.title}
                      </Link>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="py-1 text-center capitalize text-sm">
                      {course.status || 'draft'}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <div className="py-1 text-center capitalize text-sm">
                      <p>{course.category_title || '--'}</p>
                    </div>
                  </TableCell>

                  {/* Category Child */}
                  <TableCell>
                    <div className="py-1 text-center capitalize text-sm">
                      <p>{course.category_child_title || '--'}</p>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <div className="py-1 text-center capitalize text-sm">
                      <p>
                        {course.price && Number(course.price) > 0
                          ? `$${Number(course.price).toFixed(2)}`
                          : 'Free'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Assignments Count */}
                  <TableCell>
                    <div className="py-1 text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/courses/${course.id}/assignments`}>
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          {course.assignments_count || 0}{' '}
                          {(course.assignments_count || 0) === 1
                            ? 'Assignment'
                            : 'Assignments'}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex justify-end py-1 pr-4">
                      <ActionsDropdown
                        className="max-w-36"
                        routes={[
                          {
                            label: 'Edit',
                            method: 'get',
                            route: `/dashboard/courses/${course.id}`,
                          },
                          {
                            label: 'Delete',
                            method: 'delete',
                            route: `/api/courses/${course.id}`,
                            message:
                              'Are you sure you want to delete this course? This action cannot be undone.',
                          },
                        ]}
                        onDeleteSuccess={loadCourses}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No courses found.
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
