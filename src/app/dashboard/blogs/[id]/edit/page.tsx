'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { toast } from 'sonner'
import { Image as ImageIcon, Loader2 } from 'lucide-react'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([])

  const [data, setData] = useState({
    title: '',
    categoryId: '',
    status: 'draft',
    keywords: '',
    description: '',
    thumbnail: '',
    banner: '',
  })

  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  // Fetch categories & existing blog data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const catRes = await fetch('/api/categories/blog')
        if (catRes.ok) {
          const catData = await catRes.json()
          if (catData?.categories) {
            setCategories(
              catData.categories.map((c: any) => ({
                label: c.name || c.title,
                value: String(c.id),
              }))
            )
          }
        }

        if (id) {
          const blogRes = await fetch(`/api/blogs/${id}`)
          if (blogRes.ok) {
            const blogData = await blogRes.json()
            const b = blogData.blog
            if (b) {
              setData({
                title: b.title || '',
                categoryId: b.blog_category_id ? String(b.blog_category_id) : '',
                status: b.status || 'draft',
                keywords: b.keywords || '',
                description: b.description || '',
                thumbnail: b.thumbnail || '',
                banner: b.banner || '',
              })
              if (b.thumbnail) setThumbnailPreview(b.thumbnail)
              if (b.banner) setBannerPreview(b.banner)
            }
          } else {
            toast.error('Blog post not found')
          }
        }
      } catch (err) {
        console.error('Error loading blog details:', err)
        toast.error('Failed to load blog data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

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
        reader.onloadend = () => {
          if (key && reader.result) {
            setData((prev) => ({ ...prev, [key]: reader.result as string }))
          }
        }
        reader.readAsDataURL(file)
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const errs: Record<string, string> = {}
    if (!data.title.trim()) errs.title = 'Title is required'
    if (!data.categoryId) errs.blog_category_id = 'Category is required'
    if (!data.description.trim()) errs.description = 'Blog content is required'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix errors in the form')
      return
    }

    try {
      setProcessing(true)
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          blog_category_id: Number(data.categoryId),
          status: data.status,
          keywords: data.keywords.trim(),
          description: data.description,
          thumbnail: data.thumbnail,
          banner: data.banner,
        }),
      })

      if (res.ok) {
        toast.success('Blog updated successfully')
        router.push('/dashboard/blogs')
      } else {
        const errData = await res.json()
        toast.error(errData.message || 'Failed to update blog')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Update Blog"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Blogs', href: '/dashboard/blogs' },
          { title: 'Update Blog' },
        ]}
        className="mb-4"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          {/* Basic Information */}
          <Card className="py-6">
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Enter blog title"
                  maxLength={120}
                  className={errors.title ? 'border-destructive' : ''}
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
                      setData({ ...data, categoryId: selected.value })
                    }
                  />
                  <InputError message={errors.blog_category_id} />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={data.status}
                    onValueChange={(val) => setData({ ...data, status: val })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  name="keywords"
                  value={data.keywords}
                  onChange={(e) => setData({ ...data, keywords: e.target.value })}
                  placeholder="e.g. Next.js, Web Development, AI"
                  maxLength={120}
                />
              </div>

              <div>
                <Label htmlFor="description">Content *</Label>
                <Editor
                  ssr={true}
                  output="html"
                  placeholder={{
                    paragraph: 'Write your blog content here...',
                    imageCaption: 'Type caption (optional)',
                  }}
                  contentMinHeight={256}
                  contentMaxHeight={640}
                  initialContent={data.description}
                  onContentChange={(val: any) =>
                    setData((prev) => ({ ...prev, description: val as string }))
                  }
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
                Upload banner and thumbnail images for your article
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="banner">Blog Banner</Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setBannerPreview, 'banner')}
                />
                {bannerPreview && (
                  <div className="mt-2 relative overflow-hidden rounded-lg border border-border/60 bg-muted">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setThumbnailPreview, 'thumbnail')}
                />
                {thumbnailPreview && (
                  <div className="mt-2 relative overflow-hidden rounded-lg border border-border/60 bg-muted">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <LoadingButton loading={processing || uploadingFile}>
              Update Blog
            </LoadingButton>
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}
