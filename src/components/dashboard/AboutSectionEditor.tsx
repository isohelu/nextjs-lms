'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Save,
  RotateCcw,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  BookOpen,
  Play,
  ShieldCheck,
  Briefcase,
  Users,
  Star,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AboutSectionData,
  DEFAULT_ABOUT_SECTION_DATA,
} from '@/lib/data/about-section'
import AboutPlatform from '@/components/home/AboutPlatform'

const COLOR_PRESETS = [
  { label: 'Warm Ivory (UI Default)', value: '#F5F6EC' },
  { label: 'Pale Cream', value: '#F6F8EB' },
  { label: 'Soft Porcelain', value: '#F8FAFC' },
  { label: 'Muted Mint', value: '#E8F5E9' },
  { label: 'Subtle Lavender', value: '#F3E8FF' },
]

const ACCENT_SHAPE_PRESETS = [
  { label: 'Pastel Lime (UI Default)', value: '#E3F69D' },
  { label: 'Electric Lime', value: '#D8FC38' },
  { label: 'Emerald Glow', value: '#A7F3D0' },
  { label: 'Sky Blue', value: '#BAE6FD' },
  { label: 'Warm Amber', value: '#FDE68A' },
]

const HIGHLIGHT_COLOR_PRESETS = [
  { label: 'Vibrant Green (Default)', value: '#84CC16' },
  { label: 'Electric Lime', value: '#D8FC38' },
  { label: 'Emerald Glow', value: '#10B981' },
  { label: 'Sky Blue', value: '#0EA5E9' },
  { label: 'Amber Gold', value: '#F59E0B' },
]

export default function AboutSectionEditor() {
  const [formData, setFormData] = useState<AboutSectionData>(DEFAULT_ABOUT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'model' | 'features' | 'stats' | 'preview'>('content')

  // Load existing configuration from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/about-section')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_ABOUT_SECTION_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load about section data:', err)
        toast.error('Could not load current settings, loaded defaults instead.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = <K extends keyof AboutSectionData>(
    field: K,
    value: AboutSectionData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: keyof AboutSectionData
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading('Uploading model image...')

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
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const toastId = toast.loading('Saving about platform section settings...')

    try {
      const res = await fetch('/api/admin/about-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('About platform section updated successfully!', { id: toastId })
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
      setFormData(DEFAULT_ABOUT_SECTION_DATA)
      toast.info('Reset to default values. Click Save to persist.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span className="text-sm font-medium">Loading About Section Editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#D8FC38] text-slate-950 shadow-xs font-bold">
              <Layers className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                About Platform Section Editor
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize all text, model visuals, colors, 4 feature cards, and bottom metrics in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs rounded-xl"
            disabled={saving}
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-xs rounded-xl shadow-xs"
          >
            <Save className="size-3.5 mr-1.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: 'content', label: '1. Copy & CTAs', icon: Sparkles },
          { id: 'model', label: '2. Model & Overlays', icon: ImageIcon },
          { id: 'features', label: '3. 4 Feature Cards', icon: BookOpen },
          { id: 'stats', label: '4. Bottom Metrics', icon: BarChart3 },
          { id: 'preview', label: 'Live Visual Preview', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D8FC38] text-slate-950 shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COPY & CTAS                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50">
          {/* Badge & Headlines */}
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Overline Label & Display Headline
            </h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Overline Label Text</Label>
              <Input
                value={formData.badgeText}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="ABOUT THE PLATFORM"
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Headline Line 1</Label>
                <Input
                  value={formData.titleLine1}
                  onChange={(e) => handleChange('titleLine1', e.target.value)}
                  placeholder="A Smarter Way"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Headline Line 2</Label>
                <Input
                  value={formData.titleLine2}
                  onChange={(e) => handleChange('titleLine2', e.target.value)}
                  placeholder="to Learn and"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Highlight Word</Label>
              <Input
                value={formData.highlightWord}
                onChange={(e) => handleChange('highlightWord', e.target.value)}
                placeholder="Grow"
                className="h-10 text-xs font-bold"
              />
            </div>

            {/* Highlight Color Picker */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Highlight Word Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.highlightColor}
                  onChange={(e) => handleChange('highlightColor', e.target.value)}
                  className="size-9 rounded-lg border p-1 cursor-pointer"
                />
                <Input
                  value={formData.highlightColor}
                  onChange={(e) => handleChange('highlightColor', e.target.value)}
                  className="h-9 w-32 font-mono text-xs"
                />
                <div className="flex items-center gap-1">
                  {HIGHLIGHT_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleChange('highlightColor', p.value)}
                      title={p.label}
                      className="size-7 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: p.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description Paragraph</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Our platform gives you practical, industry-relevant learning..."
                className="text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Call to Action Buttons
            </h2>

            {/* Primary Button */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-3">
              <span className="text-xs font-bold text-foreground">Primary Button</span>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Button Text</Label>
                <Input
                  value={formData.primaryBtnText}
                  onChange={(e) => handleChange('primaryBtnText', e.target.value)}
                  placeholder="Explore Curriculum"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Target URL</Label>
                <Input
                  value={formData.primaryBtnUrl}
                  onChange={(e) => handleChange('primaryBtnUrl', e.target.value)}
                  placeholder="/courses"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Secondary Video Button */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-3">
              <span className="text-xs font-bold text-foreground">Secondary Video Button</span>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Button Text</Label>
                <Input
                  value={formData.secondaryBtnText}
                  onChange={(e) => handleChange('secondaryBtnText', e.target.value)}
                  placeholder="Watch Video"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Video / Target URL</Label>
                <Input
                  value={formData.secondaryBtnUrl}
                  onChange={(e) => handleChange('secondaryBtnUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MODEL & CARD OVERLAYS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'model' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50">
          {/* Model Image & Background Settings */}
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              Model Image & Card Background
            </h2>

            {/* Visual Live Preview of Model & Background */}
            <div
              className="relative h-72 rounded-[28px] overflow-hidden flex items-end justify-center border shadow-xs transition-colors"
              style={{ backgroundColor: formData.modelCardBg || '#F5F6EC' }}
            >
              {/* Tilted Lime Accent Shape in Preview */}
              <div
                className="absolute top-[28%] -left-2 w-[220px] h-[260px] rounded-[40px] rotate-[-13deg] pointer-events-none transition-transform"
                style={{ backgroundColor: formData.modelAccentShapeBg || '#E3F69D' }}
                aria-hidden="true"
              />

              {/* Hand-drawn Green Spiral Doodle */}
              <div className="absolute top-3 right-4 w-12 h-auto pointer-events-none z-10 select-none">
                <Image
                  src="/assets/images/about-doodle.png"
                  alt="Decorative Doodle"
                  width={88}
                  height={81}
                  className="w-full h-auto object-contain"
                />
              </div>

              {formData.modelImageUrl ? (
                <div className="relative z-10 w-full h-[94%] flex items-end justify-center">
                  <Image
                    src={formData.modelImageUrl}
                    alt="Model Preview"
                    width={300}
                    height={360}
                    className="h-full w-auto object-contain object-bottom drop-shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-slate-400 pb-12">
                  <ImageIcon className="size-8 mb-1" />
                  <span className="text-xs">No model image selected</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary bg-primary/10 py-2.5 text-xs font-bold text-slate-950 dark:text-lime-300 hover:bg-primary/20 cursor-pointer transition-colors shadow-2xs">
                <Upload className="size-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Transparent PNG Model'}</span>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'modelImageUrl')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image URL</Label>
                <Input
                  value={formData.modelImageUrl}
                  onChange={(e) => handleChange('modelImageUrl', e.target.value)}
                  placeholder="/assets/images/about-platform-model.png"
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image Alt Text</Label>
                <Input
                  value={formData.modelImageAlt}
                  onChange={(e) => handleChange('modelImageAlt', e.target.value)}
                  placeholder="Student learning on platform"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Background Color Picker & Presets */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Card Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.modelCardBg || '#F5F6EC'}
                  onChange={(e) => handleChange('modelCardBg', e.target.value)}
                  className="size-9 rounded-lg border p-1 cursor-pointer"
                />
                <Input
                  value={formData.modelCardBg || '#F5F6EC'}
                  onChange={(e) => handleChange('modelCardBg', e.target.value)}
                  className="h-9 w-32 font-mono text-xs"
                />
                <div className="flex items-center gap-1">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleChange('modelCardBg', p.value)}
                      title={p.label}
                      className="size-7 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: p.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accent Shape Color Picker & Presets */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Tilted Accent Shape Color (Behind Model)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.modelAccentShapeBg || '#E3F69D'}
                  onChange={(e) => handleChange('modelAccentShapeBg', e.target.value)}
                  className="size-9 rounded-lg border p-1 cursor-pointer"
                />
                <Input
                  value={formData.modelAccentShapeBg || '#E3F69D'}
                  onChange={(e) => handleChange('modelAccentShapeBg', e.target.value)}
                  className="h-9 w-32 font-mono text-xs"
                />
                <div className="flex items-center gap-1">
                  {ACCENT_SHAPE_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleChange('modelAccentShapeBg', p.value)}
                      title={p.label}
                      className="size-7 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: p.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Widgets Configuration */}
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <Users className="size-4 text-emerald-600" />
              Floating Badges Overlays
            </h2>

            {/* Floating Widget 1: Experts & Avatars */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-3">
              <span className="text-xs font-bold text-foreground">Top-Left Floating Widget</span>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Widget Title</Label>
                <Input
                  value={formData.floating1Title}
                  onChange={(e) => handleChange('floating1Title', e.target.value)}
                  placeholder="Learn from Experts"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Pill Badge Text</Label>
                <Input
                  value={formData.floating1Badge}
                  onChange={(e) => handleChange('floating1Badge', e.target.value)}
                  placeholder="+12"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Avatar 1</Label>
                  <Input
                    value={formData.floating1Avatar1}
                    onChange={(e) => handleChange('floating1Avatar1', e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Avatar 2</Label>
                  <Input
                    value={formData.floating1Avatar2}
                    onChange={(e) => handleChange('floating1Avatar2', e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Avatar 3</Label>
                  <Input
                    value={formData.floating1Avatar3}
                    onChange={(e) => handleChange('floating1Avatar3', e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Avatar 4</Label>
                  <Input
                    value={formData.floating1Avatar4}
                    onChange={(e) => handleChange('floating1Avatar4', e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Floating Widget 2: Rating */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-3">
              <span className="text-xs font-bold text-foreground">Bottom-Right Rating Widget</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Rating Text</Label>
                  <Input
                    value={formData.floating2Rating}
                    onChange={(e) => handleChange('floating2Rating', e.target.value)}
                    placeholder="4.9 / 5.0"
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Rating Label</Label>
                  <Input
                    value={formData.floating2Label}
                    onChange={(e) => handleChange('floating2Label', e.target.value)}
                    placeholder="Student Rating"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 4 FEATURE CARDS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50">
          {[
            {
              num: 1,
              titleKey: 'card1Title' as const,
              descKey: 'card1Desc' as const,
              urlKey: 'card1Url' as const,
              iconKey: 'card1Icon' as const,
              iconBg: 'bg-lime-100 text-lime-800',
            },
            {
              num: 2,
              titleKey: 'card2Title' as const,
              descKey: 'card2Desc' as const,
              urlKey: 'card2Url' as const,
              iconKey: 'card2Icon' as const,
              iconBg: 'bg-blue-100 text-blue-800',
            },
            {
              num: 3,
              titleKey: 'card3Title' as const,
              descKey: 'card3Desc' as const,
              urlKey: 'card3Url' as const,
              iconKey: 'card3Icon' as const,
              iconBg: 'bg-purple-100 text-purple-800',
            },
            {
              num: 4,
              titleKey: 'card4Title' as const,
              descKey: 'card4Desc' as const,
              urlKey: 'card4Url' as const,
              iconKey: 'card4Icon' as const,
              iconBg: 'bg-amber-100 text-amber-800',
            },
          ].map((c) => (
            <div key={c.num} className="rounded-2xl border bg-card p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Platform Benefit {c.num}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Item {c.num}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title</Label>
                <Input
                  value={formData[c.titleKey]}
                  onChange={(e) => handleChange(c.titleKey, e.target.value)}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                  value={formData[c.descKey]}
                  onChange={(e) => handleChange(c.descKey, e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target URL</Label>
                  <Input
                    value={formData[c.urlKey]}
                    onChange={(e) => handleChange(c.urlKey, e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Icon</Label>
                  <select
                    value={formData[c.iconKey]}
                    onChange={(e) => handleChange(c.iconKey, e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none"
                  >
                    <option value="book">Book (Curriculum)</option>
                    <option value="play">Play (Interactive)</option>
                    <option value="shield">Shield (Credentials)</option>
                    <option value="career">Briefcase (Career)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BOTTOM METRICS BAR                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in-50">
          {[
            { num: 1, valKey: 'stat1Value' as const, lblKey: 'stat1Label' as const },
            { num: 2, valKey: 'stat2Value' as const, lblKey: 'stat2Label' as const },
            { num: 3, valKey: 'stat3Value' as const, lblKey: 'stat3Label' as const },
            { num: 4, valKey: 'stat4Value' as const, lblKey: 'stat4Label' as const },
          ].map((s) => (
            <div key={s.num} className="rounded-2xl border bg-card p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-foreground">Stat / Metric {s.num}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Item {s.num}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Value / Number</Label>
                <Input
                  value={formData[s.valKey]}
                  onChange={(e) => handleChange(s.valKey, e.target.value)}
                  placeholder="120+"
                  className="h-10 text-base font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Label Subtitle</Label>
                <Input
                  value={formData[s.lblKey]}
                  onChange={(e) => handleChange(s.lblKey, e.target.value)}
                  placeholder="Courses & Modules"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LIVE VISUAL PREVIEW                                                */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="rounded-2xl border bg-muted/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Live Component Visual Preview</p>
              <p className="text-xs text-muted-foreground">
                This shows exactly how the section renders on the home page with your current configuration.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-xs rounded-xl shadow-xs"
            >
              <Save className="size-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save Current Settings'}
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-background shadow-md overflow-hidden">
            <AboutPlatform initialData={formData} />
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <div className="fixed bottom-6 right-8 z-50 flex items-center gap-3 bg-slate-950/90 text-white p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md border border-slate-800">
        <span className="text-xs font-medium text-slate-300 hidden sm:inline">
          Ready to publish changes?
        </span>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-xs rounded-xl shadow-xs"
        >
          <Save className="size-3.5 mr-1.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

    </div>
  )
}
