'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RichEditor from '@/components/ui/rich-editor'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  BookText,
  CircleDollarSign,
  FlaskConical,
  FolderInput,
  Settings,
  Eye,
  Plus,
  Trash2,
  File as FileIcon,
  Loader2,
  BadgeCheck,
  ChevronDown,
  UploadCloud,
  Send,
  Save,
} from 'lucide-react'

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`
}

const STATUS_CONFIG: Record<string, { bg: string; dot: string; ping: string }> = {
  approved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
  },
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 hover:bg-amber-100',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
  },
  rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 hover:bg-rose-100',
    dot: 'bg-rose-500',
    ping: 'bg-rose-400',
  },
  draft: {
    bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 hover:bg-slate-100',
    dot: 'bg-slate-500',
    ping: 'bg-slate-400',
  },
}

interface ProductUpdateProps {
  initialProductId: number
  initialTab?: string
}

export default function ProductUpdateManager({
  initialProductId,
  initialTab = 'basic',
}: ProductUpdateProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<{ id: number; title: string }[]>([])

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('draft')
  const [statusFeedback, setStatusFeedback] = useState('')

  // Uploading state
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Specification dialog state
  const [specDialogOpen, setSpecDialogOpen] = useState(false)
  const [specTitle, setSpecTitle] = useState('')
  const [specValue, setSpecValue] = useState('')

  // FAQ dialog state
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [faqQuestion, setFaqQuestion] = useState('')
  const [faqAnswer, setFaqAnswer] = useState('')

  const fetchProduct = async (id: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()
      if (data.success && data.product) {
        setProduct({
          ...data.product,
          discount: Boolean(data.product.discount),
          unlimited_inventory: Boolean(data.product.unlimited_inventory),
        })
        setSelectedStatus(data.product.status || 'draft')
      } else {
        toast.error('Failed to load product')
      }
    } catch {
      toast.error('Error fetching product data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct(initialProductId)
    fetch('/api/product-categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
        else if (data && Array.isArray(data.categories)) setCategories(data.categories)
      })
      .catch(() => {})
  }, [initialProductId])

  const handleSaveProduct = async (tabName: string) => {
    if (!product?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`${tabName} updated successfully!`)
        if (data.product) {
          setProduct({
            ...data.product,
            discount: Boolean(data.product.discount),
            unlimited_inventory: Boolean(data.product.unlimited_inventory),
          })
        }
      } else {
        toast.error(data.message || 'Failed to save product')
      }
    } catch {
      toast.error('Error saving product changes')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!product?.id) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, feedback: statusFeedback }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Product status updated to ${selectedStatus}`)
        setStatusDialogOpen(false)
        setStatusFeedback('')
        setProduct((p: any) => ({ ...p, status: selectedStatus }))
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Error updating status')
    }
  }

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !product?.id) return
    setUploadingThumbnail(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_id', String(product.id))
      formData.append('collection_name', 'thumbnail')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        setProduct((p: any) => ({ ...p, thumbnail: json.url }))
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnail: json.url }),
        })
        toast.success('Thumbnail uploaded successfully')
      } else {
        toast.error('Failed to upload thumbnail')
      }
    } catch {
      toast.error('Error uploading thumbnail')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  // Gallery images upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !product?.id) return
    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('model_id', String(product.id))
      formData.append('collection_name', 'gallery-images')
      Array.from(files).forEach((f) => formData.append('files', f))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Gallery images uploaded!')
        fetchProduct(product.id)
      } else {
        toast.error('Failed to upload gallery images')
      }
    } catch {
      toast.error('Error uploading gallery images')
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  // Delete media item (gallery image or downloadable file)
  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to remove this file?')) return
    try {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('File removed successfully')
        fetchProduct(product.id)
      } else {
        toast.error('Failed to remove file')
      }
    } catch {
      toast.error('Error deleting file')
    }
  }

  // Downloadable files upload
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !product?.id) return
    setUploadingFiles(true)
    try {
      const formData = new FormData()
      formData.append('model_id', String(product.id))
      formData.append('collection_name', 'downloadable-files')
      Array.from(files).forEach((f) => formData.append('files', f))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Downloadable files uploaded!')
        fetchProduct(product.id)
      } else {
        toast.error('Failed to upload downloadable files')
      }
    } catch {
      toast.error('Error uploading files')
    } finally {
      setUploadingFiles(false)
      e.target.value = ''
    }
  }

  // Specifications
  const handleAddSpecification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!specTitle || !specValue || !product?.id) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification_action: 'add',
          title: specTitle,
          value: specValue,
        }),
      })
      if (res.ok) {
        toast.success('Specification added!')
        setSpecTitle('')
        setSpecValue('')
        setSpecDialogOpen(false)
        fetchProduct(product.id)
      }
    } catch {
      toast.error('Error adding specification')
    }
  }

  const handleDeleteSpecification = async (specId: number) => {
    if (!product?.id) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification_action: 'delete',
          specification_id: specId,
        }),
      })
      if (res.ok) {
        toast.success('Specification deleted')
        fetchProduct(product.id)
      }
    } catch {
      toast.error('Error deleting specification')
    }
  }

  // FAQs
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!faqQuestion || !faqAnswer || !product?.id) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faq_action: 'add',
          question: faqQuestion,
          answer: faqAnswer,
        }),
      })
      if (res.ok) {
        toast.success('FAQ added!')
        setFaqQuestion('')
        setFaqAnswer('')
        setFaqDialogOpen(false)
        fetchProduct(product.id)
      }
    } catch {
      toast.error('Error adding FAQ')
    }
  }

  const handleDeleteFaq = async (faqId: number) => {
    if (!product?.id) return
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faq_action: 'delete',
          faq_id: faqId,
        }),
      })
      if (res.ok) {
        toast.success('FAQ deleted')
        fetchProduct(product.id)
      }
    } catch {
      toast.error('Error deleting FAQ')
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading Product Manager...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <p className="mt-2 text-muted-foreground">The requested product could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/store/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[product.status] || STATUS_CONFIG.draft

  const tabs = [
    { name: 'Basic', slug: 'basic', Icon: Settings },
    { name: 'Pricing', slug: 'pricing', Icon: CircleDollarSign },
    { name: 'Media & Files', slug: 'media', Icon: FolderInput },
    { name: 'Info', slug: 'info', Icon: BookText },
    { name: 'SEO', slug: 'seo', Icon: FlaskConical },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumbs with Action Header matching Laravel product-update-header.tsx */}
      <Breadcrumbs
        title="Manage Product"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Products', href: '/dashboard/store/products' },
          { title: product.title || 'Edit Product' },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild size="sm">
              <Link href={`/products/${product.slug || product.id}`} target="_blank">
                <Eye className="mr-1.5 h-4 w-4" />
                Preview
              </Link>
            </Button>

            {/* Approval Status Dialog */}
            <Button
              type="button"
              size="sm"
              onClick={() => setStatusDialogOpen(true)}
              className={`border px-3 py-1.5 text-xs font-semibold capitalize shadow-sm transition-all ${statusConfig.bg}`}
            >
              <span className="relative mr-1.5 flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusConfig.ping}`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${statusConfig.dot}`}
                />
              </span>
              {product.status || 'draft'}
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
            </Button>

            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="sm:max-w-125">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    Update Approval Status
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Change the status of this product and provide optional feedback.
                  </p>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue placeholder="Select approval status" />
                      </SelectTrigger>
                      <SelectContent>
                        {['approved', 'pending', 'rejected', 'draft'].map((st) => (
                          <SelectItem key={st} value={st} className="capitalize">
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Feedback (Optional)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Add reviewer feedback notes..."
                      value={statusFeedback}
                      onChange={(e) => setStatusFeedback(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStatusDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateStatus} className="px-6">
                      Submit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
        className="mb-4"
      />

      {/* Main Grid: Left Nav Tabs (1 col) + Right Content (3 cols) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        {/* Left Card Nav */}
        <div className="col-span-full md:col-span-1">
          <TabsList className="horizontal-tabs-list space-y-1 w-full grid! h-auto!">
            {tabs.map(({ name, slug, Icon }) => (
              <TabsTrigger
                key={slug}
                value={slug}
                className="horizontal-tabs-trigger w-full"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right Content Panel */}
        <div className="col-span-full md:col-span-3 space-y-6">
          {/* TAB 1: BASIC */}
          <TabsContent value="basic" className="m-0">
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={product.title || ''}
                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                    placeholder="e.g. Advanced Microscope"
                  />
                </div>

                <div>
                  <Label>Summary *</Label>
                  <Textarea
                    rows={4}
                    value={product.summary || ''}
                    onChange={(e) => setProduct({ ...product, summary: e.target.value })}
                    placeholder="Keep the summary short — it appears at the top of the product page."
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <div className="mt-1">
                    <RichEditor
                      value={product.description || ''}
                      onChange={(html) => setProduct({ ...product, description: html })}
                      placeholder="Describe your product in detail..."
                      minHeight={220}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={product.product_category_id ? String(product.product_category_id) : ''}
                    onValueChange={(val) =>
                      setProduct({ ...product, product_category_id: parseInt(val, 10) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveProduct('Basic Info')}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: PRICING */}
          <TabsContent value="pricing" className="m-0">
            <Card className="p-4 sm:p-6">
              <div className="space-y-5">
                <div>
                  <Label>Pricing *</Label>
                  <RadioGroup
                    value={product.pricing_type || 'free'}
                    onValueChange={(val) => setProduct({ ...product, pricing_type: val })}
                    className="flex items-center space-x-6 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="free" value="free" />
                      <Label htmlFor="free" className="mb-0 cursor-pointer capitalize">
                        Free
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="paid" value="paid" />
                      <Label htmlFor="paid" className="mb-0 cursor-pointer capitalize">
                        Paid
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {product.pricing_type === 'paid' && (
                  <div className="space-y-4 pt-2 border-t">
                    <div>
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={product.price || ''}
                        onChange={(e) => setProduct({ ...product, price: e.target.value })}
                        placeholder="e.g. 49"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="discount"
                          checked={Boolean(product.discount)}
                          onCheckedChange={(checked) =>
                            setProduct({ ...product, discount: Boolean(checked) })
                          }
                        />
                        <Label htmlFor="discount" className="mb-0 cursor-pointer">
                          Discounted Price
                        </Label>
                      </div>

                      {product.discount && (
                        <div>
                          <Input
                            type="number"
                            value={product.discount_price || ''}
                            onChange={(e) =>
                              setProduct({ ...product, discount_price: e.target.value })
                            }
                            placeholder="e.g. 39"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unlimited_inventory"
                      checked={Boolean(product.unlimited_inventory)}
                      onCheckedChange={(checked) =>
                        setProduct({ ...product, unlimited_inventory: Boolean(checked) })
                      }
                    />
                    <Label htmlFor="unlimited_inventory" className="mb-0 cursor-pointer">
                      Unlimited inventory (no purchase limit)
                    </Label>
                  </div>

                  {!product.unlimited_inventory && (
                    <div>
                      <Label>Inventory</Label>
                      <Input
                        type="number"
                        value={product.inventory || ''}
                        onChange={(e) => setProduct({ ...product, inventory: e.target.value })}
                        placeholder="e.g. 100"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveProduct('Pricing')}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: MEDIA & FILES */}
          <TabsContent value="media" className="m-0 space-y-6">
            {/* Thumbnail Card */}
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Thumbnail</h3>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingThumbnail}
                  onChange={handleThumbnailUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 600x400px. Formats: JPG, PNG, WEBP.
                </p>

                <div className="mt-2">
                  <img
                    src={product.thumbnail || '/assets/images/blank-image.jpg'}
                    alt="Product Thumbnail"
                    className="w-full max-w-sm rounded-md border object-cover aspect-video"
                  />
                </div>
              </div>
            </Card>

            {/* Gallery Images Card */}
            <Card className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base">Gallery Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Shown on the public product page. Up to 8 images.
                  </p>
                </div>
                <div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingGallery}
                    onChange={handleGalleryUpload}
                  />
                </div>
              </div>

              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
                  {product.images.map((img: any) => (
                    <div key={img.id} className="group relative rounded-md overflow-hidden border">
                      <img
                        src={img.url}
                        alt={img.name || 'Gallery Image'}
                        className="aspect-square w-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDeleteMedia(img.id)}
                        title="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No gallery images uploaded yet
                </p>
              )}
            </Card>

            {/* Downloadable Files Card */}
            <Card className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base">Downloadable Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Delivered to buyers after purchase. Up to 5 files, 50MB each.
                  </p>
                </div>
                <div>
                  <Input
                    type="file"
                    multiple
                    disabled={uploadingFiles}
                    onChange={handleFilesUpload}
                  />
                </div>
              </div>

              {product.files && product.files.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {product.files.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name || file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMedia(file.id)}
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No downloadable files uploaded yet
                </p>
              )}
            </Card>
          </TabsContent>

          {/* TAB 4: INFO */}
          <TabsContent value="info" className="m-0">
            <Card className="p-0 sm:p-6">
              <Tabs defaultValue="specifications" className="w-full md:space-y-6">
                <TabsList className="h-10 w-full">
                  <TabsTrigger value="specifications" className="h-8 w-full cursor-pointer">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="faqs" className="h-8 w-full cursor-pointer">
                    FAQs
                  </TabsTrigger>
                </TabsList>

                {/* Sub-tab 1: Specifications */}
                <TabsContent value="specifications" className="m-0! space-y-4 p-4 md:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Product Specifications</h4>
                    <Button onClick={() => setSpecDialogOpen(true)} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add Specification
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec: any) => (
                        <div
                          key={spec.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-2.5 hover:bg-muted/40 transition-colors"
                        >
                          <p className="text-sm font-medium">
                            {spec.title}:{' '}
                            <span className="font-normal text-muted-foreground">
                              {spec.value}
                            </span>
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteSpecification(spec.id)}
                            title="Delete specification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No specifications added yet
                      </p>
                    )}
                  </div>

                  <Dialog open={specDialogOpen} onOpenChange={setSpecDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Product Specification</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddSpecification} className="space-y-4 pt-2">
                        <div>
                          <Label>Specification Title *</Label>
                          <Input
                            placeholder="e.g. Dimensions, Weight, Compatibility"
                            value={specTitle}
                            onChange={(e) => setSpecTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Specification Value *</Label>
                          <Input
                            placeholder="e.g. 10 x 5 x 2 inches, 1.2 kg, React 19"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSpecDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add Specification</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Sub-tab 2: FAQs */}
                <TabsContent value="faqs" className="m-0! space-y-4 p-4 md:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Frequently Asked Questions</h4>
                    <Button onClick={() => setFaqDialogOpen(true)} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {product.faqs && product.faqs.length > 0 ? (
                      product.faqs.map((faq: any) => (
                        <div
                          key={faq.id}
                          className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{faq.question}</p>
                            <p className="text-xs text-muted-foreground">{faq.answer}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleDeleteFaq(faq.id)}
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No FAQs added yet
                      </p>
                    )}
                  </div>

                  <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Product FAQ</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddFaq} className="space-y-4 pt-2">
                        <div>
                          <Label>Question *</Label>
                          <Input
                            placeholder="e.g. Can I use this for commercial projects?"
                            value={faqQuestion}
                            onChange={(e) => setFaqQuestion(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Answer *</Label>
                          <Textarea
                            rows={3}
                            placeholder="e.g. Yes, all digital files come with an unlimited commercial license."
                            value={faqAnswer}
                            onChange={(e) => setFaqAnswer(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFaqDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add FAQ</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          {/* TAB 5: SEO */}
          <TabsContent value="seo" className="m-0">
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={product.meta_title || ''}
                    onChange={(e) => setProduct({ ...product, meta_title: e.target.value })}
                    placeholder="Meta title for search engines"
                  />
                </div>

                <div>
                  <Label>Meta Keywords</Label>
                  <Textarea
                    rows={3}
                    value={product.meta_keywords || ''}
                    onChange={(e) => setProduct({ ...product, meta_keywords: e.target.value })}
                    placeholder="Comma separated keywords"
                  />
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    rows={3}
                    value={product.meta_description || ''}
                    onChange={(e) => setProduct({ ...product, meta_description: e.target.value })}
                    placeholder="Brief description for search engines"
                  />
                </div>

                <div>
                  <Label>OG Title</Label>
                  <Input
                    value={product.og_title || ''}
                    onChange={(e) => setProduct({ ...product, og_title: e.target.value })}
                    placeholder="Open Graph title"
                  />
                </div>

                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    rows={3}
                    value={product.og_description || ''}
                    onChange={(e) => setProduct({ ...product, og_description: e.target.value })}
                    placeholder="Open Graph description"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveProduct('SEO')}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
