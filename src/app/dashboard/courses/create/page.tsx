'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import Combobox, { ComboboxItem } from '@/components/combobox'
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
import CourseUpdateManager from '@/components/dashboard/courses/CourseUpdateManager'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'

function CreateCourseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')


  const [currentUser, setCurrentUser] = useState<any>(null)
  const [instructors, setInstructors] = useState<ComboboxItem[]>([])
  const [selectedInstructorValue, setSelectedInstructorValue] = useState('')
  const [selectedCategoryValue, setSelectedCategoryValue] = useState('')
  const [categories, setCategories] = useState<ComboboxItem[]>([
    { label: 'Web Development', value: '1', id: '1' },
    { label: 'Mobile Apps', value: '2', id: '2' },
    { label: 'Data Science', value: '3', id: '3' },
    { label: 'Cloud Architecture', value: '4', id: '4' },
  ])

  useEffect(() => {
    // 1. Fetch current authenticated user
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.success && resData?.user) {
          setCurrentUser(resData.user)
          if (resData.user.role === 'admin') {
            // Load all approved instructors for admin selection
            fetch('/api/instructors')
              .then((res) => (res.ok ? res.json() : []))
              .then((instData) => {
                if (Array.isArray(instData)) {
                  setInstructors(
                    instData.map((inst: any) => ({
                      label: inst.name || inst.label,
                      value: String(inst.id || inst.value),
                      id: String(inst.id || inst.value),
                    }))
                  )
                }
              })
              .catch(() => {})
          } else if (resData.user.instructor_id) {
            setData((prev) => ({
              ...prev,
              instructor_id: String(resData.user.instructor_id),
            }))
          }
        }
      })
      .catch(() => {})

    // 2. Fetch categories with hierarchy
    fetch('/api/course-categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData && Array.isArray(resData) && resData.length > 0) {
          const transformed: ComboboxItem[] = resData.flatMap((c: any) => {
            const parent: ComboboxItem = {
              label: c.title || c.name,
              value: String(c.id),
              id: String(c.id),
              child_id: '',
            }
            const children: ComboboxItem[] = (c.category_children || []).map((ch: any) => ({
              label: `--${ch.title || ch.name}`,
              value: `child-${ch.id}`,
              id: String(c.id),
              child_id: String(ch.id),
            }))
            return [parent, ...children]
          })
          setCategories(transformed)
        }
      })
      .catch(() => {})
  }, [])

  const [data, setData] = useState({
    title: '',
    short_description: '',
    description: '',
    course_category_id: '',
    course_category_child_id: '',
    instructor_id: '',
    level: 'Beginner',
    language: 'English',
    pricing_type: 'paid',
    price: '',
    discount: false,
    discount_price: '',
    expiry_type: 'lifetime',
    expiry_duration: '',
    drip_content: '0',
    thumbnail: '',
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  const pricingTypes = ['paid', 'free']
  const expiries = ['lifetime', 'limited_time']

  const courseLanguages = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
    { label: 'Arabic', value: 'Arabic' },
  ]

  const courseDurations = [
    { label: '1 Month', value: '30' },
    { label: '3 Months', value: '90' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '365' },
    { label: 'Lifetime', value: 'lifetime' },
  ]

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setThumbnailPreview(previewUrl)
    setUploadingThumbnail(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_type', 'Modules\\Course\\Models\\Course')
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
        // Fallback to base64 if direct upload had an issue
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
      newErrors.title = 'Course title is required.'
    }
    if (!data.course_category_id) {
      newErrors.course_category_id = 'Course category is required.'
    }
    if (currentUser?.role === 'admin' && !data.instructor_id) {
      newErrors.instructor_id = 'Course instructor is required.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Course created successfully!')
        const id = result.courseId || result.course?.id
        if (id) {
          router.push(`/dashboard/courses/${id}`)
        } else {
          router.push('/dashboard/courses')
        }
      } else {
        const errorMsg = result.message || 'Failed to create course.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      const netMsg = 'Failed to create course due to network error.'
      toast.error(netMsg)
      setErrors({ general: netMsg })
    } finally {
      setProcessing(false)
    }
  }

  if (editId) {
    return <CourseUpdateManager initialCourseId={parseInt(editId, 10)} />
  }

  return (
    <>
      <Breadcrumbs
        title="Create Course"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Create New Course' },
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
                  placeholder="e.g. Master React & Next.js"
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
                  placeholder="Brief summary of what this course offers..."
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
                    paragraph: 'Enter detailed course curriculum and details...',
                    imageCaption: 'Enter detailed course curriculum and details...',
                  }}
                  contentMinHeight={256}
                  initialContent={data.description}
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
                  <Label htmlFor="instructor_id">Course Instructor *</Label>
                  <Combobox
                    name="instructor_id"
                    data={instructors}
                    placeholder="Select Instructor"
                    defaultValue={selectedInstructorValue}
                    onSelect={(selected) => {
                      setSelectedInstructorValue(selected.value)
                      setData((prev) => ({
                        ...prev,
                        instructor_id: String(selected.id || selected.value),
                      }))
                      setErrors((prev) => ({ ...prev, instructor_id: '' }))
                    }}
                  />
                  <InputError message={errors.instructor_id} />
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="course_category_id">Category *</Label>
                  <Combobox
                    name="course_category_id"
                    data={categories}
                    placeholder="Select category"
                    defaultValue={selectedCategoryValue}
                    onSelect={(selected) => {
                      setSelectedCategoryValue(selected.value)
                      setData((prev) => ({
                        ...prev,
                        course_category_id: String(selected.id || selected.value),
                        course_category_child_id: String(selected.child_id || ''),
                      }))
                      setErrors((prev) => ({ ...prev, course_category_id: '' }))
                    }}
                  />
                  <InputError message={errors.course_category_id} />
                </div>

                <div>
                  <Label htmlFor="level">Course Level *</Label>
                  <Select
                    defaultValue="Beginner"
                    value={data.level}
                    onValueChange={(val) =>
                      setData((prev) => ({ ...prev, level: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.level} />
                </div>
              </div>

              <div>
                <Label>Course Language *</Label>
                <Combobox
                  data={courseLanguages}
                  placeholder="Select Course Language"
                  defaultValue={data.language}
                  onSelect={(selected) =>
                    setData((prev) => ({ ...prev, language: selected.value }))
                  }
                />
                <InputError message={errors.language} />
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
                  {pricingTypes.map((price) => (
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
                        placeholder="Enter course price ($0)"
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
                  {expiries.map((expiry) => (
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
                    <Label htmlFor="expiry_duration">Expiry duration</Label>
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
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="cursor-pointer"
                />
                {(thumbnailPreview || data.thumbnail) && (
                  <div className="mt-2 relative h-28 w-44 rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={thumbnailPreview || data.thumbnail}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
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

              <div>
                <Label htmlFor="drip_content">Enable Drip Content *</Label>
                <RadioGroup
                  name="drip_content"
                  defaultValue="0"
                  value={data.drip_content}
                  className="flex items-center space-x-4 pt-2 pb-1"
                  onValueChange={(val) =>
                    setData((prev) => ({ ...prev, drip_content: val }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem className="cursor-pointer" id="off" value="0" />
                    <Label htmlFor="off" className="mb-0 cursor-pointer">
                      Off
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem className="cursor-pointer" id="on" value="1" />
                    <Label htmlFor="on" className="mb-0 cursor-pointer">
                      On
                    </Label>
                  </div>
                </RadioGroup>
                <InputError message={errors.drip_content} />
              </div>
            </div>
          </div>

          <div className="col-span-2 mt-6 text-right">
            <LoadingButton loading={processing || uploadingThumbnail}>
              Create Course
            </LoadingButton>
          </div>
        </form>
      </Card>
    </>
  )
}

export default function CreateCoursePage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CreateCourseContent />
      </Suspense>
    </DashboardLayout>
  )
}
