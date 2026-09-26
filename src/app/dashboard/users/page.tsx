'use client'

import React, { useState, useEffect } from 'react'
import { Pencil, ArrowUpDown, Loader2, Users } from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface UserItem {
  id: number
  name: string
  email: string
  role: string
  status?: number | string
  created_at?: string
  photo?: string
}

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState<string>('1')
  const [editRole, setEditRole] = useState<string>('student')
  const [savingEdit, setSavingEdit] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      })
      if (search.trim()) {
        params.append('search', search.trim())
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const list = data.users || []
        setUsers(list)
        setTotal(data.total || list.length)
      } else {
        toast.error('Failed to load users')
      }
    } catch (err) {
      console.error('Error loading users:', err)
      toast.error('Error loading users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [currentPage, pageSize, search])

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedUsers = [...users].sort((a, b) => {
    const cmp = (a.name || '').localeCompare(b.name || '')
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user)
    setEditName(user.name || '')
    setEditStatus(
      user.status === 1 || user.status === '1' || user.status === 'active' || user.status === 'Active'
        ? '1'
        : '0'
    )
    setEditRole(user.role || 'student')
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    if (!editName.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setSavingEdit(true)
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          status: Number(editStatus),
          role: editRole,
        }),
      })

      if (res.ok) {
        toast.success('User updated successfully')
        setEditModalOpen(false)
        loadUsers()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update user')
      }
    } catch {
      toast.error('Error updating user')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Users"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Users' },
        ]}
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="User List"
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
              <TableHead className="px-6">Status</TableHead>
              <TableHead className="px-6">Role</TableHead>
              <TableHead className="px-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="py-6">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No user accounts match your search filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => {
                const isActive =
                  user.status === 1 ||
                  user.status === '1' ||
                  user.status === 'active' ||
                  user.status === 'Active'

                return (
                  <TableRow key={user.id}>
                    {/* User Profile */}
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={user.photo || ''} className="object-cover" />
                          <AvatarFallback>
                            {(user.name || 'US').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="mb-0.5 text-base font-medium leading-tight text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-3 capitalize">
                      <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="px-6 py-3 capitalize">
                      <span className="text-foreground">{user.role}</span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="px-6 py-3 text-right">
                      <div className="flex justify-end">
                        <ActionsDropdown
                          onDeleteSuccess={loadUsers}
                          routes={[
                            {
                              label: 'Delete',
                              method: 'delete',
                              route: `/api/admin/users/${user.id}`,
                              message: 'Are you sure you want to delete this user?',
                            },
                          ]}
                          component={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start has-[svg]:px-2!"
                              onClick={() => handleOpenEdit(user)}
                            >
                              <Pencil size={15} />
                              Edit
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
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

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Name</Label>
              <Input
                id="edit-user-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val)}
              >
                <SelectTrigger id="edit-user-status">
                  <SelectValue placeholder="Select approval status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(val) => setEditRole(val)}
              >
                <SelectTrigger id="edit-user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Close
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
