'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  ArrowDownUp,
  Pencil,
  Trash2,
  FolderTree,
  Tag,
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
import { Card } from '@/components/ui/card'
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

interface SubCategory {
  id: number
  title: string
  slug: string
  icon?: string | null
  description?: string | null
  course_category_id: number
}

interface Category {
  id: number
  title: string
  slug: string
  icon?: string | null
  description?: string | null
  status?: number
  category_children?: SubCategory[]
}

export default function CourseCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Parent Category Dialog
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    slug: '',
    icon: 'folder',
    description: '',
    status: '1',
  })
  const [savingCategory, setSavingCategory] = useState(false)

  // Subcategory Dialog
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [parentForSub, setParentForSub] = useState<Category | null>(null)
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [subForm, setSubForm] = useState({
    title: '',
    slug: '',
    icon: 'tag',
    description: '',
    status: '1',
  })
  const [savingSub, setSavingSub] = useState(false)

  // Sort Modal
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [sortItems, setSortItems] = useState<any[]>([])
  const [sortIsChild, setSortIsChild] = useState(false)
  const [savingSort, setSavingSort] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories/course')
      if (res.ok) {
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Error fetching course categories:', err)
      toast.error('Failed to load categories')
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
    setCategoryForm({
      title: '',
      slug: '',
      icon: 'folder',
      description: '',
      status: '1',
    })
    setCategoryModalOpen(true)
  }

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryForm({
      title: cat.title,
      slug: cat.slug,
      icon: cat.icon || 'folder',
      description: cat.description || '',
      status: String(cat.status ?? 1),
    })
    setCategoryModalOpen(true)
  }

  // Save Parent Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.title.trim()) {
      toast.error('Category title is required')
      return
    }

    setSavingCategory(true)
    try {
      const slug = categoryForm.slug.trim() || categoryForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (editingCategory) {
        const res = await fetch('/api/categories/course', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            title: categoryForm.title.trim(),
            slug,
            icon: categoryForm.icon,
            description: categoryForm.description.trim(),
            status: Number(categoryForm.status),
          }),
        })
        if (res.ok) {
          toast.success('Category updated successfully')
          setCategoryModalOpen(false)
          loadCategories()
        } else {
          toast.error('Failed to update category')
        }
      } else {
        const res = await fetch('/api/categories/course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: categoryForm.title.trim(),
            slug,
            icon: categoryForm.icon,
            description: categoryForm.description.trim(),
            status: Number(categoryForm.status),
          }),
        })
        if (res.ok) {
          toast.success('Category created successfully')
          setCategoryModalOpen(false)
          loadCategories()
        } else {
          toast.error('Failed to create category')
        }
      }
    } catch {
      toast.error('Error saving category')
    } finally {
      setSavingCategory(false)
    }
  }

  // Delete Parent Category
  const handleDeleteCategory = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/course?id=${cat.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Category "${cat.title}" deleted`)
        loadCategories()
      } else {
        toast.error('Failed to delete category')
      }
    } catch {
      toast.error('Error deleting category')
    }
  }

  // Open Add Subcategory Modal
  const handleOpenAddSub = (parentCat: Category) => {
    setParentForSub(parentCat)
    setEditingSub(null)
    setSubForm({
      title: '',
      slug: '',
      icon: 'tag',
      description: '',
      status: '1',
    })
    setSubModalOpen(true)
  }

  // Open Edit Subcategory Modal
  const handleOpenEditSub = (parentCat: Category, sub: SubCategory) => {
    setParentForSub(parentCat)
    setEditingSub(sub)
    setSubForm({
      title: sub.title,
      slug: sub.slug,
      icon: sub.icon || 'tag',
      description: sub.description || '',
      status: '1',
    })
    setSubModalOpen(true)
  }

  // Save Subcategory
  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subForm.title.trim() || !parentForSub) {
      toast.error('Subcategory title is required')
      return
    }

    setSavingSub(true)
    try {
      const slug = subForm.slug.trim() || subForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (editingSub) {
        const res = await fetch('/api/categories/course', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSub.id,
            is_child: true,
            title: subForm.title.trim(),
            slug,
            icon: subForm.icon,
            description: subForm.description.trim(),
            status: Number(subForm.status),
          }),
        })
        if (res.ok) {
          toast.success('Subcategory updated')
          setSubModalOpen(false)
          loadCategories()
        } else {
          toast.error('Failed to update subcategory')
        }
      } else {
        const res = await fetch('/api/categories/course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parent_id: parentForSub.id,
            title: subForm.title.trim(),
            slug,
            icon: subForm.icon,
            description: subForm.description.trim(),
            status: Number(subForm.status),
          }),
        })
        if (res.ok) {
          toast.success('Subcategory added')
          setSubModalOpen(false)
          loadCategories()
        } else {
          toast.error('Failed to create subcategory')
        }
      }
    } catch {
      toast.error('Error saving subcategory')
    } finally {
      setSavingSub(false)
    }
  }

  // Delete Subcategory
  const handleDeleteSub = async (sub: SubCategory) => {
    try {
      const res = await fetch(`/api/categories/course?id=${sub.id}&child=1`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Subcategory "${sub.title}" removed`)
        loadCategories()
      } else {
        toast.error('Failed to delete subcategory')
      }
    } catch {
      toast.error('Error deleting subcategory')
    }
  }

  // Open Sort Modal
  const handleOpenSort = (items: any[], isChild = false) => {
    setSortItems([...items])
    setSortIsChild(isChild)
    setSortModalOpen(true)
  }

  // Move item in Sort Modal
  const handleMoveSort = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sortItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    setSortItems(newItems)
  }

  // Save Sort
  const handleSaveSort = async () => {
    setSavingSort(true)
    try {
      const res = await fetch('/api/categories/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sort',
          is_child: sortIsChild,
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
  const otherCategories = categories.filter((c) => c !== defaultCategory)

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Categories"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Course Categories' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => handleOpenSort(categories, false)}
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

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Default / Protected Category Card */}
          {defaultCategory && (
            <Card className="flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {defaultCategory.icon ? (
                        <DynamicIcon size={20} name={defaultCategory.icon as any} />
                      ) : (
                        <FolderTree className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg leading-tight font-semibold text-foreground">
                        {defaultCategory.title}
                      </h2>
                      <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Protected Category
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-1">
                  <p className="text-sm font-medium">Protected Category</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    This is a default category, you can&apos;t edit or delete this. Courses without a category will be moved here.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Other Categories Cards */}
          {otherCategories.map((category) => (
            <Card key={category.id} className="flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {category.icon ? (
                        <DynamicIcon size={20} name={category.icon as any} />
                      ) : (
                        <FolderTree className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg leading-tight font-semibold text-foreground">
                        {category.title}
                      </h2>
                    </div>
                  </div>

                  <ActionsDropdown
                    className="w-44"
                    routes={[
                      {
                        label: 'Delete',
                        method: 'delete',
                        message: `The category "${category.title}" and its subcategories will be deleted and their courses will be moved to the default category.`,
                        onClick: () => handleDeleteCategory(category),
                      },
                    ]}
                    component={
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start gap-2 h-8 px-2 text-xs font-normal"
                          onClick={() => handleOpenAddSub(category)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Subcategory</span>
                        </Button>

                        {category.category_children && category.category_children.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start gap-2 h-8 px-2 text-xs font-normal"
                            onClick={() => handleOpenSort(category.category_children || [], true)}
                          >
                            <ArrowDownUp className="h-3.5 w-3.5" />
                            <span>Sort Subcategories</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 h-8 px-2 text-xs font-normal"
                          onClick={() => handleOpenEditCategory(category)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      </>
                    }
                  />
                </div>

                <Separator className="bg-border/50" />

                {category.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}

                {category.category_children && category.category_children.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Subcategories
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {category.category_children.map((child) => (
                        <div
                          key={child.id}
                          className="group/item flex items-center justify-between rounded-lg border border-border/65 bg-muted/30 px-3 py-1.5 transition-colors hover:bg-muted/60"
                        >
                          <div className="flex items-center gap-2">
                            {child.icon ? (
                              <DynamicIcon
                                size={14}
                                name={child.icon as any}
                                className="text-muted-foreground shrink-0"
                              />
                            ) : (
                              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm font-medium text-foreground line-clamp-1">
                              {child.title}
                            </span>
                          </div>

                          <ActionsDropdown
                            className="w-36"
                            routes={[
                              {
                                label: 'Delete',
                                method: 'delete',
                                message: `The sub category "${child.title}" will be deleted.`,
                                onClick: () => handleDeleteSub(child),
                              },
                            ]}
                            component={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 h-8 px-2 text-xs font-normal"
                                onClick={() => handleOpenEditSub(category, child)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs font-medium text-muted-foreground uppercase">
                    No subcategories found
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <FolderTree className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-foreground">No categories found</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Get started by creating your first course category.
          </p>
          <Button size="sm" onClick={handleOpenAddCategory}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Category
          </Button>
        </Card>
      )}

      {/* Parent Category Dialog */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Update Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                required
                value={categoryForm.title}
                onChange={(e) => {
                  setCategoryForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                    slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  }))
                }}
                placeholder="Category Title"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Category Icon (Lucide name)</Label>
              <Input
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g. folder, code, book, cpu, globe"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Category Status</Label>
              <Select
                value={categoryForm.status}
                onValueChange={(val) => setCategoryForm((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description..."
                className="mt-1"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={savingCategory}>
                {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSub ? 'Update Subcategory' : `Add Subcategory to "${parentForSub?.title}"`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSub} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Subcategory Title *</Label>
              <Input
                required
                value={subForm.title}
                onChange={(e) => {
                  setSubForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                    slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  }))
                }}
                placeholder="Subcategory Title"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Icon (Lucide name)</Label>
              <Input
                value={subForm.icon}
                onChange={(e) => setSubForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g. tag, layers, file-code, bookmark"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                rows={3}
                value={subForm.description}
                onChange={(e) => setSubForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter subcategory description..."
                className="mt-1"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSubModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={savingSub}>
                {savingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sort Dialog */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {sortIsChild ? 'Sort Subcategories' : 'Sort Categories'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto py-2">
            {sortItems.map((item, index) => (
              <Card key={item.id} className="flex items-center justify-between p-3">
                <span className="text-sm font-medium">{item.title}</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0}
                    onClick={() => handleMoveSort(index, 'up')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === sortItems.length - 1}
                    onClick={() => handleMoveSort(index, 'down')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSortModalOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={handleSaveSort} disabled={savingSort}>
              {savingSort ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
