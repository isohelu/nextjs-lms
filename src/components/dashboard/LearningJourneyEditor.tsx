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
  Users,
  Compass,
  Play,
  Award,
  BookOpen,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEFAULT_LEARNING_JOURNEY_DATA, LearningJourneyData } from '@/lib/data/learning-journey'

export default function LearningJourneyEditor() {
  const [formData, setFormData] = useState<LearningJourneyData>(DEFAULT_LEARNING_JOURNEY_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'step1' | 'step2' | 'step3' | 'step4'>('general')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/learning-journey')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({
              ...DEFAULT_LEARNING_JOURNEY_DATA,
              ...json.data,
              steps: [
                { ...DEFAULT_LEARNING_JOURNEY_DATA.steps[0], ...(json.data.steps?.[0] || json.data.step1 || {}) },
                { ...DEFAULT_LEARNING_JOURNEY_DATA.steps[1], ...(json.data.steps?.[1] || json.data.step2 || {}) },
                { ...DEFAULT_LEARNING_JOURNEY_DATA.steps[2], ...(json.data.steps?.[2] || json.data.step3 || {}) },
                { ...DEFAULT_LEARNING_JOURNEY_DATA.steps[3], ...(json.data.steps?.[3] || json.data.step4 || {}) },
              ],
            })
          }
        }
      } catch (err) {
        console.error('Failed to load learning journey data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleGeneralChange = (field: keyof LearningJourneyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (stepIndex: number, field: string, value: any) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps] as [any, any, any, any]
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        [field]: value,
      }
      return { ...prev, steps: newSteps }
    })
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading('Uploading image...')

    try {
      const data = new FormData()
      data.append('file', file)

      const res = await fetch('/api/upload/bunny', {
        method: 'POST',
        body: data,
      })

      const json = await res.json()
      if (json.success && json.url) {
        onUploaded(json.url)
        toast.success('Image uploaded successfully', { id: toastId })
      } else {
        toast.error(json.message || 'Upload failed', { id: toastId })
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Network error during upload', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving Learning Journey settings...')

    try {
      const res = await fetch('/api/admin/learning-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Settings saved successfully! Homepage updated.', { id: toastId })
      } else {
        toast.error(json.message || 'Failed to save settings', { id: toastId })
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save settings', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all Learning Journey fields to default?')) {
      setFormData(DEFAULT_LEARNING_JOURNEY_DATA)
      toast.info('Reset to default values. Click Save to persist.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Learning Journey settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Learning Journey Settings
            </h1>
            <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-[#635BFF]">
              4-Step Roadmap
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize section titles, badges, 4 journey step cards, images, and floating UI layers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 hover:border-red-200 shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>General Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('step1')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'step1'
              ? 'bg-[#635BFF] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Step 01 (Create Account)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('step2')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'step2'
              ? 'bg-[#3B82F6] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Step 02 (Choose Course)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('step3')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'step3'
              ? 'bg-[#FF6B2C] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>Step 03 (Learn at Pace)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('step4')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'step4'
              ? 'bg-[#10B981] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Step 04 (Get Certified)</span>
        </button>
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Section Header &amp; Copy
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Badge Text (Top Pill)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => handleGeneralChange('badge', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Headline Line 1
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleGeneralChange('title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Highlight Text (Gradient line 2)
              </label>
              <input
                type="text"
                value={formData.highlightText}
                onChange={(e) => handleGeneralChange('highlightText', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Section Subtitle
              </label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={(e) => handleGeneralChange('subtitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-purple-600"
              />
            </div>
          </div>

          {/* Quick Header Preview Card */}
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-[#FAF8FF] dark:bg-purple-950/20 p-6 flex flex-col justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">Live Header Preview</span>
            <div className="inline-flex items-center justify-center rounded-full bg-[#ECEBFF] dark:bg-[#231C4D] px-4 py-1 text-xs font-bold uppercase text-[#635BFF] mx-auto mb-3.5 shadow-xs">
              {formData.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#01081F] dark:text-white">
              {formData.title}{' '}
              <span className="text-[#6E59FD] dark:text-[#8B7AFF]">
                {formData.highlightText}
              </span>
            </h2>
            <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {formData.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: STEP 01 */}
      {activeTab === 'step1' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#635BFF] text-white text-xs flex items-center justify-center font-bold">01</span>
              <span>Step 01: Create an Account</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Title
              </label>
              <input
                type="text"
                value={formData.steps[0].title}
                onChange={(e) => handleStepChange(0, 'title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Description
              </label>
              <textarea
                rows={2}
                value={formData.steps[0].description}
                onChange={(e) => handleStepChange(0, 'description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Visual Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.steps[0].studentImage || ''}
                  onChange={(e) => handleStepChange(0, 'studentImage', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <label className="flex items-center gap-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 px-3 py-2 text-xs font-bold text-[#635BFF] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => handleStepChange(0, 'studentImage', url))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Card 1 */}
          <div className="rounded-[32px] border-2 border-[#E5DAFD] bg-gradient-to-b from-[#F7F3FF] via-[#FAF7FF] to-white dark:from-[#130E26] dark:via-[#0F0B1E] dark:to-[#0A0714] p-3 shadow-md flex flex-col justify-between max-w-xs mx-auto w-full h-[420px] relative overflow-hidden">
            <div className="relative w-full h-[290px] flex items-center justify-center">
              <Image src={formData.steps[0].studentImage || '/assets/images/journey-card-1.png'} alt="Preview" fill className="object-contain object-bottom" />
            </div>
            <div className="w-full rounded-[20px] bg-white dark:bg-slate-900 p-3 shadow-xs border border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#060C1E] dark:text-white truncate">{formData.steps[0].title}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2">{formData.steps[0].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEP 02 */}
      {activeTab === 'step2' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#3B82F6] text-white text-xs flex items-center justify-center font-bold">02</span>
              <span>Step 02: Choose a Course</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Title
              </label>
              <input
                type="text"
                value={formData.steps[1].title}
                onChange={(e) => handleStepChange(1, 'title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Description
              </label>
              <textarea
                rows={2}
                value={formData.steps[1].description}
                onChange={(e) => handleStepChange(1, 'description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Visual Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.steps[1].studentImage || ''}
                  onChange={(e) => handleStepChange(1, 'studentImage', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <label className="flex items-center gap-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 px-3 py-2 text-xs font-bold text-[#3B82F6] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => handleStepChange(1, 'studentImage', url))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Card 2 */}
          <div className="rounded-[32px] border-2 border-[#D0E7FC] bg-gradient-to-b from-[#EFF6FF] via-[#F5F9FF] to-white dark:from-[#0C1729] dark:via-[#091220] dark:to-[#060D17] p-3 shadow-md flex flex-col justify-between max-w-xs mx-auto w-full h-[420px] relative overflow-hidden">
            <div className="relative w-full h-[290px] flex items-center justify-center">
              <Image src={formData.steps[1].studentImage || '/assets/images/journey-card-2.png'} alt="Preview" fill className="object-contain object-bottom" />
            </div>
            <div className="w-full rounded-[20px] bg-white dark:bg-slate-900 p-3 shadow-xs border border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#060C1E] dark:text-white truncate">{formData.steps[1].title}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2">{formData.steps[1].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STEP 03 */}
      {activeTab === 'step3' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#FF6B2C] text-white text-xs flex items-center justify-center font-bold">03</span>
              <span>Step 03: Learn at Your Own Pace</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Title
              </label>
              <input
                type="text"
                value={formData.steps[2].title}
                onChange={(e) => handleStepChange(2, 'title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Description
              </label>
              <textarea
                rows={2}
                value={formData.steps[2].description}
                onChange={(e) => handleStepChange(2, 'description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Visual Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.steps[2].studentImage || ''}
                  onChange={(e) => handleStepChange(2, 'studentImage', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <label className="flex items-center gap-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 px-3 py-2 text-xs font-bold text-[#FF6B2C] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => handleStepChange(2, 'studentImage', url))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Card 3 */}
          <div className="rounded-[32px] border-2 border-[#FDD8BE] bg-gradient-to-b from-[#FFF7ED] via-[#FFF9F5] to-white dark:from-[#25150D] dark:via-[#1D100A] dark:to-[#120A06] p-3 shadow-md flex flex-col justify-between max-w-xs mx-auto w-full h-[420px] relative overflow-hidden">
            <div className="relative w-full h-[290px] flex items-center justify-center">
              <Image src={formData.steps[2].studentImage || '/assets/images/journey-card-3.png'} alt="Preview" fill className="object-contain object-bottom" />
            </div>
            <div className="w-full rounded-[20px] bg-white dark:bg-slate-900 p-3 shadow-xs border border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FB923C] to-[#EA580C] text-white shadow-sm">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#060C1E] dark:text-white truncate">{formData.steps[2].title}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2">{formData.steps[2].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STEP 04 */}
      {activeTab === 'step4' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#10B981] text-white text-xs flex items-center justify-center font-bold">04</span>
              <span>Step 04: Get Certified</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Title
              </label>
              <input
                type="text"
                value={formData.steps[3].title}
                onChange={(e) => handleStepChange(3, 'title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Description
              </label>
              <textarea
                rows={2}
                value={formData.steps[3].description}
                onChange={(e) => handleStepChange(3, 'description', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Card Visual Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.steps[3].studentImage || ''}
                  onChange={(e) => handleStepChange(3, 'studentImage', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <label className="flex items-center gap-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 px-3 py-2 text-xs font-bold text-[#10B981] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => handleStepChange(3, 'studentImage', url))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Card 4 */}
          <div className="rounded-[32px] border-2 border-[#C6F5DA] bg-gradient-to-b from-[#ECFDF5] via-[#F5FEFA] to-white dark:from-[#0B2117] dark:via-[#081A12] dark:to-[#05110B] p-3 shadow-md flex flex-col justify-between max-w-xs mx-auto w-full h-[420px] relative overflow-hidden">
            <div className="relative w-full h-[290px] flex items-center justify-center">
              <Image src={formData.steps[3].studentImage || '/assets/images/journey-card-4.png'} alt="Preview" fill className="object-contain object-bottom" />
            </div>
            <div className="w-full rounded-[20px] bg-white dark:bg-slate-900 p-3 shadow-xs border border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#34D399] to-[#059669] text-white shadow-sm">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#060C1E] dark:text-white truncate">{formData.steps[3].title}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2">{formData.steps[3].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
