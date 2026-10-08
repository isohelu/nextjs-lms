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
  Sliders,
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  ExternalLink,
  GraduationCap,
  UserCheck,
  Search,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  LiveSchedulesSectionData,
  LiveEventItem,
  MasterclassScheduleCardItem,
  DEFAULT_LIVE_SCHEDULES_DATA,
} from '@/lib/data/live-schedules-section'
import LiveEventsExams from '@/components/home/LiveEventsExams'

export default function LiveSchedulesEditor() {
  const [formData, setFormData] = useState<LiveSchedulesSectionData>(
    DEFAULT_LIVE_SCHEDULES_DATA
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    'schedules' | 'liveEvents' | 'headers' | 'enrollments' | 'preview'
  >('schedules')

  // Enrollments and Student Assignment state
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [studentsList, setStudentsList] = useState<{ id: number; name: string; email: string }[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [assignmentNote, setAssignmentNote] = useState<string>('')
  const [assigning, setAssigning] = useState<boolean>(false)
  const [enrollmentSearch, setEnrollmentSearch] = useState<string>('')
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(false)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/live-schedules')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setFormData({ ...DEFAULT_LIVE_SCHEDULES_DATA, ...json.data })
          }
        }
      } catch (err) {
        console.error('Failed to load live schedules settings:', err)
        toast.error('Could not load current settings; loaded defaults instead.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = <K extends keyof LiveSchedulesSectionData>(
    field: K,
    value: LiveSchedulesSectionData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // --- SCHEDULES (SECTION 2) HANDLERS ---
  const handleScheduleChange = (
    index: number,
    field: keyof MasterclassScheduleCardItem,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = [...prev.schedules]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, schedules: updated }
    })
  }

  const handleAddSchedule = () => {
    const newSchedule: MasterclassScheduleCardItem = {
      id: `mc-${Date.now()}`,
      title: 'New Masterclass / Exam Title',
      description: 'Comprehensive hands-on curriculum with real scenarios and certification.',
      category: 'masterclass',
      categoryLabel: 'Masterclass',
      dateDay: '15',
      dateMonth: 'Nov',
      dateWeekday: 'Wed',
      time: '6:00 PM EST',
      rating: 4.9,
      reviewsCount: 85,
      studentsCount: 140,
      instructorName: 'Sarah Jenkins',
      instructorAvatar: '/assets/avatars/avatar-2.png',
      thumbnail: '/assets/images/students-1.jpg',
      duration: '24 hrs',
      level: 'All Levels',
      slug: `masterclass-${Date.now()}`,
      badgeVariant: 'emerald',
      seatsLeft: 20,
      price: 0,
      liveRoomUrl: 'https://meet.google.com/abc-demo-room',
    }

    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }))
    toast.success('New schedule card added!')
  }

  const handleDeleteSchedule = (index: number) => {
    if (formData.schedules.length <= 1) {
      toast.error('You must keep at least 1 schedule card.')
      return
    }
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }))
    toast.success('Schedule card removed.')
  }

  const handleMoveSchedule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.schedules.length) return

    setFormData((prev) => {
      const updated = [...prev.schedules]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, schedules: updated }
    })
  }

  // --- LIVE EVENTS (SECTION 1) HANDLERS ---
  const handleLiveEventChange = (
    index: number,
    field: keyof LiveEventItem,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = [...prev.liveEvents]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, liveEvents: updated }
    })
  }

  const handleAddLiveEvent = () => {
    const newEvent: LiveEventItem = {
      id: `evt-${Date.now()}`,
      title: 'New Live Workshop or Lab',
      category: 'masterclass',
      categoryLabel: 'Live Masterclass',
      date: '28',
      day: 'Saturday',
      month: 'NOV',
      time: '7:00 PM EST',
      instructor: 'Marcus Chen',
      instructorRole: 'Principal Architect',
      avatar: '/assets/avatars/avatar-3.png',
      thumbnail: '/assets/images/students-3.jpg',
      targetHours: 24,
      targetMinutes: 0,
      targetSeconds: 0,
      seatsLeft: 15,
      isLiveNow: false,
      slug: `live-event-${Date.now()}`,
      liveRoomUrl: 'https://meet.google.com/live-room',
    }

    setFormData((prev) => ({
      ...prev,
      liveEvents: [...prev.liveEvents, newEvent],
    }))
    toast.success('New live event card added!')
  }

  const handleDeleteLiveEvent = (index: number) => {
    if (formData.liveEvents.length <= 1) {
      toast.error('You must keep at least 1 live event card.')
      return
    }
    setFormData((prev) => ({
      ...prev,
      liveEvents: prev.liveEvents.filter((_, i) => i !== index),
    }))
    toast.success('Live event card removed.')
  }

  const handleMoveLiveEvent = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.liveEvents.length) return

    setFormData((prev) => {
      const updated = [...prev.liveEvents]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, liveEvents: updated }
    })
  }

  // --- GENERAL IMAGE UPLOAD HANDLER ---
  const handleGenericImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetIdentifier: string,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingTarget(targetIdentifier)
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
        const uploadedUrl =
          json.url || json.data?.url || (json.files && json.files[0]?.url)
        if (uploadedUrl) {
          callback(uploadedUrl)
          toast.success('Image uploaded successfully!', { id: toastId })
        } else {
          toast.error(json.message || 'Image uploaded but no URL returned', {
            id: toastId,
          })
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || 'Failed to upload image', { id: toastId })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed', { id: toastId })
    } finally {
      setUploadingTarget(null)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading('Saving live schedules configuration...')

    try {
      const res = await fetch('/api/admin/live-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(
          json.message || 'Live masterclasses & schedules updated successfully!',
          { id: toastId }
        )
      } else {
        toast.error(json.message || 'Failed to save settings', { id: toastId })
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Network error occurred while saving.', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all live events and masterclass schedules to default template settings?'
      )
    ) {
      setFormData(DEFAULT_LIVE_SCHEDULES_DATA)
      toast.info('Settings reset to default. Click Save to persist.')
    }
  }

  // Load enrollments and student list from database
  const loadEnrollments = async () => {
    setLoadingEnrollments(true)
    try {
      const res = await fetch('/api/admin/live-schedules/enrollments')
      const data = await res.json()
      if (res.ok && data.success) {
        setEnrollments(data.enrollments || [])
        setStudentsList(data.students || [])
      }
    } catch (err) {
      console.error('Failed to load enrollments:', err)
      toast.error('Could not load student enrollments.')
    } finally {
      setLoadingEnrollments(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'enrollments') {
      loadEnrollments()
    }
  }, [activeTab])

  // Assign a student to a live class or exam (Membership / Enrolled Grant)
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedSessionId) {
      toast.error('Please select both a student and a session.')
      return
    }

    let itemType = 'schedule'
    let itemTitle = ''
    const matchedEvt = formData.liveEvents.find((e) => e.id === selectedSessionId)
    if (matchedEvt) {
      itemType = 'event'
      itemTitle = matchedEvt.title
    } else {
      const matchedSch = formData.schedules.find((s) => s.id === selectedSessionId)
      if (matchedSch) {
        itemType = 'schedule'
        itemTitle = matchedSch.title
      }
    }

    setAssigning(true)
    try {
      const res = await fetch('/api/admin/live-schedules/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(selectedStudentId),
          itemId: selectedSessionId,
          itemType,
          itemTitle,
          note: assignmentNote.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message || 'Student enrolled successfully!')
        setSelectedStudentId('')
        setAssignmentNote('')
        loadEnrollments()
      } else {
        toast.error(data.message || 'Failed to assign student')
      }
    } catch (err) {
      toast.error('Network error assigning student')
    } finally {
      setAssigning(false)
    }
  }

  // Revoke enrollment and release seat
  const handleRevokeEnrollment = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this student enrollment?')) return

    try {
      const res = await fetch(`/api/admin/live-schedules/enrollments?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message || 'Enrollment revoked')
        loadEnrollments()
      } else {
        toast.error(data.message || 'Failed to revoke enrollment')
      }
    } catch (err) {
      toast.error('Failed to revoke enrollment')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white" />
          <span>Loading live schedules settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-slate-900 dark:text-[#D8FC38]" />
            Live Masterclasses & Exam Schedules
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete administrative control over countdown events, upcoming cohorts, live room links, and student seat limits.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-initial gap-2 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial gap-2 bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Upcoming Masterclasses ({formData.schedules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('liveEvents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'liveEvents'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Live Countdown Events ({formData.liveEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'headers'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Section Headers & Sidebar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enrollments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'enrollments'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Student Access & Enrollments ({enrollments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-[#D8FC38] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* TAB 1: UPCOMING MASTERCLASSES (SECTION 2) */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming Masterclass & Exam Cards
              </h3>
              <p className="text-xs text-slate-500">
                These cards render in the 3-column right grid of Section 2 with real-time seat reservation.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddSchedule}
              size="sm"
              className="gap-1.5 bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold"
            >
              <Plus className="h-4 w-4" />
              <span>Add Schedule Card</span>
            </Button>
          </div>

          <div className="space-y-6">
            {formData.schedules.map((sch, index) => (
              <div
                key={sch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all space-y-5"
              >
                {/* Card Title Bar with Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1">
                      {sch.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMoveSchedule(index, 'up')}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === formData.schedules.length - 1}
                      onClick={() => handleMoveSchedule(index, 'down')}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSchedule(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Title</Label>
                    <Input
                      value={sch.title}
                      onChange={(e) =>
                        handleScheduleChange(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Production Next.js 15 Masterclass"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">URL Slug</Label>
                    <Input
                      value={sch.slug}
                      onChange={(e) =>
                        handleScheduleChange(index, 'slug', e.target.value)
                      }
                      placeholder="e.g. nextjs-masterclass"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-xs font-semibold">Description</Label>
                    <Textarea
                      rows={2}
                      value={sch.description}
                      onChange={(e) =>
                        handleScheduleChange(index, 'description', e.target.value)
                      }
                      placeholder="Short summary of what students will accomplish"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category Filter</Label>
                    <select
                      value={sch.category}
                      onChange={(e) =>
                        handleScheduleChange(index, 'category', e.target.value)
                      }
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="masterclass">Masterclass</option>
                      <option value="certification">Certification</option>
                      <option value="workshop">Workshop</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>

                  {/* Category Label */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Display Badge Label</Label>
                    <Input
                      value={sch.categoryLabel}
                      onChange={(e) =>
                        handleScheduleChange(index, 'categoryLabel', e.target.value)
                      }
                      placeholder="e.g. Masterclass, Certification"
                    />
                  </div>

                  {/* Badge Variant Color */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Badge Color Theme</Label>
                    <select
                      value={sch.badgeVariant}
                      onChange={(e) =>
                        handleScheduleChange(index, 'badgeVariant', e.target.value)
                      }
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="emerald">Electric Lime / Emerald</option>
                      <option value="blue">Blue</option>
                      <option value="orange">Orange</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>

                  {/* Date Badge: Day, Month, Weekday */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date Day (Number)</Label>
                    <Input
                      value={sch.dateDay}
                      onChange={(e) =>
                        handleScheduleChange(index, 'dateDay', e.target.value)
                      }
                      placeholder="e.g. 28"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date Month</Label>
                    <Input
                      value={sch.dateMonth}
                      onChange={(e) =>
                        handleScheduleChange(index, 'dateMonth', e.target.value)
                      }
                      placeholder="e.g. Oct"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date Weekday</Label>
                    <Input
                      value={sch.dateWeekday}
                      onChange={(e) =>
                        handleScheduleChange(index, 'dateWeekday', e.target.value)
                      }
                      placeholder="e.g. Tue"
                    />
                  </div>

                  {/* Time, Duration, Level */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Time</Label>
                    <Input
                      value={sch.time}
                      onChange={(e) =>
                        handleScheduleChange(index, 'time', e.target.value)
                      }
                      placeholder="e.g. 7:00 PM EST"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Duration</Label>
                    <Input
                      value={sch.duration}
                      onChange={(e) =>
                        handleScheduleChange(index, 'duration', e.target.value)
                      }
                      placeholder="e.g. 28 hrs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Level</Label>
                    <Input
                      value={sch.level}
                      onChange={(e) =>
                        handleScheduleChange(index, 'level', e.target.value)
                      }
                      placeholder="e.g. Advanced, Intermediate"
                    />
                  </div>

                  {/* Seats Left, Price, Live Room URL */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Seats Available</Label>
                    <Input
                      type="number"
                      value={sch.seatsLeft}
                      onChange={(e) =>
                        handleScheduleChange(index, 'seatsLeft', Number(e.target.value))
                      }
                      placeholder="e.g. 18"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Price ($ USD, 0 = Free)</Label>
                    <Input
                      type="number"
                      value={sch.price}
                      onChange={(e) =>
                        handleScheduleChange(index, 'price', Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Live Classroom / Meeting URL</Label>
                    <Input
                      value={sch.liveRoomUrl || ''}
                      onChange={(e) =>
                        handleScheduleChange(index, 'liveRoomUrl', e.target.value)
                      }
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  {/* Rating, Reviews, Students */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Rating (1-5)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={sch.rating}
                      onChange={(e) =>
                        handleScheduleChange(index, 'rating', Number(e.target.value))
                      }
                      placeholder="4.8"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Reviews Count</Label>
                    <Input
                      type="number"
                      value={sch.reviewsCount}
                      onChange={(e) =>
                        handleScheduleChange(index, 'reviewsCount', Number(e.target.value))
                      }
                      placeholder="124"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Enrolled Students</Label>
                    <Input
                      type="number"
                      value={sch.studentsCount}
                      onChange={(e) =>
                        handleScheduleChange(index, 'studentsCount', Number(e.target.value))
                      }
                      placeholder="180"
                    />
                  </div>

                  {/* Instructor Name & Avatar Upload */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Instructor Name</Label>
                    <Input
                      value={sch.instructorName}
                      onChange={(e) =>
                        handleScheduleChange(index, 'instructorName', e.target.value)
                      }
                      placeholder="e.g. Alexander Wright"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Instructor Avatar</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                        <Image
                          src={sch.instructorAvatar}
                          alt={sch.instructorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <label className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGenericImageUpload(
                              e,
                              `sch-avatar-${index}`,
                              (url) => handleScheduleChange(index, 'instructorAvatar', url)
                            )
                          }
                        />
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100">
                          <Upload className="h-3.5 w-3.5" />
                          <span>
                            {uploadingTarget === `sch-avatar-${index}`
                              ? 'Uploading...'
                              : 'Upload Avatar'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Card Thumbnail Upload */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Card Thumbnail Image</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative h-10 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                        <Image
                          src={sch.thumbnail}
                          alt={sch.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <label className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGenericImageUpload(
                              e,
                              `sch-thumb-${index}`,
                              (url) => handleScheduleChange(index, 'thumbnail', url)
                            )
                          }
                        />
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100">
                          <Upload className="h-3.5 w-3.5" />
                          <span>
                            {uploadingTarget === `sch-thumb-${index}`
                              ? 'Uploading...'
                              : 'Upload Image'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE COUNTDOWN EVENTS (SECTION 1) */}
      {activeTab === 'liveEvents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Countdown Events (Section 1)
              </h3>
              <p className="text-xs text-slate-500">
                Top cards featuring live timers, instructor roles, and direct instant classroom access.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddLiveEvent}
              size="sm"
              className="gap-1.5 bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold"
            >
              <Plus className="h-4 w-4" />
              <span>Add Live Event</span>
            </Button>
          </div>

          <div className="space-y-6">
            {formData.liveEvents.map((evt, index) => (
              <div
                key={evt.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all space-y-5"
              >
                {/* Title Bar with Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1">
                      {evt.title}
                    </h4>
                    {evt.isLiveNow && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMoveLiveEvent(index, 'up')}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === formData.liveEvents.length - 1}
                      onClick={() => handleMoveLiveEvent(index, 'down')}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLiveEvent(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Event Title</Label>
                    <Input
                      value={evt.title}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Next.js 15 Live Lab"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">URL Slug</Label>
                    <Input
                      value={evt.slug}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'slug', e.target.value)
                      }
                      placeholder="e.g. nextjs-live-lab"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category</Label>
                    <select
                      value={evt.category}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'category', e.target.value)
                      }
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden"
                    >
                      <option value="masterclass">Live Masterclass</option>
                      <option value="exam">Accredited Exam</option>
                      <option value="workshop">Live Workshop</option>
                    </select>
                  </div>

                  {/* Category Label */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Display Badge Label</Label>
                    <Input
                      value={evt.categoryLabel}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'categoryLabel', e.target.value)
                      }
                      placeholder="e.g. Live Masterclass"
                    />
                  </div>

                  {/* Live Status Toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Broadcasting Status</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id={`live-toggle-${index}`}
                        checked={!!evt.isLiveNow}
                        onChange={(e) =>
                          handleLiveEventChange(index, 'isLiveNow', e.target.checked)
                        }
                        className="h-4 w-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <label
                        htmlFor={`live-toggle-${index}`}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        Active Live Stream (Live Now)
                      </label>
                    </div>
                  </div>

                  {/* Date, Month, Day, Time */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date Day (e.g. 19)</Label>
                    <Input
                      value={evt.date}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'date', e.target.value)
                      }
                      placeholder="19"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Month (e.g. OCT)</Label>
                    <Input
                      value={evt.month}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'month', e.target.value)
                      }
                      placeholder="OCT"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Day (e.g. Sunday)</Label>
                    <Input
                      value={evt.day}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'day', e.target.value)
                      }
                      placeholder="Sunday"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Time (e.g. 8:00 PM EST)</Label>
                    <Input
                      value={evt.time}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'time', e.target.value)
                      }
                      placeholder="8:00 PM EST"
                    />
                  </div>

                  {/* Target Timer: Hours, Minutes, Seconds */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Countdown Hours</Label>
                    <Input
                      type="number"
                      value={evt.targetHours}
                      onChange={(e) =>
                        handleLiveEventChange(
                          index,
                          'targetHours',
                          Number(e.target.value)
                        )
                      }
                      placeholder="7"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Countdown Minutes</Label>
                    <Input
                      type="number"
                      value={evt.targetMinutes}
                      onChange={(e) =>
                        handleLiveEventChange(
                          index,
                          'targetMinutes',
                          Number(e.target.value)
                        )
                      }
                      placeholder="40"
                    />
                  </div>

                  {/* Seats Left, Price & Live Room URL */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Seats Remaining</Label>
                    <Input
                      type="number"
                      value={evt.seatsLeft}
                      onChange={(e) =>
                        handleLiveEventChange(
                          index,
                          'seatsLeft',
                          Number(e.target.value)
                        )
                      }
                      placeholder="14"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Price ($ USD, 0 = Free)</Label>
                    <Input
                      type="number"
                      value={evt.price || 0}
                      onChange={(e) =>
                        handleLiveEventChange(
                          index,
                          'price',
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Live Room / Google Meet URL</Label>
                    <Input
                      value={evt.liveRoomUrl || ''}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'liveRoomUrl', e.target.value)
                      }
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  {/* Instructor Details */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Speaker / Instructor Name</Label>
                    <Input
                      value={evt.instructor}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'instructor', e.target.value)
                      }
                      placeholder="David Miller"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Instructor Role / Title</Label>
                    <Input
                      value={evt.instructorRole}
                      onChange={(e) =>
                        handleLiveEventChange(index, 'instructorRole', e.target.value)
                      }
                      placeholder="Staff Frontend Engineer"
                    />
                  </div>

                  {/* Instructor Avatar Upload */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Speaker Avatar</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                        <Image
                          src={evt.avatar}
                          alt={evt.instructor}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <label className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGenericImageUpload(
                              e,
                              `evt-avatar-${index}`,
                              (url) => handleLiveEventChange(index, 'avatar', url)
                            )
                          }
                        />
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100">
                          <Upload className="h-3.5 w-3.5" />
                          <span>
                            {uploadingTarget === `evt-avatar-${index}`
                              ? 'Uploading...'
                              : 'Upload Avatar'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Event Thumbnail Upload */}
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-xs font-semibold">Event Background Thumbnail</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                        <Image
                          src={evt.thumbnail}
                          alt={evt.title}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <label className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGenericImageUpload(
                              e,
                              `evt-thumb-${index}`,
                              (url) => handleLiveEventChange(index, 'thumbnail', url)
                            )
                          }
                        />
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-medium cursor-pointer hover:bg-slate-100 max-w-sm">
                          <Upload className="h-4 w-4" />
                          <span>
                            {uploadingTarget === `evt-thumb-${index}`
                              ? 'Uploading...'
                              : 'Upload High-Res Thumbnail'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECTION HEADERS & SIDEBAR */}
      {activeTab === 'headers' && (
        <div className="space-y-8">
          {/* Section 1 Header settings */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D8FC38]" />
              Section 1 (Live Sessions & Accredited Exams) Header
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Section Badge</Label>
                <Input
                  value={formData.sec1Badge}
                  onChange={(e) => handleChange('sec1Badge', e.target.value)}
                  placeholder="Live Sessions & Accredited Exams"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Main Heading Title</Label>
                <Input
                  value={formData.sec1Title}
                  onChange={(e) => handleChange('sec1Title', e.target.value)}
                  placeholder="Events & Accredited Exams For You"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Subheading Description</Label>
                <Textarea
                  rows={2}
                  value={formData.sec1Description}
                  onChange={(e) => handleChange('sec1Description', e.target.value)}
                  placeholder="Join live instructor-led workshops..."
                />
              </div>
            </div>
          </div>

          {/* Section 2 Header & Sidebar settings */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D8FC38]" />
              Section 2 (Upcoming Masterclasses) Header & Sidebar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Top Pill Badge</Label>
                <Input
                  value={formData.sec2Badge}
                  onChange={(e) => handleChange('sec2Badge', e.target.value)}
                  placeholder="Upcoming Schedules"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title Line 1</Label>
                <Input
                  value={formData.sec2TitleLine1}
                  onChange={(e) => handleChange('sec2TitleLine1', e.target.value)}
                  placeholder="Upcoming"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title Line 2 (Highlighted)</Label>
                <Input
                  value={formData.sec2TitleLine2}
                  onChange={(e) => handleChange('sec2TitleLine2', e.target.value)}
                  placeholder="Masterclasses &"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title Line 3</Label>
                <Input
                  value={formData.sec2TitleLine3}
                  onChange={(e) => handleChange('sec2TitleLine3', e.target.value)}
                  placeholder="Exam Schedules"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Button Text</Label>
                <Input
                  value={formData.sec2ButtonText}
                  onChange={(e) => handleChange('sec2ButtonText', e.target.value)}
                  placeholder="View All Schedules"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Button URL Link</Label>
                <Input
                  value={formData.sec2ButtonUrl}
                  onChange={(e) => handleChange('sec2ButtonUrl', e.target.value)}
                  placeholder="/schedules"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <Label className="text-xs font-semibold">Sidebar Description</Label>
                <Textarea
                  rows={2}
                  value={formData.sec2Description}
                  onChange={(e) => handleChange('sec2Description', e.target.value)}
                  placeholder="Reserve your seat early for upcoming accredited assessments..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STUDENT ACCESS & ENROLLMENTS */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Grant Access Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#D8FC38]" />
                  Grant Student Membership / Course Enrollment Access
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign any registered student to a live masterclass or scheduled exam without charging them. They will immediately receive access to the live classroom link and calendar invitations.
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">1. Select Registered Student *</Label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value) || '')}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden"
                >
                  <option value="">-- Choose Student --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">2. Select Live Class / Masterclass *</Label>
                <select
                  required
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-hidden"
                >
                  <option value="">-- Choose Class / Schedule --</option>
                  <optgroup label="Upcoming Masterclasses (Section 2)">
                    {formData.schedules.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.title} ({sch.dateMonth} {sch.dateDay} - {sch.categoryLabel})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Live Countdown Events (Section 1)">
                    {formData.liveEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.month} {evt.date} - {evt.categoryLabel})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">3. Access Note / Reason (Optional)</Label>
                <Input
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="e.g. Pro Membership Grant / Course Enrolled"
                />
              </div>

              <div className="md:col-span-3 pt-1">
                <Button
                  type="submit"
                  disabled={assigning}
                  className="w-full sm:w-auto gap-2 bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Grant Enrolled Access (No Payment Required)</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Active Enrollments Table Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-slate-900 dark:text-[#D8FC38]" />
                  Active Student Enrollments & Passes ({enrollments.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time list of all students who have confirmed access to live classes.
                </p>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  placeholder="Search student or class..."
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            {loadingEnrollments ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Loading enrollments data...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <GraduationCap className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>No student enrollments found yet. Students who reserve or are assigned will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 rounded-l-lg">Student</th>
                      <th className="py-3 px-3">Class / Exam</th>
                      <th className="py-3 px-3">Access Type</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Enrolled At</th>
                      <th className="py-3 px-3 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrollments
                      .filter((item) => {
                        if (!enrollmentSearch.trim()) return true
                        const term = enrollmentSearch.toLowerCase()
                        return (
                          item.student_name?.toLowerCase().includes(term) ||
                          item.student_email?.toLowerCase().includes(term) ||
                          item.item_title?.toLowerCase().includes(term)
                        )
                      })
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {row.student_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {row.student_email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">
                              {row.item_title || row.item_id}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {row.item_type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {row.access_type === 'admin_assigned' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[11px] font-bold">
                                🎓 Membership Grant
                              </span>
                            ) : row.access_type === 'paid' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                                💳 Paid Purchase
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-bold">
                                🎟️ Free Reserved
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {row.amount_paid > 0 ? `$${row.amount_paid}` : 'Free ($0)'}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(row.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeEnrollment(row.id)}
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              <span>Revoke</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <strong>Interactive Preview:</strong> Test filters, hover cards, seat reservations, and timer triggers.
            </span>
            <span className="text-[11px] opacity-75">Changes render in real time</span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
            <LiveEventsExams initialData={formData} />
          </div>
        </div>
      )}
    </div>
  )
}
