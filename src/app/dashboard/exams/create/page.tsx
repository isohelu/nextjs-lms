'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExamUpdateManager from '@/components/dashboard/exams/ExamUpdateManager'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'

function CreateExamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [instructors, setInstructors] = useState<{ label: string; value: string }[]>([])
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    // 1. Fetch current user
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

    // 2. Fetch categories
    fetch('/api/categories/exam')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setCategories(
            data.categories.map((c: any) => ({
              label: c.title,
              value: String(c.id),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const [data, setData] = useState({
    title: '',
    instructor_id: '',
    short_description: '',
    description: '',
    exam_category_id: '',
    level: 'beginner',
    duration_hours: '1',
    duration_minutes: '0',
    pass_mark: '50',
    max_attempts: '3',
    total_marks: '100',
    pricing_type: 'paid',
    price: '',
    discount: false,
    discount_price: '',
    expiry_type: 'lifetime',
    expiry_duration: '',
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
      formData.append('model_type', 'Modules\\Exam\\Models\\Exam')
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

  const levels = ['beginner', 'intermediate', 'advanced']
  const pricingTypes = ['paid', 'free']
  const expiryTypes = ['lifetime', 'limited_time']

  const courseDurations = [
    { label: '1 Month', value: '30' },
    { label: '3 Months', value: '90' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '365' },
    { label: '2 Years', value: '730' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadingThumbnail) {
      toast.info('Please wait while thumbnail is uploading...')
      return
    }

    const newErrors: Record<string, string> = {}
    if (!data.title.trim()) {
      newErrors.title = 'Exam title is required.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Exam created successfully!')
        const id = result.examId || result.exam?.id
        if (id) {
          router.push(`/dashboard/exams/${id}`)
        } else {
          router.push('/dashboard/exams')
        }
      } else {
        const errorMsg = result.message || 'Failed to create exam.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      const netMsg = 'Failed to create exam due to network error.'
      toast.error(netMsg)
      setErrors({ general: netMsg })
    } finally {
      setProcessing(false)
    }
  }

  if (editId) {
    return <ExamUpdateManager initialExamId={parseInt(editId, 10)} />
  }

  return (
    <>
      <Breadcrumbs
        title="Create Exam"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Exams', href: '/dashboard/exams' },
          { title: 'Create New Exam' },
        ]}
        className="mb-4"
      />

      <Card className="container p-4 md:p-6">
        {errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Creation Failed</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Label>Exam Title *</Label>
              <Input
                name="title"
                placeholder="Enter exam title"
                value={data.title}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, title: e.target.value }))
                  setErrors((prev) => ({ ...prev, title: '' }))
                }}
              />
              <InputError message={errors.title} />
            </div>

            <div>
              <Label>Short Description</Label>
              <Textarea
                rows={5}
                name="short_description"
                placeholder="Brief description for exam cards"
                value={data.short_description}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
              />
              <InputError message={errors.short_description} />
            </div>

            <div>
              <Label>Description</Label>
              <Editor
                ssr={true}
                output="html"
                placeholder={{
                  paragraph: 'Enter detailed exam description...',
                  imageCaption: 'Enter detailed exam description...',
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

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="exam_category_id">Category *</Label>
                <Combobox
                  data={categories}
                  placeholder="Select category"
                  defaultValue={data.exam_category_id}
                  onSelect={(selected) => {
                    setData((prev) => ({
                      ...prev,
                      exam_category_id: selected.value,
                    }))
                  }}
                />
                <InputError message={errors.exam_category_id} />
              </div>

              <div>
                <Label>Difficulty Level *</Label>
                <Select
                  defaultValue="beginner"
                  value={data.level}
                  onValueChange={(val) =>
                    setData((prev) => ({ ...prev, level: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="capitalize"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.level} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Label>Duration (Hours) *</Label>
                <Input
                  type="number"
                  name="duration_hours"
                  placeholder="1"
                  min="0"
                  value={data.duration_hours}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      duration_hours: e.target.value,
                    }))
                  }
                />
                <InputError message={errors.duration_hours} />
              </div>

              <div>
                <Label>Duration (Minutes) *</Label>
                <Input
                  type="number"
                  name="duration_minutes"
                  placeholder="0"
                  min="0"
                  max="59"
                  value={data.duration_minutes}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      duration_minutes: e.target.value,
                    }))
                  }
                />
                <InputError message={errors.duration_minutes} />
              </div>

              <div>
                <Label>Pass Mark *</Label>
                <Input
                  type="number"
                  name="pass_mark"
                  placeholder="50"
                  min="0"
                  max="100"
                  value={data.pass_mark}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      pass_mark: e.target.value,
                    }))
                  }
                />
                <InputError message={errors.pass_mark} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Max Attempts *</Label>
                <Input
                  type="number"
                  name="max_attempts"
                  placeholder="3"
                  min="1"
                  value={data.max_attempts}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      max_attempts: e.target.value,
                    }))
                  }
                />
                <InputError message={errors.max_attempts} />
              </div>

              <div>
                <Label>Total Marks *</Label>
                <Input
                  type="number"
                  name="total_marks"
                  placeholder="100"
                  min="1"
                  value={data.total_marks}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      total_marks: e.target.value,
                    }))
                  }
                />
                <InputError message={errors.total_marks} />
              </div>
            </div>

            <div>
              <Label>Pricing Type *</Label>
              <RadioGroup
                name="pricing_type"
                defaultValue="paid"
                value={data.pricing_type}
                className="flex items-center space-x-4 pt-2 pb-1"
                onValueChange={(value) =>
                  setData((prev) => ({ ...prev, pricing_type: value }))
                }
              >
                {pricingTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="cursor-pointer"
                      id={type}
                      value={type}
                    />
                    <Label
                      htmlFor={type}
                      className="mb-0 cursor-pointer capitalize"
                    >
                      {type}
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
                      placeholder="Enter your exam price ($0)"
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
                        onCheckedChange={(checked) => {
                          setData((prev) => ({
                            ...prev,
                            discount: checked === true,
                          }))
                        }}
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
                          placeholder="Enter discount price"
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
              <Label>Expiry period type</Label>
              <RadioGroup
                name="expiry_type"
                defaultValue="lifetime"
                value={data.expiry_type}
                className="flex items-center space-x-4 pt-2 pb-1"
                onValueChange={(value) =>
                  setData((prev) => ({ ...prev, expiry_type: value }))
                }
              >
                {expiryTypes.map((expiry) => (
                  <div key={expiry} className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="cursor-pointer"
                      id={expiry}
                      value={expiry}
                    />
                    <Label
                      htmlFor={expiry}
                      className="mb-0 cursor-pointer capitalize"
                    >
                      {expiry.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <InputError message={errors.expiry_type} />

              {data.expiry_type === 'limited_time' && (
                <div className="pt-3">
                  <Label htmlFor="expiry_duration">Expiry Duration</Label>
                  <Combobox
                    defaultValue={data.expiry_duration}
                    data={courseDurations}
                    placeholder="Select duration"
                    onSelect={(selected) =>
                      setData((prev) => ({
                        ...prev,
                        expiry_duration: selected.value,
                      }))
                    }
                  />
                  <InputError message={errors.expiry_duration} />
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

          <div className="col-span-full pt-2">
            <LoadingButton loading={processing || uploadingThumbnail} className="float-end">
              Create Exam
            </LoadingButton>
          </div>
        </form>
      </Card>
    </>
  )
}

export default function CreateExamPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CreateExamContent />
      </Suspense>
    </DashboardLayout>
  )
}
