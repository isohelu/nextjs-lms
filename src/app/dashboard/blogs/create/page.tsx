'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import Combobox from '@/components/combobox'
import InputError from '@/components/input-error'
import LoadingButton from '@/components/loading-button'
import { Editor } from '@/components/rich-editor'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react'

export default function CreateBlogPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([
    { label: 'Technology & AI', value: '1' },
    { label: 'Design & UI/UX', value: '2' },
    { label: 'Programming & Web Dev', value: '3' },
    { label: 'Career & Growth', value: '4' },
  ])

  useEffect(() => {
    fetch('/api/categories/blog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setCategories(
            data.categories.map((c: any) => ({
              label: c.name || c.title,
              value: String(c.id),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const [data, setData] = useState({
    title: '',
    categoryId: '',
    status: 'draft',
    keywords: '',
    description: '',
    thumbnail: '',
  })

  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void,
    key?: 'thumbnail' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setter(previewUrl)
    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_type', 'Modules\\Blog\\Models\\Blog')
      formData.append('collection_name', key || 'banner')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (res.ok && result.success && result.url) {
        if (key) {
          setData((prev) => ({ ...prev, [key]: result.url }))
        }
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          const resultStr = reader.result as string
          if (key) {
            setData((prev) => ({ ...prev, [key]: resultStr }))
          }
        }
        reader.readAsDataURL(file)
      }
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        const resultStr = reader.result as string
        if (key) {
          setData((prev) => ({ ...prev, [key]: resultStr }))
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadingFile) {
      toast.info('Please wait while file is uploading...')
      return
    }

    const newErrors: Record<string, string> = {}
    if (!data.title.trim()) newErrors.title = 'Title is required.'
    if (!data.description.trim()) newErrors.description = 'Description is required.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          category_id: data.categoryId,
          status: data.status,
          keywords: data.keywords,
          description: data.description,
          thumbnail: data.thumbnail || thumbnailPreview || null,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Blog post published successfully!')
        router.push('/dashboard/blogs')
      } else {
        const errorMsg = result.message || 'Failed to save blog.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      const netMsg = 'Failed to create blog due to network error.'
      toast.error(netMsg)
      setErrors({ general: netMsg })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Create Blog"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Blogs', href: '/dashboard/blogs' },
          { title: 'Create New Blog' },
        ]}
        className="mb-4"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        {/* Basic Information */}
        <Card className="py-6">
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={data.title}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, title: e.target.value }))
                  setErrors((prev) => ({ ...prev, title: '' }))
                }}
                placeholder="Title"
                maxLength={80}
              />
              <InputError message={errors.title} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="blog_category_id">Category *</Label>
                <Combobox
                  defaultValue={data.categoryId}
                  data={categories}
                  placeholder="Select category"
                  onSelect={(selected) =>
                    setData((prev) => ({ ...prev, categoryId: selected.value }))
                  }
                />
                <InputError message={errors.categoryId} />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  name="status"
                  value={data.status}
                  onValueChange={(val) =>
                    setData((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.status} />
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                name="keywords"
                value={data.keywords}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, keywords: e.target.value }))
                }
                placeholder="Keywords 80 characters max"
                maxLength={80}
              />
              <InputError message={errors.keywords} />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Editor
                ssr={true}
                output="html"
                placeholder={{
                  paragraph: 'Write blog content here...',
                  imageCaption: 'Type caption (optional)',
                }}
                contentMinHeight={256}
                initialContent={data.description}
                value={data.description}
                onContentChange={(val) => {
                  setData((prev) => ({ ...prev, description: val }))
                  setErrors((prev) => ({ ...prev, description: '' }))
                }}
              />
              <InputError message={errors.description} />
            </div>
          </CardContent>
        </Card>

        {/* Media Information */}
        <Card className="space-y-6 py-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Media Files
            </CardTitle>
            <CardDescription>
              Upload banner and thumbnail images for your blog article
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="banner">Blog Banner</Label>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                name="banner"
                onChange={(e) => handleFileChange(e, setBannerPreview)}
              />
              {bannerPreview && (
                <div className="mt-2 relative overflow-hidden rounded-lg border border-border/60 bg-muted">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="h-32 w-full object-cover"
                  />
                  {uploadingFile && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                name="thumbnail"
                onChange={(e) => handleFileChange(e, setThumbnailPreview, 'thumbnail')}
              />
              {thumbnailPreview && (
                <div className="mt-2 relative overflow-hidden rounded-lg border border-border/60 bg-muted">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-32 w-full object-cover"
                  />
                  {uploadingFile && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <LoadingButton loading={processing || uploadingFile}>Save Blog</LoadingButton>
        </div>
      </form>
    </DashboardLayout>
  )
}
