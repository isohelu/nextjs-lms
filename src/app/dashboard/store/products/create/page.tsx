'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import Combobox from '@/components/combobox'
import InputError from '@/components/input-error'
import LoadingButton from '@/components/loading-button'
import { Editor } from '@/components/rich-editor'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'

export default function CreateProductPage() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [instructors, setInstructors] = useState<{ label: string; value: string }[]>([])
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    // 1. Fetch current authenticated user
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.success && resData?.user) {
          setCurrentUser(resData.user)
          if (resData.user.role === 'admin') {
            fetch('/api/instructors')
              .then((res) => (res.ok ? res.json() : []))
              .then((instData) => {
                if (Array.isArray(instData)) {
                  setInstructors(
                    instData.map((inst: any) => ({
                      label: `${inst.name || inst.user?.name || 'Instructor'} (${inst.email || inst.user?.email || ''})`,
                      value: String(inst.id),
                    }))
                  )
                }
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => {})

    // 2. Fetch product categories with children
    fetch('/api/categories/product')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          const items: { label: string; value: string }[] = []
          for (const cat of data.categories) {
            items.push({
              label: cat.title,
              value: String(cat.id),
            })
            if (Array.isArray(cat.category_children)) {
              for (const child of cat.category_children) {
                items.push({
                  label: `-- ${child.title}`,
                  value: `${cat.id}:${child.id}`,
                })
              }
            }
          }
          setCategories(items)
        }
      })
      .catch(() => {})
  }, [])

  const [data, setData] = useState({
    title: '',
    instructor_id: '',
    summary: '',
    description: '',
    product_category_id: '',
    product_category_child_id: '',
    pricing_type: 'paid',
    price: '',
    discount: false,
    discount_price: '',
    thumbnail: '',
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setThumbnailPreview(previewUrl)
    setUploadingThumbnail(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_type', 'Modules\\Store\\Models\\Product')
      formData.append('collection_name', 'thumbnail')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (res.ok && result.success && result.url) {
        setData((prev) => ({ ...prev, thumbnail: result.url }))
        setErrors((prev) => ({ ...prev, thumbnail: '' }))
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          setData((prev) => ({ ...prev, thumbnail: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        setData((prev) => ({ ...prev, thumbnail: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadingThumbnail) {
      toast.info('Please wait while thumbnail is uploading...')
      return
    }

    const newErrors: Record<string, string> = {}
    if (!data.title.trim()) {
      newErrors.title = 'Title is required.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Product created successfully!')
        if (result.productId) {
          router.push(`/dashboard/store/products/${result.productId}`)
        } else {
          router.push('/dashboard/store/products')
        }
      } else {
        const errorMsg = result.message || 'Failed to create product.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      const netMsg = 'Failed to create product due to network error.'
      toast.error(netMsg)
      setErrors({ general: netMsg })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Create Product"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Create New Product' },
        ]}
        className="mb-4"
      />

      <Card className="container p-6">
        {errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Creation Failed</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label>Title *</Label>
                <Input
                  name="title"
                  placeholder="e.g. Advanced Microscope"
                  value={data.title}
                  onChange={(e) => {
                    setData((prev) => ({ ...prev, title: e.target.value }))
                    setErrors((prev) => ({ ...prev, title: '' }))
                  }}
                />
                <InputError message={errors.title} />
              </div>

              <div>
                <Label>Summary *</Label>
                <Textarea
                  rows={5}
                  name="summary"
                  placeholder="Short summary shown at the top of the product page"
                  value={data.summary}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, summary: e.target.value }))
                  }
                />
                <InputError message={errors.summary} />
              </div>

              <div>
                <Label>Description</Label>
                <Editor
                  ssr={true}
                  output="html"
                  placeholder={{
                    paragraph: 'Describe your product in detail',
                    imageCaption: 'Describe your product in detail',
                  }}
                  contentMinHeight={256}
                  initialContent={data.description}
                  value={data.description}
                  onContentChange={(val) =>
                    setData((prev) => ({ ...prev, description: val }))
                  }
                />
                <InputError message={errors.description} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {currentUser?.role === 'admin' && (
                <div>
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Combobox
                    data={instructors}
                    placeholder="Select Instructor"
                    defaultValue={data.instructor_id}
                    onSelect={(selected) => {
                      setData((prev) => ({
                        ...prev,
                        instructor_id: selected.value,
                      }))
                      setErrors((prev) => ({ ...prev, instructor_id: '' }))
                    }}
                  />
                  <InputError message={errors.instructor_id} />
                </div>
              )}

              <div>
                <Label htmlFor="product_category_id">Category *</Label>
                <Combobox
                  data={categories}
                  placeholder="Select a category"
                  defaultValue={
                    data.product_category_child_id
                      ? `${data.product_category_id}:${data.product_category_child_id}`
                      : data.product_category_id
                  }
                  onSelect={(selected) => {
                    if (selected.value.includes(':')) {
                      const [parentId, childId] = selected.value.split(':')
                      setData((prev) => ({
                        ...prev,
                        product_category_id: parentId,
                        product_category_child_id: childId,
                      }))
                    } else {
                      setData((prev) => ({
                        ...prev,
                        product_category_id: selected.value,
                        product_category_child_id: '',
                      }))
                    }
                    setErrors((prev) => ({ ...prev, product_category_id: '' }))
                  }}
                />
                <InputError message={errors.product_category_id} />
              </div>

              <div>
                <Label>Pricing *</Label>
                <RadioGroup
                  name="pricing_type"
                  defaultValue="paid"
                  value={data.pricing_type}
                  className="flex items-center space-x-4 pt-2 pb-1"
                  onValueChange={(val) =>
                    setData((prev) => ({ ...prev, pricing_type: val }))
                  }
                >
                  {['free', 'paid'].map((price) => (
                    <div key={price} className="flex items-center space-x-2">
                      <RadioGroupItem
                        className="cursor-pointer"
                        id={price}
                        value={price}
                      />
                      <Label
                        htmlFor={price}
                        className="mb-0 cursor-pointer capitalize"
                      >
                        {price}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <InputError message={errors.pricing_type} />

                {data.pricing_type === 'paid' && (
                  <div className="space-y-4 pt-3">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        type="number"
                        name="price"
                        placeholder="e.g. 49"
                        value={data.price}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, price: e.target.value }))
                        }
                      />
                      <InputError message={errors.price} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="discount"
                          name="discount"
                          checked={data.discount}
                          onCheckedChange={(checked) =>
                            setData((prev) => ({
                              ...prev,
                              discount: checked === true,
                            }))
                          }
                        />
                        <Label
                          htmlFor="discount"
                          className="mb-0 cursor-pointer text-sm"
                        >
                          Discounted Price
                        </Label>
                      </div>

                      {data.discount && (
                        <div className="pt-1">
                          <Input
                            type="number"
                            name="discount_price"
                            placeholder="e.g. 39"
                            value={data.discount_price}
                            onChange={(e) =>
                              setData((prev) => ({
                                ...prev,
                                discount_price: e.target.value,
                              }))
                            }
                          />
                          <InputError message={errors.discount_price} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {(thumbnailPreview || data.thumbnail) && (
                  <div className="mt-2 relative w-32 h-20 rounded-md overflow-hidden border border-border bg-muted">
                    <img
                      src={thumbnailPreview || data.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    {uploadingThumbnail && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                )}
                <InputError message={errors.thumbnail} />
              </div>
            </div>
          </div>

          <div className="col-span-2 mt-6 text-right">
            <LoadingButton loading={processing || uploadingThumbnail}>Create Product</LoadingButton>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  )
}
