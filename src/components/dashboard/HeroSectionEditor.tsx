'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Save,
  Upload,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEFAULT_HERO_DATA, HeroSectionData } from '@/lib/data/hero-section'

const AVAILABLE_AVATARS = [
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
  '/assets/avatars/avatar-5.png',
  '/assets/avatars/avatar-6.png',
  '/assets/avatars/avatar-7.png',
  '/assets/avatars/avatar-8.png',
  '/assets/avatars/avatar-9.png',
  '/assets/avatars/avatar-10.png',
  '/assets/avatars/avatar-11.png',
  '/assets/avatars/avatar-12.png',
]

export default function HeroSectionEditor() {
  const [formData, setFormData] = useState<HeroSectionData>(DEFAULT_HERO_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'main' | 'stats' | 'bottomCards'>('main')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/hero-section')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_HERO_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load hero section data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (field: keyof HeroSectionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: keyof HeroSectionData
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading('Uploading image...')

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
          handleChange(targetField, uploadedUrl)
          toast.success('Image uploaded successfully!', { id: toastId })
        } else {
          toast.error(json.message || 'Image upload succeeded but no URL was returned', { id: toastId })
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || 'Failed to upload image to storage', { id: toastId })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed', { id: toastId })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading('Saving hero section settings...')

    try {
      const res = await fetch('/api/admin/hero-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Hero section updated successfully!', { id: toastId })
      } else {
        toast.error(json.message || 'Failed to save', { id: toastId })
      }
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('An error occurred while saving', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset all hero fields to default values?')) {
      setFormData(DEFAULT_HERO_DATA)
      toast.info('Reset to default values. Click Save to persist.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="size-6 text-purple-600" />
            Hero Section Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize hero headline, description, models, CTA buttons, active stats, and bottom cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <span>Live Preview</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="size-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('main')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'main'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <ImageIcon className="size-4" />
          <span>Main Banner & Model</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'stats'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <LinkIcon className="size-4" />
          <span>Stats & Quick Pills</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bottomCards')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'bottomCards'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Layers className="size-4" />
          <span>Bottom 3 Cards</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: MAIN BANNER & MODEL                                                */}
        {/* ========================================================================= */}
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Texts & Buttons */}
            <div className="lg:col-span-2 space-y-5 rounded-2xl border bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">
                Headline & Subtitle
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Headline Line 1 (White)
                  </label>
                  <input
                    type="text"
                    value={formData.headlineLine1}
                    onChange={(e) => handleChange('headlineLine1', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Headline Line 2 (White)
                  </label>
                  <input
                    type="text"
                    value={formData.headlineLine2}
                    onChange={(e) => handleChange('headlineLine2', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Headline Line 3 (Colored)
                  </label>
                  <input
                    type="text"
                    value={formData.headlineLine3}
                    onChange={(e) => handleChange('headlineLine3', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Line 3 Accent Color (Hex)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="size-10 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                  <span className="text-xs text-slate-400">Default: #D8FC38</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3 pt-3">
                Call to Action Buttons
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonText}
                    onChange={(e) => handleChange('primaryButtonText', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Button URL
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonUrl}
                    onChange={(e) => handleChange('primaryButtonUrl', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Watch Video Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.videoButtonText}
                    onChange={(e) => handleChange('videoButtonText', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Video URL / Embed Link
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Model Student Image & Positioning */}
            <div className="space-y-5 rounded-2xl border bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">
                Hero Model Student Image
              </h2>

              {/* Image Preview Box */}
              <div className="relative h-64 w-full rounded-xl bg-gradient-to-br from-purple-200 to-indigo-100 overflow-hidden flex items-end justify-center border">
                {formData.modelImageUrl ? (
                  <Image
                    src={formData.modelImageUrl}
                    alt="Model Preview"
                    fill
                    className="object-contain object-bottom"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ImageIcon className="size-10 mb-2" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Upload New Model (Transparent PNG recommended)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-400 bg-purple-50/50 py-3 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300">
                    <Upload className="size-4" />
                    <span>{uploading ? 'Uploading...' : 'Choose File to Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'modelImageUrl')}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Direct Path Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Image Path / URL
                </label>
                <input
                  type="text"
                  value={formData.modelImageUrl}
                  onChange={(e) => handleChange('modelImageUrl', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-950 font-mono"
                />
              </div>

              {/* Horizontal Position Alignment (Center vs Overlap fix) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Horizontal Position (Left %)
                  </label>
                  <span className="text-xs font-mono font-bold text-purple-600">
                    {formData.modelPositionLeft}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="1"
                  value={parseInt(formData.modelPositionLeft, 10) || 28}
                  onChange={(e) => handleChange('modelPositionLeft', `${e.target.value}%`)}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Adjusting to ~27%-29% keeps the model centered without covering the right links.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STATS & QUICK PILLS (Learner Avatars & Stacked Pill Links)          */}
        {/* ========================================================================= */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* 10K+ Active Learners Floating Card & Avatars (xl:col-span-7) */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* Card 1: 10K+ Card Content & Live Preview */}
              <div className="rounded-2xl border bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="size-4 text-purple-600" />
                      10K+ Active Learners Floating Card
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure numbers, labels, badges, and all 4 learner avatars shown in the floating hero card.
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    Live Component
                  </span>
                </div>

                {/* Visual Live Preview of the Floating Card */}
                <div className="rounded-2xl bg-gradient-to-r from-[#9F8CD7] to-[#BFB0F3] p-6 flex items-center justify-center">
                  <div className="w-full max-w-[280px] rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-white/60">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-950">
                        {formData.statsCount || '10K+'}
                      </span>
                      <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {formData.statsLabel || 'Active Learners'}
                    </p>

                    {/* Overlapping Avatars */}
                    <div className="mt-4 flex items-center">
                      <div className="flex -space-x-2">
                        {[
                          formData.avatar1Url || '/assets/avatars/avatar-1.png',
                          formData.avatar2Url || '/assets/avatars/avatar-2.png',
                          formData.avatar3Url || '/assets/avatars/avatar-3.png',
                          formData.avatar4Url || '/assets/avatars/avatar-4.png',
                        ].map((avUrl, idx) => (
                          <div
                            key={idx}
                            className="relative size-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-2xs"
                          >
                            <Image
                              src={avUrl}
                              alt={`Learner ${idx + 1}`}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="ml-2 flex size-7 items-center justify-center rounded-full bg-[#EFEAFE] text-xs font-bold text-[#7C3AED]">
                        {formData.avatarMoreCount || '+'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inputs for Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Learners Count (e.g. 10K+, 25K+)
                    </label>
                    <input
                      type="text"
                      value={formData.statsCount}
                      onChange={(e) => handleChange('statsCount', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={formData.statsLabel}
                      onChange={(e) => handleChange('statsLabel', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Card Arrow Link URL
                    </label>
                    <input
                      type="text"
                      value={formData.statsUrl}
                      onChange={(e) => handleChange('statsUrl', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      More Badge Text / Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.avatarMoreCount}
                      onChange={(e) => handleChange('avatarMoreCount', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-purple-700 outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                      placeholder="+"
                    />
                  </div>
                </div>

                {/* Preset Bundles */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Quick Avatar Presets:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('avatar1Url', '/assets/avatars/avatar-1.png')
                        handleChange('avatar2Url', '/assets/avatars/avatar-2.png')
                        handleChange('avatar3Url', '/assets/avatars/avatar-3.png')
                        handleChange('avatar4Url', '/assets/avatars/avatar-4.png')
                        toast.success('Applied Default Student Avatars (1–4)')
                      }}
                      className="rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 cursor-pointer"
                    >
                      Default Students (1–4)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('avatar1Url', '/assets/avatars/avatar-5.png')
                        handleChange('avatar2Url', '/assets/avatars/avatar-6.png')
                        handleChange('avatar3Url', '/assets/avatars/avatar-7.png')
                        handleChange('avatar4Url', '/assets/avatars/avatar-8.png')
                        toast.success('Applied Alternative Avatars (5–8)')
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                      Diverse Group (5–8)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('avatar1Url', '/assets/avatars/avatar-9.png')
                        handleChange('avatar2Url', '/assets/avatars/avatar-10.png')
                        handleChange('avatar3Url', '/assets/avatars/avatar-11.png')
                        handleChange('avatar4Url', '/assets/avatars/avatar-12.png')
                        toast.success('Applied Professional Avatars (9–12)')
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                      Professional (9–12)
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Detailed 4 Avatar Slots Configuration */}
              <div className="rounded-2xl border bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2.5">
                  Individual Learner Avatar Slots
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Learner Avatar 1 (Leftmost)', field: 'avatar1Url' as const, current: formData.avatar1Url },
                    { label: 'Learner Avatar 2', field: 'avatar2Url' as const, current: formData.avatar2Url },
                    { label: 'Learner Avatar 3', field: 'avatar3Url' as const, current: formData.avatar3Url },
                    { label: 'Learner Avatar 4 (Rightmost)', field: 'avatar4Url' as const, current: formData.avatar4Url },
                  ].map((slot, index) => (
                    <div
                      key={slot.field}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-full border-2 border-purple-500 overflow-hidden bg-slate-200 shadow-sm shrink-0">
                            <Image
                              src={slot.current || `/assets/avatars/avatar-${index + 1}.png`}
                              alt={slot.label}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {slot.label}
                            </span>
                            <p className="text-xs text-slate-400 font-mono truncate max-w-[180px] sm:max-w-xs">
                              {slot.current}
                            </p>
                          </div>
                        </div>

                        {/* Upload Button */}
                        <label className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300 shadow-2xs">
                          <Upload className="size-3.5" />
                          <span>{uploading ? '...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, slot.field)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>

                      {/* Direct URL input */}
                      <div>
                        <input
                          type="text"
                          value={slot.current}
                          onChange={(e) => handleChange(slot.field, e.target.value)}
                          placeholder="e.g. /assets/avatars/avatar-1.png"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                        />
                      </div>

                      {/* Quick Swatch Selection from Available Avatars */}
                      <div>
                        <span className="block text-xs text-slate-500 mb-1.5">
                          Or select from library avatars:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_AVATARS.map((avPath, avIdx) => {
                            const isSelected = slot.current === avPath
                            return (
                              <button
                                key={avIdx}
                                type="button"
                                onClick={() => handleChange(slot.field, avPath)}
                                className={`relative size-7 rounded-full border transition-all cursor-pointer overflow-hidden ${
                                  isSelected
                                    ? 'ring-2 ring-purple-600 ring-offset-1 border-white scale-110'
                                    : 'border-slate-200 hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                                title={`Select avatar ${avIdx + 1}`}
                              >
                                <Image
                                  src={avPath}
                                  alt={`Avatar ${avIdx + 1}`}
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Stacked Pill Links (xl:col-span-5) */}
            <div className="xl:col-span-5 space-y-6">
              <div className="rounded-2xl border bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="border-b pb-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LinkIcon className="size-4 text-purple-600" />
                    3 Stacked Pill Links
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The quick navigation pill buttons placed directly beneath the 10K+ card.
                  </p>
                </div>

                {/* Visual Preview */}
                <div className="rounded-2xl bg-gradient-to-r from-[#9F8CD7] to-[#BFB0F3] p-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between rounded-full bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>{formData.pill1Text || 'Industry Experts'}</span>
                    <ArrowRight className="size-3 text-slate-700" />
                  </div>
                  <div className="flex items-center justify-between rounded-full bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>{formData.pill2Text || 'Flexible Learning'}</span>
                    <ArrowRight className="size-3 text-slate-700" />
                  </div>
                  <div className="flex items-center justify-between rounded-full bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>{formData.pill3Text || 'Certificate Programs'}</span>
                    <ArrowRight className="size-3 text-slate-700" />
                  </div>
                </div>

                {/* Pill 1 Inputs */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pill Link 1
                  </span>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Display Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Industry Experts"
                      value={formData.pill1Text}
                      onChange={(e) => handleChange('pill1Text', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Target URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /instructors"
                      value={formData.pill1Url}
                      onChange={(e) => handleChange('pill1Url', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Pill 2 Inputs */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pill Link 2
                  </span>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Display Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Flexible Learning"
                      value={formData.pill2Text}
                      onChange={(e) => handleChange('pill2Text', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Target URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /courses"
                      value={formData.pill2Url}
                      onChange={(e) => handleChange('pill2Url', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Pill 3 Inputs */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pill Link 3
                  </span>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Display Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Certificate Programs"
                      value={formData.pill3Text}
                      onChange={(e) => handleChange('pill3Text', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Target URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /certificates"
                      value={formData.pill3Url}
                      onChange={(e) => handleChange('pill3Url', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BOTTOM 3 CARDS                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'bottomCards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Mind, Body & Soul */}
            <div className="space-y-3.5 rounded-2xl border bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Card 1 (Left)</span>
                <span className="text-xs text-slate-400">Warm Beige</span>
              </div>

              {/* Image Preview & Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Card Model Image (Male Yoga)
                </label>
                <div className="relative h-28 w-full rounded-xl bg-[#FAF3ED] overflow-hidden flex items-end justify-center border border-[#f0e4dc] mb-2">
                  {formData.card1ImageUrl ? (
                    <Image
                      src={formData.card1ImageUrl}
                      alt="Card 1 Preview"
                      fill
                      className="object-contain object-bottom"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <ImageIcon className="size-6 mb-1" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-purple-400 bg-purple-50/50 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300">
                    <Upload className="size-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'card1ImageUrl')}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={formData.card1ImageUrl}
                  onChange={(e) => handleChange('card1ImageUrl', e.target.value)}
                  placeholder="/assets/images/hero-yoga-man.png"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Badge</label>
                <input
                  type="text"
                  value={formData.card1Badge}
                  onChange={(e) => handleChange('card1Badge', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.card1Title}
                  onChange={(e) => handleChange('card1Title', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.card1Description}
                  onChange={(e) => handleChange('card1Description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.card1Url}
                  onChange={(e) => handleChange('card1Url', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Card 2: Learn Anywhere (Middle, Lime) */}
            <div className="space-y-3.5 rounded-2xl border bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-lime-600">Card 2 (Middle)</span>
                <span className="text-xs text-slate-400">Lime Green (No Model)</span>
              </div>

              <div className="rounded-xl bg-[#E9FC86] p-3 text-center border border-lime-300">
                <span className="text-xs font-semibold text-slate-900">
                  Strictly No Model Image (Text-Only Design)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Badge</label>
                <input
                  type="text"
                  value={formData.card2Badge}
                  onChange={(e) => handleChange('card2Badge', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.card2Title}
                  onChange={(e) => handleChange('card2Title', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.card2Description}
                  onChange={(e) => handleChange('card2Description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.card2BgColor}
                    onChange={(e) => handleChange('card2BgColor', e.target.value)}
                    className="size-8 rounded border p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.card2BgColor}
                    onChange={(e) => handleChange('card2BgColor', e.target.value)}
                    className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.card2Url}
                  onChange={(e) => handleChange('card2Url', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Card 3: Build a Healthier You (Right, Lavender) */}
            <div className="space-y-3.5 rounded-2xl border bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Card 3 (Right)</span>
                <span className="text-xs text-slate-400">Pastel Lilac</span>
              </div>

              {/* Image Preview & Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Card Model Image (Female Yoga)
                </label>
                <div className="relative h-28 w-full rounded-xl bg-[#EBE7FA] overflow-hidden flex items-end justify-center border border-[#e2dcf5] mb-2">
                  {formData.card3ImageUrl ? (
                    <Image
                      src={formData.card3ImageUrl}
                      alt="Card 3 Preview"
                      fill
                      className="object-contain object-bottom"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <ImageIcon className="size-6 mb-1" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-purple-400 bg-purple-50/50 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300">
                    <Upload className="size-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'card3ImageUrl')}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={formData.card3ImageUrl}
                  onChange={(e) => handleChange('card3ImageUrl', e.target.value)}
                  placeholder="/assets/images/hero-yoga-woman.png"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Badge</label>
                <input
                  type="text"
                  value={formData.card3Badge}
                  onChange={(e) => handleChange('card3Badge', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.card3Title}
                  onChange={(e) => handleChange('card3Title', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.card3Description}
                  onChange={(e) => handleChange('card3Description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.card3Url}
                  onChange={(e) => handleChange('card3Url', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            </div>

          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 border-t pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <CheckCircle2 className="size-4" />
            <span>{saving ? 'Saving...' : 'Save Hero Section Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}
