'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  ArrowDownUp,
  Pencil,
  Trash2,
  FolderOpen,
  Loader2,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/breadcrumbs'
import ActionsDropdown from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
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

interface BlogCategory {
  id: number
  title: string
  name?: string
  slug: string
  icon?: string | null
  description?: string | null
  status: string
  sort?: number
  blogs_count?: number
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Add / Edit Modal state
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formIcon, setFormIcon] = useState('tag')
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [formDescription, setFormDescription] = useState('')
  const [savingForm, setSavingForm] = useState(false)

  // Sort Modal state
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [sortItems, setSortItems] = useState<BlogCategory[]>([])
  const [savingSort, setSavingSort] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories/blog')
      if (res.ok) {
        const data = await res.json()
        const list = data.categories || []
        // normalize title/name
        const normalized = list.map((c: any) => ({
          ...c,
          title: c.title || c.name || '',
          name: c.name || c.title || '',
          status: c.status || 'active',
          blogs_count: c.blogs_count || 0,
        }))
        setCategories(normalized)
      } else {
        toast.error('Failed to load blog categories')
      }
    } catch (err) {
      console.error('Error fetching blog categories:', err)
      toast.error('Error loading blog categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Open Add Category Modal
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setFormTitle('')
    setFormSlug('')
    setFormIcon('tag')
    setFormStatus('active')
    setFormDescription('')
    setFormModalOpen(true)
  }

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: BlogCategory) => {
    setEditingCategory(cat)
    setFormTitle(cat.title || cat.name || '')
    setFormSlug(cat.slug)
    setFormIcon(cat.icon || 'tag')
    setFormStatus((cat.status as 'active' | 'inactive') || 'active')
    setFormDescription(cat.description || '')
    setFormModalOpen(true)
  }

  // Submit Add or Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Category name is required')
      return
    }

    const slug =
      formSlug.trim() ||
      formTitle
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    try {
      setSavingForm(true)
      if (editingCategory) {
        // Update
        const res = await fetch('/api/categories/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            title: formTitle.trim(),
            slug,
            icon: formIcon.trim() || 'tag',
            status: formStatus,
            description: formDescription.trim() || null,
          }),
        })
        if (res.ok) {
          toast.success('Category updated successfully')
          setFormModalOpen(false)
          loadCategories()
        } else {
          const err = await res.json()
          toast.error(err.message || 'Failed to update category')
        }
      } else {
        // Create
        const res = await fetch('/api/categories/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle.trim(),
            slug,
            icon: formIcon.trim() || 'tag',
            status: formStatus,
            description: formDescription.trim() || null,
          }),
        })
        if (res.ok) {
          toast.success('Category created successfully')
          setFormModalOpen(false)
          loadCategories()
        } else {
          const err = await res.json()
          toast.error(err.message || 'Failed to create category')
        }
      }
    } catch {
      toast.error('An error occurred while saving category')
    } finally {
      setSavingForm(false)
    }
  }

  // Handle Delete
  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/blog?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Category deleted successfully')
        loadCategories()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to delete category')
      }
    } catch {
      toast.error('An error occurred while deleting category')
    }
  }

  // Open Sort Modal
  const handleOpenSort = () => {
    const sortable = categories.filter((c) => c.slug !== 'default')
    setSortItems([...sortable])
    setSortModalOpen(true)
  }

  // Move Sort Item
  const handleMoveSortItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sortItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setSortItems(newItems)
  }

  // Save Sort Order
  const handleSaveSort = async () => {
    try {
      setSavingSort(true)
      const res = await fetch('/api/categories/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sort',
          sortedData: sortItems.map((item, idx) => ({ id: item.id, sort: idx })),
        }),
      })
      if (res.ok) {
        toast.success('Sort order updated successfully')
        setSortModalOpen(false)
        loadCategories()
      } else {
        toast.error('Failed to update sort order')
      }
    } catch {
      toast.error('Error updating sort order')
    } finally {
      setSavingSort(false)
    }
  }

  const defaultCategory = categories.find((c) => c.slug === 'default' || c.id === 1)
  const allCategories = categories.filter((c) => c !== defaultCategory)

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Blog Categories"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Blog Categories' },
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
              onClick={handleOpenAddCategory}
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        }
        className="mb-4"
      />

      <div className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Default Protected Category Card */}
            {defaultCategory && (
              <Card className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {defaultCategory.icon ? (
                          <DynamicIcon size={20} name={defaultCategory.icon as any} />
                        ) : (
                          <Layers className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg leading-tight font-semibold text-foreground">
                          {defaultCategory.title || defaultCategory.name}
                        </h2>
                        <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Protected
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {defaultCategory.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {defaultCategory.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <span className="text-xs text-muted-foreground">
                    Total number of blog
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {defaultCategory.blogs_count || 0} blogs
                  </span>
                </div>
              </Card>
            )}

            {/* Non-default categories */}
            {allCategories.map((category) => (
              <Card
                key={category.id}
                className="flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {category.icon ? (
                          <DynamicIcon size={20} name={category.icon as any} />
                        ) : (
                          <Layers className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg leading-tight font-semibold text-foreground">
                          {category.title || category.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <ActionsDropdown
                        onDeleteSuccess={loadCategories}
                        routes={[
                          {
                            label: 'Delete',
                            method: 'delete',
                            route: `/api/categories/blog?id=${category.id}`,
                            message: 'Are you sure you want to delete this category?',
                          },
                        ]}
                        component={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start has-[svg]:px-2!"
                            onClick={() => handleOpenEditCategory(category)}
                          >
                            <Pencil size={15} />
                            Edit
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  {category.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {category.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground/60">
                      No description provided.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <Badge
                    variant={category.status === 'active' ? 'default' : 'secondary'}
                    className="rounded-full capitalize"
                  >
                    {category.status}
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">
                    {category.blogs_count || 0} blogs
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No categories found
            </h3>
            <p className="mt-2 mb-4 text-muted-foreground">
              Get started by creating your first blog category
            </p>
            <Button size="sm" onClick={handleOpenAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </div>
        )}
      </div>

      {/* Category Add/Edit Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-title">Title</Label>
              <Input
                id="category-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug (Optional)</Label>
              <Input
                id="category-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. technology"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-icon">Icon</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-icon"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="e.g. code, book, tag, globe, briefcase"
                  required
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                  {formIcon ? (
                    <DynamicIcon size={18} name={formIcon as any} />
                  ) : (
                    <Layers className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-status">Status</Label>
              <Select
                value={formStatus}
                onValueChange={(val: 'active' | 'inactive') => setFormStatus(val)}
              >
                <SelectTrigger id="category-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-desc">Subtitle (Max 80 chars)</Label>
              <Textarea
                id="category-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter short description"
                maxLength={80}
                rows={3}
              />
              <span className="text-[11px] text-muted-foreground block text-right">
                {formDescription.length}/80
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormModalOpen(false)}
              >
                Close
              </Button>
              <Button type="submit" disabled={savingForm}>
                {savingForm ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sort Categories Modal */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sort Categories</DialogTitle>
          </DialogHeader>

          <div className="max-h-80 space-y-2 overflow-y-auto py-2">
            {sortItems.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No sortable categories.
              </p>
            ) : (
              sortItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
                      {item.icon ? (
                        <DynamicIcon size={14} name={item.icon as any} />
                      ) : (
                        <Layers className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{item.title || item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0}
                      onClick={() => handleMoveSortItem(index, 'up')}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === sortItems.length - 1}
                      onClick={() => handleMoveSortItem(index, 'down')}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSortModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSort} disabled={savingSort}>
              {savingSort ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
