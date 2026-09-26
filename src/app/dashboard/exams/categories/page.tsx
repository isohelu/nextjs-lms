'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  ArrowDownUp,
  Pencil,
  Trash2,
  FolderTree,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/breadcrumbs'
import ActionsDropdown from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ExamCategory {
  id: number
  title: string
  slug: string
  icon?: string | null
  description?: string | null
  status?: number
  sort?: number
  exams_count?: number
}

export default function ExamCategoriesPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Category Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExamCategory | null>(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    icon: 'folder',
    description: '',
    status: '1',
  })
  const [saving, setSaving] = useState(false)

  // Sort Modal
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [sortItems, setSortItems] = useState<ExamCategory[]>([])
  const [savingSort, setSavingSort] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories/exam')
      if (res.ok) {
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Error fetching exam categories:', err)
      toast.error('Failed to load exam categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const defaultCategory = categories.find((cat) => cat.slug === 'default')
  const otherCategories = categories.filter((cat) => cat.slug !== 'default')

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingCategory(null)
    setForm({
      title: '',
      slug: '',
      icon: 'folder',
      description: '',
      status: '1',
    })
    setModalOpen(true)
  }

  // Open Edit Dialog
  const handleOpenEdit = (category: ExamCategory) => {
    setEditingCategory(category)
    setForm({
      title: category.title || '',
      slug: category.slug || '',
      icon: category.icon || 'folder',
      description: category.description || '',
      status: category.status !== undefined ? String(category.status) : '1',
    })
    setModalOpen(true)
  }

  // Handle Save (Create / Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Category title is required')
      return
    }

    const slug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    setSaving(true)
    try {
      const url = '/api/categories/exam'
      const method = editingCategory ? 'PUT' : 'POST'
      const payload: any = {
        title: form.title,
        slug,
        icon: form.icon,
        description: form.description,
        status: parseInt(form.status, 10),
      }

      if (editingCategory) {
        payload.id = editingCategory.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully')
        setModalOpen(false)
        loadCategories()
      } else {
        toast.error(data.message || 'Operation failed')
      }
    } catch (err) {
      console.error('Error saving exam category:', err)
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/exam?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Category deleted successfully')
        loadCategories()
      } else {
        toast.error(data.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting exam category:', err)
      toast.error('Failed to delete category')
    }
  }

  // Open Sort Modal
  const handleOpenSort = () => {
    setSortItems([...categories])
    setSortModalOpen(true)
  }

  const handleMoveSort = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sortItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setSortItems(newItems)
  }

  const handleSaveSort = async () => {
    setSavingSort(true)
    try {
      const sortedData = sortItems.map((item, idx) => ({
        id: item.id,
        sort: idx + 1,
      }))

      const res = await fetch('/api/categories/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sort',
          sortedData,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Sort order updated')
        setSortModalOpen(false)
        loadCategories()
      } else {
        toast.error(data.message || 'Failed to update sort order')
      }
    } catch (err) {
      console.error('Error updating sort order:', err)
      toast.error('Failed to update sort order')
    } finally {
      setSavingSort(false)
    }
  }

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Categories"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Exam Categories' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={handleOpenSort}
            >
              <ArrowDownUp className="h-4 w-4" />
              Sort Categories
            </Button>

            <Button
              size="sm"
              className="h-9 gap-2"
              onClick={handleOpenAdd}
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        }
        className="mb-4"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Default / Protected Category */}
          {defaultCategory && (
            <Card
              key={defaultCategory.id}
              className="flex flex-col justify-between p-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DynamicIcon
                        size={20}
                        name={(defaultCategory.icon as any) || 'folder'}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg leading-tight font-semibold text-foreground">
                        {defaultCategory.title}
                      </h2>
                      <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Protected
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <p className="text-sm leading-relaxed text-muted-foreground">
                  When a category is deleted, its exams are moved to the default
                  category. The default category cannot be edited or removed.
                </p>
              </div>
            </Card>
          )}

          {/* User / Other Categories */}
          {otherCategories.map((category) => (
            <Card
              key={category.id}
              className="flex flex-col justify-between p-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DynamicIcon
                        size={20}
                        name={(category.icon as any) || 'folder'}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg leading-tight font-semibold text-foreground">
                        {category.title}
                      </h2>
                    </div>
                  </div>

                  <ActionsDropdown
                    routes={[
                      {
                        label: 'Delete',
                        method: 'delete',
                        route: `/api/categories/exam?id=${category.id}`,
                        message: 'Are you sure you want to delete this category?',
                      },
                    ]}
                    onDeleteSuccess={loadCategories}
                    component={
                      <Button
                        variant="ghost"
                        className="h-8 w-full justify-start has-[svg]:px-2!"
                        onClick={() => handleOpenEdit(category)}
                      >
                        <Pencil size={15} />
                        <span>Edit</span>
                      </Button>
                    }
                  />
                </div>

                <Separator className="bg-border/50" />

                {category.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                <Badge
                  variant={category.status ? 'default' : 'secondary'}
                  className="rounded-full"
                >
                  {category.status ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {category.exams_count || 0} exams
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              No categories found. Create your first category!
            </p>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    title: val,
                    slug: !editingCategory
                      ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      : prev.slug,
                  }))
                }}
                placeholder="Category Title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                required
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="icon">Lucide Icon Name</Label>
              <Input
                id="icon"
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="folder, book, code, award..."
              />
              <span className="text-xs text-muted-foreground">
                Enter any valid Lucide icon name (e.g. folder, book, layers, award)
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description of this category"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sort Dialog */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Sort Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto py-2">
            {sortItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => handleMoveSort(index, 'up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === sortItems.length - 1}
                    onClick={() => handleMoveSort(index, 'down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSortModalOpen(false)}
              disabled={savingSort}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSort} disabled={savingSort}>
              {savingSort && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
