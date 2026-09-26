'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, Pencil, ArrowUpDown, FileText, Loader2 } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface BlogItem {
  id: number
  uuid?: string
  title: string
  slug: string
  status: string
  category_name?: string
  author_name?: string
  author_email?: string
  author_photo?: string
  created_at?: string
}

export default function DashboardManageBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState<'title' | 'creator' | 'status'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: 'all',
        page: String(currentPage),
        limit: String(pageSize),
      })
      if (search.trim()) {
        params.append('search', search.trim())
      }

      const res = await fetch(`/api/blogs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const list = data.blogs || data.posts || data.data || []
        setBlogs(list)
        setTotal(data.total || list.length)
      } else {
        toast.error('Failed to load blogs')
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      toast.error('Error loading blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [currentPage, pageSize, search])

  const toggleSort = (field: 'title' | 'creator' | 'status') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => {
    let aVal = ''
    let bVal = ''
    if (sortField === 'title') {
      aVal = a.title || ''
      bVal = b.title || ''
    } else if (sortField === 'creator') {
      aVal = a.author_name || ''
      bVal = b.author_name || ''
    } else if (sortField === 'status') {
      aVal = a.status || ''
      bVal = b.status || ''
    }
    const cmp = aVal.localeCompare(bVal)
    return sortOrder === 'asc' ? cmp : -cmp
  })

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Blog"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Blog' },
        ]}
        action={
          <Button asChild size="sm" className="h-9 gap-2">
            <Link href="/dashboard/blogs/create">
              <Plus className="h-4 w-4" />
              Add New Blog
            </Link>
          </Button>
        }
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Blog"
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
              <TableHead className="pl-6">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort('creator')}
                >
                  Creator
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort('title')}
                >
                  Title
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading blogs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="py-6">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No blogs found</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Get started by writing your first article.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/dashboard/blogs/create">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add New Blog
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedBlogs.map((item) => (
                <TableRow key={item.id}>
                  {/* Creator */}
                  <TableCell className="pl-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={item.author_photo || ''} className="object-cover" />
                        <AvatarFallback>
                          {(item.author_name || 'AD').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {item.author_name || 'Admin'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.author_email || 'admin@example.com'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell className="py-3 max-w-xs">
                    <Link
                      href={`/dashboard/blogs/${item.id}/edit`}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 capitalize"
                    >
                      {item.title}
                    </Link>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 text-center capitalize">
                    <span className="text-sm text-foreground">
                      {item.category_name || '--'}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 text-center">
                    <Badge
                      variant={item.status === 'published' ? 'default' : 'secondary'}
                      className="rounded-full capitalize text-xs"
                    >
                      {item.status || 'draft'}
                    </Badge>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="pr-6 py-3 text-right">
                    <div className="flex justify-end">
                      <ActionsDropdown
                        onDeleteSuccess={loadBlogs}
                        routes={[
                          {
                            label: 'Delete',
                            method: 'delete',
                            route: `/api/blogs/${item.id}`,
                            message: 'Are you sure you want to delete this blog?',
                          },
                        ]}
                        component={
                          <>
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start has-[svg]:px-2!"
                            >
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={`/blogs/${item.slug || item.uuid || item.id}`}
                              >
                                <Eye size={15} />
                                View
                              </a>
                            </Button>

                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start has-[svg]:px-2!"
                            >
                              <Link href={`/dashboard/blogs/${item.id}/edit`}>
                                <Pencil size={15} />
                                Edit
                              </Link>
                            </Button>
                          </>
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
          className="border-none p-4 sm:p-6"
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>
    </DashboardLayout>
  )
}
