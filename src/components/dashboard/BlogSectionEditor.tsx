'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Save,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Eye,
  Newspaper,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  BlogSectionData,
  BlogCardItem,
  DEFAULT_BLOG_SECTION_DATA,
} from '@/lib/data/blog-section'
import Blogs from '@/components/home/Blogs'

export default function BlogSectionEditor() {
  const [formData, setFormData] = useState<BlogSectionData>(DEFAULT_BLOG_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'cards' | 'header' | 'preview'>('cards')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/blog-section')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_BLOG_SECTION_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load blog section settings:', err)
        toast.error('Could not load current settings, loaded defaults instead.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = <K extends keyof BlogSectionData>(
    field: K,
    value: BlogSectionData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCardChange = (index: number, field: keyof BlogCardItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.blogs]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, blogs: updated }
    })
  }

  const handleAddCard = () => {
    const newCard: BlogCardItem = {
      id: `blog-${Date.now()}`,
      title: 'New Insight Article Title',
      slug: 'new-insight-article',
      category: 'Design',
      image: '/assets/images/blog-web-design-trends.jpg',
    }
    setFormData((prev) => ({
      ...prev,
      blogs: [...prev.blogs, newCard],
    }))
    toast.success('New blog card added! Scroll down to edit details.')
  }

  const handleDeleteCard = (index: number) => {
    if (formData.blogs.length <= 1) {
      toast.error('You must keep at least 1 card.')
      return
    }
    setFormData((prev) => ({
      ...prev,
      blogs: prev.blogs.filter((_, i) => i !== index),
    }))
    toast.success('Card removed.')
  }

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.blogs.length) return

    setFormData((prev) => {
      const updated = [...prev.blogs]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, blogs: updated }
    })
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cardIndex: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(cardIndex)
    const toastId = toast.loading('Uploading blog thumbnail...')

    try {
      const data = new FormData()
      data.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })

      if (res.ok) {
        const json = await res.json()
        const uploadedUrl = json.url || json.data?.url || (json.files && json.files[0]?.url)
        if (uploadedUrl) {
          handleCardChange(cardIndex, 'image', uploadedUrl)
          toast.success('Image uploaded successfully!', { id: toastId })
        } else {
          toast.error(json.message || 'Image uploaded but no URL returned', { id: toastId })
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || 'Failed to upload image', { id: toastId })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed', { id: toastId })
    } finally {
      setUploadingIndex(null)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving blog section settings...')

    try {
      const res = await fetch('/api/admin/blog-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Blog section settings saved successfully!', { id: toastId })
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || 'Failed to save settings', { id: toastId })
      }
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('Failed to save settings', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all blog section settings to default?')) {
      setFormData(DEFAULT_BLOG_SECTION_DATA)
      toast.info('Reset to default values. Click "Save Changes" to apply.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8FC38] border-t-transparent" />
          Loading Blog section settings...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Newspaper className="h-6 w-6 text-[#84CC16]" />
            Latest Insights & Blogs Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control the editorial 3-column layout, titles, categories, images, and CTA button.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 cursor-pointer shadow-xs font-semibold"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'cards'
              ? 'border-[#84CC16] text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          Manage Articles ({formData.blogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'header'
              ? 'border-[#84CC16] text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Header & CTA Button
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'preview'
              ? 'border-[#84CC16] text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="h-4 w-4" />
          Live Interactive Preview
        </button>
      </div>

      {/* TAB 1: MANAGE ARTICLES */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5 Editorial Blog Cards
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The first 5 cards fill the grid slots around the main header block matching the reference UI.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddCard}
              className="bg-[#D8FC38] hover:bg-[#c9f022] text-slate-950 font-bold cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Article
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {formData.blogs.map((blog, index) => (
              <div
                key={blog.id || index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div className="relative h-10 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                      <Image
                        src={blog.image || '/assets/images/blog-web-design-trends.jpg'}
                        alt={blog.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {blog.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Category: {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveCard(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveCard(index, 'down')}
                      disabled={index === formData.blogs.length - 1}
                      className="h-8 w-8 p-0 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category</Label>
                    <Input
                      value={blog.category}
                      onChange={(e) => handleCardChange(index, 'category', e.target.value)}
                      placeholder="e.g. Design, Development, Technology"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Slug / URL</Label>
                    <Input
                      value={blog.slug}
                      onChange={(e) => handleCardChange(index, 'slug', e.target.value)}
                      placeholder="e.g. top-web-design-trends"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Thumbnail Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={blog.image}
                        onChange={(e) => handleCardChange(index, 'image', e.target.value)}
                        placeholder="/assets/images/blog-image.jpg"
                        className="font-mono text-xs"
                      />
                      <label className="relative shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingIndex === index}
                          className="cursor-pointer pointer-events-none"
                        >
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          {uploadingIndex === index ? '...' : 'Upload'}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Article Title</Label>
                  <Input
                    value={blog.title}
                    onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HEADER & CTA BUTTON */}
      {activeTab === 'header' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Slot 1 Header & CTA Customization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the uppercase headline, description, and "Browse All →" pill button text and destination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Headline Line 1</Label>
              <Input
                value={formData.titleLine1}
                onChange={(e) => handleChange('titleLine1', e.target.value)}
                placeholder="OUR LATEST BLOG"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Headline Line 2</Label>
              <Input
                value={formData.titleLine2}
                onChange={(e) => handleChange('titleLine2', e.target.value)}
                placeholder="UPDATE"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Subtitle Description</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Stay informed with our latest blog update featuring expert insights!"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Button Text</Label>
              <Input
                value={formData.buttonText}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                placeholder="Browse All"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Button URL Link</Label>
              <Input
                value={formData.buttonUrl}
                onChange={(e) => handleChange('buttonUrl', e.target.value)}
                placeholder="/blogs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#84CC16]" />
                Live 3-Column Layout Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exact editorial visual representation with your configured images and typography.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              Live Preview
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Blogs initialData={formData} />
          </div>
        </div>
      )}
    </div>
  )
}
