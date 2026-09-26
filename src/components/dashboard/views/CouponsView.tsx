'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Copy,
  Trash2,
  Calendar,
  Check,
  Tag,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function CouponsView() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    discount: '',
    discount_type: 'percentage',
    course_id: 'global',
    valid_from: '',
    valid_to: '',
  })

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/coupons')
      if (res.ok) {
        const data = await res.json()
        if (data.coupons) {
          setCoupons(data.coupons)
        }
      }
    } catch (err) {
      console.error('Error loading coupons:', err)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses?limit=100')
      if (res.ok) {
        const data = await res.json()
        if (data.courses) {
          setCourses(data.courses)
        }
      }
    } catch {}
  }

  useEffect(() => {
    loadCoupons()
    loadCourses()
  }, [])

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Coupon code "${code}" copied to clipboard!`)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/instructor/coupons?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Coupon deleted successfully')
        loadCoupons()
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch {
      toast.error('Error deleting coupon')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    if (!form.discount || Number(form.discount) <= 0) {
      toast.error('Please enter a valid discount amount')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/instructor/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          discount: Number(form.discount),
          discount_type: form.discount_type,
          course_id: form.course_id === 'global' ? null : Number(form.course_id),
          valid_from: form.valid_from || null,
          valid_to: form.valid_to || null,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Coupon created successfully')
        setModalOpen(false)
        setForm({
          code: '',
          discount: '',
          discount_type: 'percentage',
          course_id: 'global',
          valid_from: '',
          valid_to: '',
        })
        loadCoupons()
      } else {
        toast.error(data.message || 'Failed to create coupon')
      }
    } catch {
      toast.error('Error creating coupon')
    } finally {
      setSaving(false)
    }
  }

  const getCouponStatus = (coupon: any) => {
    if (!coupon.is_active) {
      return { label: 'Inactive', variant: 'secondary' as const }
    }
    if (coupon.valid_to && new Date(coupon.valid_to).getTime() < Date.now()) {
      return { label: 'Expired', variant: 'destructive' as const }
    }
    if (coupon.valid_from && new Date(coupon.valid_from).getTime() > Date.now()) {
      return { label: 'Scheduled', variant: 'secondary' as const }
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { label: 'Used Up', variant: 'destructive' as const }
    }
    return { label: 'Active', variant: 'default' as const }
  }

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
      <Breadcrumbs
        title="Coupons"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Course Coupons' },
        ]}
        action={
          <Button
            size="sm"
            className="h-9 gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </Button>
        }
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Coupon List"
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
              <TableHead className="pl-6 font-semibold">Coupon Code</TableHead>
              <TableHead className="font-semibold">Discount</TableHead>
              <TableHead className="font-semibold">Course</TableHead>
              <TableHead className="font-semibold">Valid From</TableHead>
              <TableHead className="font-semibold">Valid To</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="pr-6 text-end font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading coupons...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedCoupons.length > 0 ? (
              paginatedCoupons.map((coupon) => {
                const status = getCouponStatus(coupon)

                return (
                  <TableRow key={coupon.id}>
                    {/* Code */}
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 font-mono font-bold text-xs">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCouponCode(coupon.code)}
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Discount */}
                    <TableCell className="py-3">
                      <Badge variant="outline">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount}% OFF`
                          : `$${coupon.discount} OFF`}
                      </Badge>
                    </TableCell>

                    {/* Course */}
                    <TableCell className="py-3">
                      {coupon.course_title ? (
                        <span className="font-medium text-foreground">
                          {coupon.course_title}
                        </span>
                      ) : (
                        <span className="font-medium text-primary">
                          Global Coupon
                        </span>
                      )}
                    </TableCell>

                    {/* Valid From */}
                    <TableCell className="py-3 text-muted-foreground text-sm">
                      {coupon.valid_from ? coupon.valid_from.substring(0, 10) : '--'}
                    </TableCell>

                    {/* Valid To */}
                    <TableCell className="py-3 text-muted-foreground text-sm">
                      {coupon.valid_to ? coupon.valid_to.substring(0, 10) : '--'}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 py-3 text-end">
                      <ActionsDropdown
                        className="max-w-36"
                        routes={[
                          {
                            label: 'Delete',
                            method: 'delete',
                            route: `/api/instructor/coupons?id=${coupon.id}`,
                            message: `Are you sure you want to delete coupon "${coupon.code}"?`,
                          },
                        ]}
                        onDeleteSuccess={loadCoupons}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TableFooter
          currentPage={currentPage}
          total={filteredCoupons.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add Coupon Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">Coupon Code *</Label>
              <Input
                id="coupon-code"
                required
                placeholder="e.g. MENTOR2026"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                className="font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, discount_type: val }))
                  }
                >
                  <SelectTrigger id="discount-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discount-val">Discount Value *</Label>
                <Input
                  id="discount-val"
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 25"
                  value={form.discount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, discount: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course-select">Applicable Course</Label>
              <Select
                value={form.course_id}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, course_id: val }))
                }
              >
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global Coupon (All Courses)</SelectItem>
                  {courses.map((crs) => (
                    <SelectItem key={crs.id} value={String(crs.id)}>
                      {crs.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={form.valid_from}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, valid_from: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="valid-to">Valid To</Label>
                <Input
                  id="valid-to"
                  type="date"
                  value={form.valid_to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, valid_to: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
