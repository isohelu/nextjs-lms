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

interface SubCategory {
  id: number
  title: string
  slug: string
  icon?: string | null
  description?: string | null
  product_category_id: number
}

interface Category {
  id: number
  title: string
  slug: string
  icon?: string | null
  description?: string | null
  status?: number
  products_count?: number
  category_children?: SubCategory[]
}

export default function StoreCategoriesView() {
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
      const res = await fetch('/api/categories/product')
      if (res.ok) {
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Error fetching product categories:', err)
      toast.error('Failed to load product categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const defaultCategory = categories.find((cat) => cat.slug === 'default')
  const otherCategories = categories.filter((cat) => cat.slug !== 'default')

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
  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      title: category.title || '',
      slug: category.slug || '',
      icon: category.icon || 'folder',
      description: category.description || '',
      status: category.status !== undefined ? String(category.status) : '1',
    })
    setCategoryModalOpen(true)
  }

  // Handle Save Parent Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.title.trim()) {
      toast.error('Category title is required')
      return
    }

    const slug =
      categoryForm.slug.trim() ||
      categoryForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    setSavingCategory(true)
    try {
      const url = '/api/categories/product'
      const method = editingCategory ? 'PUT' : 'POST'
      const payload: any = {
        title: categoryForm.title,
        slug,
        icon: categoryForm.icon,
        description: categoryForm.description,
        status: parseInt(categoryForm.status, 10),
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
        toast.success(
          editingCategory
            ? 'Category updated successfully'
            : 'Category created successfully'
        )
        setCategoryModalOpen(false)
        loadCategories()
      } else {
        toast.error(data.message || 'Operation failed')
      }
    } catch (err) {
      console.error('Error saving product category:', err)
      toast.error('Failed to save category')
    } finally {
      setSavingCategory(false)
    }
  }

  // Open Add Subcategory Modal
  const handleOpenAddSub = (category: Category) => {
    setParentForSub(category)
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
  const handleOpenEditSub = (parent: Category, sub: SubCategory) => {
    setParentForSub(parent)
    setEditingSub(sub)
    setSubForm({
      title: sub.title || '',
      slug: sub.slug || '',
      icon: sub.icon || 'tag',
      description: sub.description || '',
      status: '1',
    })
    setSubModalOpen(true)
  }

  // Handle Save Subcategory
  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subForm.title.trim()) {
      toast.error('Subcategory title is required')
      return
    }
    if (!parentForSub) return

    const slug =
      subForm.slug.trim() ||
      subForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    setSavingSub(true)
    try {
      const url = '/api/categories/product'
      const method = editingSub ? 'PUT' : 'POST'
      const payload: any = {
        title: subForm.title,
        slug,
        icon: subForm.icon,
        description: subForm.description,
        is_child: true,
        parent_id: parentForSub.id,
      }

      if (editingSub) {
        payload.id = editingSub.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(
          editingSub
            ? 'Subcategory updated successfully'
            : 'Subcategory added successfully'
        )
        setSubModalOpen(false)
        loadCategories()
      } else {
        toast.error(data.message || 'Operation failed')
      }
    } catch (err) {
      console.error('Error saving subcategory:', err)
      toast.error('Failed to save subcategory')
    } finally {
      setSavingSub(false)
    }
  }

  // Open Sort Modal
  const handleOpenSortCategories = () => {
    setSortItems([...categories])
    setSortIsChild(false)
    setSortModalOpen(true)
  }

  const handleOpenSortSubcategories = (category: Category) => {
    setSortItems([...(category.category_children || [])])
    setSortIsChild(true)
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

      const res = await fetch('/api/categories/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sort',
          is_child: sortIsChild,
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
    <>
      <Breadcrumbs
        title="Product Categories"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Product Categories' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={handleOpenSortCategories}
            >
              <ArrowDownUp className="h-4 w-4" />
              Sort
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
          {/* Protected / Default Category */}
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
                        Protected Category
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-1">
                  <p className="text-sm font-medium">Protected Category</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Products without a category are moved here automatically.
                    This category cannot be deleted.
                  </p>
                </div>
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
                    className="max-w-36"
                    routes={[
                      {
                        label: 'Delete',
                        method: 'delete',
                        route: `/api/categories/product?id=${category.id}`,
                        message: `The category "${category.title}" and its sub categories will be deleted and their products will be moved to the default category.`,
                      },
                    ]}
                    onDeleteSuccess={loadCategories}
                    component={
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start has-[svg]:px-2!"
                          onClick={() => handleOpenAddSub(category)}
                        >
                          <Plus size={15} />
                          <span>Subcategory</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start has-[svg]:px-2!"
                          onClick={() => handleOpenSortSubcategories(category)}
                        >
                          <ArrowDownUp size={15} />
                          <span>Sort</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start has-[svg]:px-2!"
                          onClick={() => handleOpenEditCategory(category)}
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </Button>
                      </>
                    }
                  />
                </div>

                <Separator className="bg-border/50" />

                {category.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}

                {category.category_children &&
                category.category_children.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Subcategories
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {category.category_children.map((child) => (
                        <div
                          key={child.id}
                          className="group/item flex items-center justify-between rounded-lg border border-border/65 bg-muted/30 px-3 py-1.5 transition-colors hover:bg-muted/60"
                        >
                          <div className="flex items-center gap-2">
                            <DynamicIcon
                              size={14}
                              name={(child.icon as any) || 'tag'}
                              className="text-muted-foreground"
                            />
                            <span className="text-sm font-medium text-foreground">
                              {child.title}
                            </span>
                          </div>

                          <ActionsDropdown
                            className="max-w-36"
                            routes={[
                              {
                                label: 'Delete',
                                method: 'delete',
                                route: `/api/categories/product?id=${child.id}&child=1`,
                                message: `The sub category "${child.title}" will be deleted and their products will be moved to its parent category.`,
                              },
                            ]}
                            onDeleteSuccess={loadCategories}
                            component={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start has-[svg]:px-2!"
                                onClick={() => handleOpenEditSub(category, child)}
                              >
                                <Pencil size={15} />
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

              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                <Badge
                  variant={category.status ? 'default' : 'secondary'}
                  className="rounded-full"
                >
                  {category.status ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {category.products_count || 0} products
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <h2 className="text-center text-muted-foreground">
            No categories found
          </h2>
        </Card>
      )}

      {/* Add / Edit Category Dialog */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Update Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-title">Title *</Label>
              <Input
                id="cat-title"
                required
                value={categoryForm.title}
                onChange={(e) => {
                  const val = e.target.value
                  setCategoryForm((prev) => ({
                    ...prev,
                    title: val,
                    slug: !editingCategory
                      ? val
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      : prev.slug,
                  }))
                }}
                placeholder="Category Title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                required
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">Lucide Icon Name</Label>
              <Input
                id="cat-icon"
                value={categoryForm.icon}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="folder, shopping-bag, tag, box..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                rows={3}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Category description"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-status">Status</Label>
              <Select
                value={categoryForm.status}
                onValueChange={(val) =>
                  setCategoryForm((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger id="cat-status">
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
                onClick={() => setCategoryModalOpen(false)}
                disabled={savingCategory}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingCategory}>
                {savingCategory && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Subcategory Dialog */}
      <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>
              {editingSub ? 'Update Subcategory' : 'Add Subcategory'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSub} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sub-title">Title *</Label>
              <Input
                id="sub-title"
                required
                value={subForm.title}
                onChange={(e) => {
                  const val = e.target.value
                  setSubForm((prev) => ({
                    ...prev,
                    title: val,
                    slug: !editingSub
                      ? val
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      : prev.slug,
                  }))
                }}
                placeholder="Subcategory Title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-slug">Slug *</Label>
              <Input
                id="sub-slug"
                required
                value={subForm.slug}
                onChange={(e) =>
                  setSubForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="subcategory-slug"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-icon">Lucide Icon Name</Label>
              <Input
                id="sub-icon"
                value={subForm.icon}
                onChange={(e) =>
                  setSubForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="tag, layers, bookmark..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-description">Description</Label>
              <Textarea
                id="sub-description"
                rows={3}
                value={subForm.description}
                onChange={(e) =>
                  setSubForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Subcategory description"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubModalOpen(false)}
                disabled={savingSub}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingSub}>
                {savingSub && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSub ? 'Update Subcategory' : 'Save Subcategory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sort Dialog */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>
              {sortIsChild ? 'Sort Subcategories' : 'Sort Categories'}
            </DialogTitle>
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
    </>
  )
}
