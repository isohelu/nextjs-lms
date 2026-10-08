'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Save,
  RotateCcw,
  Upload,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  ListVideo,
  Grid2X2,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  LmsShowcaseData,
  DEFAULT_LMS_SHOWCASE_DATA,
} from '@/lib/data/lms-showcase-section'
import LmsExperienceShowcase from '@/components/home/LmsExperienceShowcase'

export default function LmsShowcaseEditor() {
  const [formData, setFormData] = useState<LmsShowcaseData>(DEFAULT_LMS_SHOWCASE_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'video' | 'playlist' | 'features' | 'preview'>('content')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/lms-showcase')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_LMS_SHOWCASE_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load showcase data:', err)
        toast.error('Could not load current settings, loaded defaults instead.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = <K extends keyof LmsShowcaseData>(
    field: K,
    value: LmsShowcaseData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: keyof LmsShowcaseData
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(targetField)
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
          handleChange(targetField, uploadedUrl as any)
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
      setUploadingField(null)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading('Saving LMS showcase section settings...')

    try {
      const res = await fetch('/api/admin/lms-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Study showcase section updated successfully!', { id: toastId })
      } else {
        toast.error(json.message || 'Failed to save settings', { id: toastId })
      }
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('An error occurred while saving', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset all fields to default values?')) {
      setFormData(DEFAULT_LMS_SHOWCASE_DATA)
      toast.info('Fields reset to defaults. Remember to click Save Changes.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D8FC38] border-t-transparent" />
          <span>Loading showcase section settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#84CC16]" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Study Experience Showcase
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control all texts, video poster, cinema player overlays, curriculum playlist lessons, and feature cards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold px-4 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'content'
              ? 'border-[#84CC16] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Header & Tabs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'video'
              ? 'border-[#84CC16] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Play className="h-4 w-4" />
          <span>Cinema Video Player</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('playlist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'playlist'
              ? 'border-[#84CC16] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListVideo className="h-4 w-4" />
          <span>Playlist & Lessons</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'features'
              ? 'border-[#84CC16] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Grid2X2 className="h-4 w-4" />
          <span>Bottom 4 Features</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'preview'
              ? 'border-[#84CC16] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Section Preview</span>
        </button>
      </div>

      {/* Tab 1: Header & Tabs */}
      {activeTab === 'content' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Section Header & Description
            </h3>
            <p className="text-xs text-slate-500">
              The top badge, headline, and subtitle that introduces the learning showcase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badgeText">Badge Label</Label>
              <Input
                id="badgeText"
                value={formData.badgeText}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="LEARNING EXPERIENCE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Designed for Focused, Practical Study"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Section Subtitle / Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A direct look into the actual learning environment..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Mode Selector Tab Labels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tab1Label">Tab 1 Label</Label>
                <Input
                  id="tab1Label"
                  value={formData.tab1Label}
                  onChange={(e) => handleChange('tab1Label', e.target.value)}
                  placeholder="Video Learning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tab2Label">Tab 2 Label</Label>
                <Input
                  id="tab2Label"
                  value={formData.tab2Label}
                  onChange={(e) => handleChange('tab2Label', e.target.value)}
                  placeholder="Examinations"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tab3Label">Tab 3 Label</Label>
                <Input
                  id="tab3Label"
                  value={formData.tab3Label}
                  onChange={(e) => handleChange('tab3Label', e.target.value)}
                  placeholder="Certificate Verification"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cinema Video Player */}
      {activeTab === 'video' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cinema Video Player Viewport
            </h3>
            <p className="text-xs text-slate-500">
              Configure the background poster image (instructor with laptop), title overlay pill, and player duration.
            </p>
          </div>

          {/* Video Poster Preview & Upload */}
          <div className="space-y-3">
            <Label>Video Poster Image (16:9 Instructor / Course Preview)</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-48 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                <Image
                  src={formData.videoPosterUrl || '/assets/images/lms-showcase-instructor.png'}
                  alt="Video Poster Preview"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.videoPosterUrl}
                    onChange={(e) => handleChange('videoPosterUrl', e.target.value)}
                    placeholder="/assets/images/lms-showcase-instructor.png"
                    className="font-mono text-xs"
                  />
                  <label className="shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'videoPosterUrl')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingField === 'videoPosterUrl'}
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingField === 'videoPosterUrl' ? 'Uploading...' : 'Upload Image'}</span>
                      </span>
                    </Button>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommended size: 1280x720 or 1920x1080 (16:9). JPG, PNG, or WebP.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="videoTitleOverlay">Top-Left Video Title Tag</Label>
              <Input
                id="videoTitleOverlay"
                value={formData.videoTitleOverlay}
                onChange={(e) => handleChange('videoTitleOverlay', e.target.value)}
                placeholder="01. Course Overview & Prerequisites"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoDurationText">Player Duration Display</Label>
              <Input
                id="videoDurationText"
                value={formData.videoDurationText}
                onChange={(e) => handleChange('videoDurationText', e.target.value)}
                placeholder="04:15 / 12:45"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Full Video / Lecture URL (Optional direct video link)</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
      )}

      {/* Tab 3: Playlist & Lessons */}
      {activeTab === 'playlist' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Curriculum Playlist Card & Lessons
            </h3>
            <p className="text-xs text-slate-500">
              Customize the playlist card title, CTA link, and each of the 4 interactive lessons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playlistOverline">Playlist Overline</Label>
              <Input
                id="playlistOverline"
                value={formData.playlistOverline}
                onChange={(e) => handleChange('playlistOverline', e.target.value)}
                placeholder="COURSE PLAYLIST"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlistTitle">Playlist Course Title</Label>
              <Input
                id="playlistTitle"
                value={formData.playlistTitle}
                onChange={(e) => handleChange('playlistTitle', e.target.value)}
                placeholder="Full-Stack Next.js 15 & Modern Architecture"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlistBtnText">Bottom Button Label</Label>
              <Input
                id="playlistBtnText"
                value={formData.playlistBtnText}
                onChange={(e) => handleChange('playlistBtnText', e.target.value)}
                placeholder="Explore All 24 Lessons"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlistBtnUrl">Bottom Button URL</Label>
              <Input
                id="playlistBtnUrl"
                value={formData.playlistBtnUrl}
                onChange={(e) => handleChange('playlistBtnUrl', e.target.value)}
                placeholder="/courses"
              />
            </div>
          </div>

          {/* 4 Lessons Accordion/Boxes */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              4 Featured Playlist Lessons
            </h4>

            {/* Lesson 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Lesson 1 (Active)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Lesson Title</Label>
                  <Input
                    value={formData.lesson1Title}
                    onChange={(e) => handleChange('lesson1Title', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status Badge</Label>
                  <Input
                    value={formData.lesson1Status}
                    onChange={(e) => handleChange('lesson1Status', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={formData.lesson1Duration}
                    onChange={(e) => handleChange('lesson1Duration', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Thumbnail URL</Label>
                  <Input
                    value={formData.lesson1Thumb}
                    onChange={(e) => handleChange('lesson1Thumb', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Lesson 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Lesson 2</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Lesson Title</Label>
                  <Input
                    value={formData.lesson2Title}
                    onChange={(e) => handleChange('lesson2Title', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status Badge</Label>
                  <Input
                    value={formData.lesson2Status}
                    onChange={(e) => handleChange('lesson2Status', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={formData.lesson2Duration}
                    onChange={(e) => handleChange('lesson2Duration', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Thumbnail URL</Label>
                  <Input
                    value={formData.lesson2Thumb}
                    onChange={(e) => handleChange('lesson2Thumb', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Lesson 3 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Lesson 3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Lesson Title</Label>
                  <Input
                    value={formData.lesson3Title}
                    onChange={(e) => handleChange('lesson3Title', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status Badge</Label>
                  <Input
                    value={formData.lesson3Status}
                    onChange={(e) => handleChange('lesson3Status', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={formData.lesson3Duration}
                    onChange={(e) => handleChange('lesson3Duration', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Thumbnail URL</Label>
                  <Input
                    value={formData.lesson3Thumb}
                    onChange={(e) => handleChange('lesson3Thumb', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Lesson 4 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Lesson 4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Lesson Title</Label>
                  <Input
                    value={formData.lesson4Title}
                    onChange={(e) => handleChange('lesson4Title', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status Badge</Label>
                  <Input
                    value={formData.lesson4Status}
                    onChange={(e) => handleChange('lesson4Status', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={formData.lesson4Duration}
                    onChange={(e) => handleChange('lesson4Duration', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Thumbnail URL</Label>
                  <Input
                    value={formData.lesson4Thumb}
                    onChange={(e) => handleChange('lesson4Thumb', e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Bottom 4 Features */}
      {activeTab === 'features' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bottom 4 Feature Strips
            </h3>
            <p className="text-xs text-slate-500">
              The 4 highlight cards located below the main cinema video player.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Feature 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <span className="text-xs font-bold text-[#4D7C0F] dark:text-[#A3E635] uppercase">Feature 1</span>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={formData.feat1Title}
                  onChange={(e) => handleChange('feat1Title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={formData.feat1Subtitle}
                  onChange={(e) => handleChange('feat1Subtitle', e.target.value)}
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase">Feature 2</span>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={formData.feat2Title}
                  onChange={(e) => handleChange('feat2Title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={formData.feat2Subtitle}
                  onChange={(e) => handleChange('feat2Subtitle', e.target.value)}
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <span className="text-xs font-bold text-[#B45309] dark:text-[#FBBF24] uppercase">Feature 3</span>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={formData.feat3Title}
                  onChange={(e) => handleChange('feat3Title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={formData.feat3Subtitle}
                  onChange={(e) => handleChange('feat3Subtitle', e.target.value)}
                />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <span className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase">Feature 4</span>
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={formData.feat4Title}
                  onChange={(e) => handleChange('feat4Title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={formData.feat4Subtitle}
                  onChange={(e) => handleChange('feat4Subtitle', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Live Preview with Current Form Settings
            </span>
            <span className="text-xs text-slate-500 font-mono">1:1 Visual Rendering</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <LmsExperienceShowcase initialData={formData} />
          </div>
        </div>
      )}
    </div>
  )
}
