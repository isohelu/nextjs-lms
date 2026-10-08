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
  Star,
  Layers,
  Sparkles,
  Eye,
  MessageSquareQuote,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  TestimonialsSectionData,
  TestimonialCardItem,
  DEFAULT_TESTIMONIALS_DATA,
} from '@/lib/data/testimonials-section'
import Testimonials from '@/components/home/Testimonials'

export default function TestimonialsSectionEditor() {
  const [formData, setFormData] = useState<TestimonialsSectionData>(DEFAULT_TESTIMONIALS_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | string | null>(null)
  const [activeTab, setActiveTab] = useState<'cards' | 'rating' | 'header' | 'preview'>('cards')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/testimonials')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_TESTIMONIALS_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load testimonials settings:', err)
        toast.error('Could not load current settings, loaded defaults instead.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = <K extends keyof TestimonialsSectionData>(
    field: K,
    value: TestimonialsSectionData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Card list operations
  const handleCardChange = (index: number, field: keyof TestimonialCardItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.cards]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, cards: updated }
    })
  }

  const handleAddCard = () => {
    const newCard: TestimonialCardItem = {
      id: `card-${Date.now()}`,
      name: 'New Student',
      role: 'Software Developer',
      location: 'New York, USA',
      avatar: '/assets/images/student-alex-berlin.jpg',
      quote:
        'The hands-on projects and mentoring gave me the confidence to apply for senior engineering roles.',
      rating: 5,
    }
    setFormData((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }))
    toast.success('New card added! Scroll down to edit details.')
  }

  const handleDeleteCard = (index: number) => {
    if (formData.cards.length <= 1) {
      toast.error('You must keep at least 1 card.')
      return
    }
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }))
    toast.success('Card removed.')
  }

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.cards.length) return

    setFormData((prev) => {
      const updated = [...prev.cards]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, cards: updated }
    })
  }

  // File upload handler
  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cardIndex: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(cardIndex)
    const toastId = toast.loading('Uploading avatar...')

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
          handleCardChange(cardIndex, 'avatar', uploadedUrl)
          toast.success('Avatar uploaded successfully!', { id: toastId })
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

  // File upload for rating avatars
  const handleRatingAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    avatarIndex: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(`rating-${avatarIndex}`)
    const toastId = toast.loading('Uploading rating avatar...')

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
          setFormData((prev) => {
            const updated = [...prev.ratingAvatars]
            updated[avatarIndex] = uploadedUrl
            return { ...prev, ratingAvatars: updated }
          })
          toast.success('Rating avatar updated!', { id: toastId })
        }
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
    const toastId = toast.loading('Saving testimonials settings...')

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Testimonials section settings saved successfully!', { id: toastId })
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
    if (confirm('Are you sure you want to reset all testimonials section settings to default?')) {
      setFormData(DEFAULT_TESTIMONIALS_DATA)
      toast.info('Reset to default values. Click "Save Changes" to apply.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8FC38] border-t-transparent" />
          Loading Testimonials settings...
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
            <MessageSquareQuote className="h-6 w-6 text-[#84CC16]" />
            Testimonials Section Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control the "Trusted by Learners Worldwide" section, customize all cards, hover rating metrics, and student reviews.
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
          Manage Cards ({formData.cards.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rating')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'rating'
              ? 'border-[#84CC16] text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Hover Rating Card & Stats
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
          Section Header
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

      {/* TAB 1: MANAGE CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Testimonial Cards Control
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add, reorder, or update student reviews. Hovering over ANY of these cards on the live website will smoothly reveal the rating card!
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddCard}
              className="bg-[#D8FC38] hover:bg-[#c9f022] text-slate-950 font-bold cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Card
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {formData.cards.map((card, index) => (
              <div
                key={card.id || index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4"
              >
                {/* Card header row with controls */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div className="relative h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image
                        src={card.avatar || '/assets/images/student-sarah-ahmed.jpg'}
                        alt={card.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                        {card.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {card.role} • {card.location}
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
                      disabled={index === formData.cards.length - 1}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Student Name</Label>
                    <Input
                      value={card.name}
                      onChange={(e) => handleCardChange(index, 'name', e.target.value)}
                      placeholder="e.g. Sarah Ahmed"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Role / Designation</Label>
                    <Input
                      value={card.role}
                      onChange={(e) => handleCardChange(index, 'role', e.target.value)}
                      placeholder="e.g. Product Designer"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Location</Label>
                    <Input
                      value={card.location}
                      onChange={(e) => handleCardChange(index, 'location', e.target.value)}
                      placeholder="e.g. Dhaka, Bangladesh"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Rating (1 - 5 Stars)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={card.rating}
                        onChange={(e) =>
                          handleCardChange(index, 'rating', Number(e.target.value) || 5)
                        }
                      />
                      <div className="flex text-amber-400 shrink-0">
                        {[...Array(card.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current stroke-none" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avatar upload / URL */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Student Avatar Image</Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      value={card.avatar}
                      onChange={(e) => handleCardChange(index, 'avatar', e.target.value)}
                      placeholder="/assets/images/student-sarah-ahmed.jpg"
                      className="font-mono text-xs"
                    />
                    <label className="relative shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingIndex === index}
                        className="cursor-pointer pointer-events-none"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingIndex === index ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(e, index)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Testimonial Quote</Label>
                  <Textarea
                    rows={3}
                    value={card.quote}
                    onChange={(e) => handleCardChange(index, 'quote', e.target.value)}
                    placeholder="Enter student review quote..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOVER RATING CARD & STATS */}
      {activeTab === 'rating' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Electric Lime Rating Card Customization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This card is revealed whenever a user hovers over ANY of the testimonial cards. You can adjust the rating score, student count, and avatars below.
            </p>
          </div>

          {/* Hover toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Enable Hover Rating Card on All Cards
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When enabled, hovering on any card transforms it into the vibrant Electric Lime Rating Card.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hoverRatingEnabled}
                onChange={(e) => handleChange('hoverRatingEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#84CC16]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Rating Score */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rating Score</Label>
              <Input
                value={formData.ratingScore}
                onChange={(e) => handleChange('ratingScore', e.target.value)}
                placeholder="4.9"
              />
            </div>

            {/* Rating Max */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rating Max Suffix</Label>
              <Input
                value={formData.ratingMax}
                onChange={(e) => handleChange('ratingMax', e.target.value)}
                placeholder="/ 5.0"
              />
            </div>

            {/* Rating Label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rating Label</Label>
              <Input
                value={formData.ratingLabel}
                onChange={(e) => handleChange('ratingLabel', e.target.value)}
                placeholder="Average Rating"
              />
            </div>

            {/* Stars Count */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Black Stars Count</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.ratingStars}
                onChange={(e) => handleChange('ratingStars', Number(e.target.value) || 5)}
              />
            </div>

            {/* Students Count */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trusted Students Count</Label>
              <Input
                value={formData.studentsCount}
                onChange={(e) => handleChange('studentsCount', e.target.value)}
                placeholder="15K+"
              />
            </div>

            {/* Students Label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trusted Students Label</Label>
              <Input
                value={formData.studentsLabel}
                onChange={(e) => handleChange('studentsLabel', e.target.value)}
                placeholder="Trusted Students"
              />
            </div>
          </div>

          {/* Rating Card 3 Overlapping Avatars */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-sm font-bold text-slate-900 dark:text-white">
              Rating Card Overlapping Avatars (3 Circles)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-xs">
                      <Image
                        src={formData.ratingAvatars[idx] || '/assets/images/student-sarah-ahmed.jpg'}
                        alt={`Avatar ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Avatar #{idx + 1}
                    </span>
                  </div>
                  <Input
                    value={formData.ratingAvatars[idx] || ''}
                    onChange={(e) => {
                      const updated = [...formData.ratingAvatars]
                      updated[idx] = e.target.value
                      handleChange('ratingAvatars', updated)
                    }}
                    className="font-mono text-xs"
                  />
                  <label className="relative block">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full cursor-pointer pointer-events-none text-xs"
                      disabled={uploadingIndex === `rating-${idx}`}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {uploadingIndex === `rating-${idx}` ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleRatingAvatarUpload(e, idx)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION HEADER */}
      {activeTab === 'header' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Section Header & Typography
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the badge, headline, and subtitle appearing above the cards grid.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pill Badge Text</Label>
              <Input
                value={formData.badgeText}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="STUDENT SUCCESS"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Main Heading</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Trusted by Learners Worldwide"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subtitle Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Real stories from students who gained new skills..."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INTERACTIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#84CC16]" />
                Live Interactive Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hover over ANY card below to test the Electric Lime rating card transition in real time!
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              Interactive Live View
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Testimonials initialData={formData} />
          </div>
        </div>
      )}
    </div>
  )
}
