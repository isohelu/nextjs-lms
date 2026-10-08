'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import Combobox, { ComboboxItem } from '@/components/combobox'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Editor } from '@/components/rich-editor'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  BookText,
  CircleDollarSign,
  FilePenLine,
  FlaskConical,
  FolderInput,
  Settings,
  TvMinimalPlay,
  Play,
  Eye,
  Plus,
  Trash2,
  Video,
  FileText,
  Clock,
  Calendar,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  MoreVertical,
  Pencil,
  ArrowDownUp,
  FolderOpen,
  ListOrdered,
  BadgeCheck,
  ShieldAlert,
  XCircle,
  Send,
  Download,
  BookOpen,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Users,
  ExternalLink,
} from 'lucide-react'

interface Lesson {
  id: number
  title: string
  sort: number
  lesson_type?: string
  lesson_provider?: string | null
  lesson_src?: string | null
  duration?: string | null
  is_free?: number | boolean
  summary?: string | null
  description?: string | null
  course_section_id: number
  resources?: any[]
}

interface Quiz {
  id: number
  title: string
  course_section_id: number
  total_marks?: number
  total_mark?: number
  pass_mark?: number
  hours?: number
  minutes?: number
  seconds?: number
  retake?: number
  summary?: string | null
}

interface Section {
  id: number
  title: string
  sort: number
  course_id: number
  section_lessons?: Lesson[]
  lessons?: Lesson[]
  section_quizzes?: Quiz[]
  quizzes?: Quiz[]
}

interface LiveClass {
  id: number
  class_topic: string
  provider: string
  class_date_and_time: string
  class_note?: string
  additional_info?: string
}

interface FaqItem {
  id: number
  question: string
  answer: string
}

interface RequirementItem {
  id: number
  requirement: string
}

interface OutcomeItem {
  id: number
  outcome: string
}

interface CourseData {
  id: number
  title: string
  slug: string
  status?: string
  level?: string
  course_type?: string
  language?: string
  instructor_id?: number | string
  course_category_id?: number | string
  course_category_child_id?: number | string | null
  pricing_type?: 'paid' | 'free'
  price?: number | string
  discount?: boolean | number
  discount_price?: number | string
  expiry_type?: string
  expiry_duration?: string
  drip_content?: boolean | number
  short_description?: string
  description?: string
  thumbnail?: string
  banner?: string
  preview?: string
  preview_type?: string
  meta_title?: string
  meta_keywords?: string
  meta_description?: string
  og_title?: string
  og_description?: string
  sections?: Section[]
  faqs?: FaqItem[]
  requirements?: RequirementItem[]
  outcomes?: OutcomeItem[]
}

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

const STATUS_CONFIG: Record<string, { bg: string; dot: string; ping: string }> = {
  approved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
  },
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
  },
  rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20',
    dot: 'bg-rose-500',
    ping: 'bg-rose-400',
  },
  draft: {
    bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 hover:bg-slate-100 dark:hover:bg-slate-500/20',
    dot: 'bg-slate-500',
    ping: 'bg-slate-400',
  },
  upcoming: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20',
    dot: 'bg-blue-500',
    ping: 'bg-blue-400',
  },
}

interface Props {
  initialCourseId?: number
  initialTab?: string
}

export default function CourseUpdateManager({ initialCourseId, initialTab = 'curriculum' }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState<CourseData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [instructors, setInstructors] = useState<ComboboxItem[]>([])
  const [categories, setCategories] = useState<{ id: number; title: string }[]>([])
  const [categoryItems, setCategoryItems] = useState<ComboboxItem[]>([])
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])

  // Approval dialog modal state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  // Status modal
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('approved')
  const [statusFeedback, setStatusFeedback] = useState('')

  // Resource Modal state
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [resourceModalLesson, setResourceModalLesson] = useState<Lesson | null>(null)
  const [resourceTab, setResourceTab] = useState<'list' | 'add'>('list')
  const [lessonResources, setLessonResources] = useState<any[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceType, setResourceType] = useState('document')
  const [resourceUrl, setResourceUrl] = useState('')
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null)
  const [savingResource, setSavingResource] = useState(false)

  // Sort Sections Modal state
  const [sortSectionsModalOpen, setSortSectionsModalOpen] = useState(false)
  const [sortedSectionsList, setSortedSectionsList] = useState<Section[]>([])
  const [savingSectionsSort, setSavingSectionsSort] = useState(false)

  // Sort Lessons Modal state
  const [sortLessonsModalOpen, setSortLessonsModalOpen] = useState(false)
  const [sortedLessonsList, setSortedLessonsList] = useState<Lesson[]>([])
  const [activeSectionForSort, setActiveSectionForSort] = useState<Section | null>(null)
  const [savingLessonsSort, setSavingLessonsSort] = useState(false)

  // Quiz Questions Modal state
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false)
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<Quiz | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questionsTab, setQuestionsTab] = useState<'list' | 'add'>('list')
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionType, setNewQuestionType] = useState('single_choice')
  const [newQuestionOptions, setNewQuestionOptions] = useState('')
  const [newQuestionAnswer, setNewQuestionAnswer] = useState('')
  const [savingQuestion, setSavingQuestion] = useState(false)

  // Section Dialog states
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editSectionDialogOpen, setEditSectionDialogOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [editSectionTitle, setEditSectionTitle] = useState('')

  // Lesson Dialog states
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)
  const [addLessonStep, setAddLessonStep] = useState<'type' | 'form'>('type')
  const [lessonForm, setLessonForm] = useState({
    title: '',
    lesson_type: 'video_url',
    lesson_provider: 'youtube',
    lesson_src: '',
    duration: '',
    is_free: false,
    summary: '',
    description: '',
  })

  // Quiz Dialog states
  const [quizDialogOpen, setQuizDialogOpen] = useState(false)
  const [editQuizDialogOpen, setEditQuizDialogOpen] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [quizForm, setQuizForm] = useState({
    title: '',
    hours: 0,
    minutes: 30,
    seconds: 0,
    total_marks: 100,
    pass_mark: 50,
    retake: 1,
    summary: '',
  })

  // Live Class Dialog states
  const [liveClassDialogOpen, setLiveClassDialogOpen] = useState(false)
  const [editingLiveClassId, setEditingLiveClassId] = useState<number | null>(null)
  const [liveClassForm, setLiveClassForm] = useState({
    class_topic: '',
    provider: 'Zoom',
    class_date_and_time: '',
    class_note: '',
    additional_info: '',
  })

  // Info items states (FAQs, Requirements, Outcomes)
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [requirements, setRequirements] = useState<RequirementItem[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([])
  const [infoSubTab, setInfoSubTab] = useState<'faqs' | 'requirements' | 'outcomes'>('faqs')

  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [editFaqDialogOpen, setEditFaqDialogOpen] = useState(false)
  const [activeEditFaq, setActiveEditFaq] = useState<FaqItem | null>(null)
  const [faqQ, setFaqQ] = useState('')
  const [faqA, setFaqA] = useState('')
  const [editFaqQ, setEditFaqQ] = useState('')
  const [editFaqA, setEditFaqA] = useState('')

  const [reqDialogOpen, setReqDialogOpen] = useState(false)
  const [editReqDialogOpen, setEditReqDialogOpen] = useState(false)
  const [activeEditReq, setActiveEditReq] = useState<RequirementItem | null>(null)
  const [reqText, setReqText] = useState('')
  const [editReqText, setEditReqText] = useState('')

  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false)
  const [editOutcomeDialogOpen, setEditOutcomeDialogOpen] = useState(false)
  const [activeEditOutcome, setActiveEditOutcome] = useState<OutcomeItem | null>(null)
  const [outcomeText, setOutcomeText] = useState('')
  const [editOutcomeText, setEditOutcomeText] = useState('')

  // Thumbnail & Banner upload states
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // Dynamic real-time calculated approval status (updates instantly on any edit)
  const approvalStatus = useMemo(() => {
    const sections = course?.sections || []
    const sectionsCount = sections.length
    const lessonsCount = sections.reduce(
      (acc, s) => acc + (s.lessons?.length || s.section_lessons?.length || 0),
      0
    )
    const quizzesCount = sections.reduce(
      (acc, s) => acc + (s.quizzes?.length || s.section_quizzes?.length || 0),
      0
    )
    const totalContent = sectionsCount + lessonsCount

    const hasThumbnail = Boolean(course?.thumbnail && String(course.thumbnail).trim() !== '')
    const hasMinSections = sectionsCount >= 1
    const hasMinLessons = lessonsCount >= 1
    const hasMinContent = totalContent >= 2
    const hasOutcomes = Boolean(outcomes && outcomes.length > 0)
    const hasRequirements = Boolean(requirements && requirements.length > 0)

    const isReadyForApproval = Boolean(
      hasThumbnail &&
      hasMinSections &&
      hasMinLessons &&
      hasMinContent &&
      hasOutcomes &&
      hasRequirements
    )

    const validationMessages: string[] = []
    if (!hasThumbnail) {
      validationMessages.push('Course thumbnail is missing')
    }
    if (!hasMinSections) {
      validationMessages.push('Course needs at least 1 section')
    }
    if (!hasMinLessons) {
      validationMessages.push('Course needs at least 1 lesson')
    }
    if (!hasMinContent) {
      validationMessages.push('Course needs at least 2 content items (sections + section_lessons)')
    }
    if (!hasOutcomes) {
      validationMessages.push('Course outcomes are missing')
    }
    if (!hasRequirements) {
      validationMessages.push('Course requirements are missing')
    }

    return {
      approve_able: isReadyForApproval,
      counts: {
        sections_count: sectionsCount,
        lessons_count: lessonsCount,
        quizzes_count: quizzesCount,
        total_content_count: totalContent,
      },
      has_requirements: {
        thumbnail: hasThumbnail,
        min_sections: hasMinSections,
        min_lessons: hasMinLessons,
        min_content: hasMinContent,
        outcomes: hasOutcomes,
        requirements: hasRequirements,
      },
      validation_messages: validationMessages,
    }
  }, [course?.thumbnail, course?.sections, outcomes, requirements])

  // Fetch course
  const fetchCourse = async (id: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/courses/${id}`)
      const json = await res.json()
      if (json.success && json.course) {
        setCourse({
          ...json.course,
          discount: Boolean(json.course.discount),
          pricing_type: json.course.pricing_type || 'paid',
          sections: json.course.sections || [],
          preview_type: json.course.preview_type || 'video_url',
          instructor_id: json.course.instructor_id,
          course_category_id: json.course.course_category_id,
          course_category_child_id: json.course.course_category_child_id,
          short_description: json.course.short_description || '',
          description: json.course.description || '',
          expiry_type: json.course.expiry_type || 'lifetime',
          expiry_duration: json.course.expiry_duration || '',
        })
        setSelectedStatus(json.course.status || 'approved')
        if (json.course.live_classes) setLiveClasses(json.course.live_classes)
        if (json.course.faqs) setFaqs(json.course.faqs)
        if (json.course.requirements) setRequirements(json.course.requirements)
        if (json.course.outcomes) setOutcomes(json.course.outcomes)
      } else {
        toast.error('Could not load course data.')
      }
    } catch {
      toast.error('Network error loading course.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (slug: string) => {
    setActiveTab(slug)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', slug)
      window.history.replaceState(null, '', url.toString())
    } catch {}
  }

  const handleSubmitForApproval = async () => {
    if (!course) return
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Course submitted for approval!')
        fetchCourse(course.id)
      } else {
        toast.error(data.message || 'Failed to submit course for approval')
      }
    } catch {
      toast.error('Network error submitting course')
    }
  }

  // Resource handlers
  const openResourceModal = async (lesson: Lesson) => {
    setResourceModalLesson(lesson)
    setResourceTab('list')
    setEditingResourceId(null)
    setResourceTitle('')
    setResourceType('document')
    setResourceUrl('')
    setResourceModalOpen(true)
    setLoadingResources(true)
    try {
      const res = await fetch(`/api/lesson-resources?lessonId=${lesson.id}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.resources)) {
        setLessonResources(data.resources)
      } else {
        setLessonResources(lesson.resources || [])
      }
    } catch {
      setLessonResources(lesson.resources || [])
    } finally {
      setLoadingResources(false)
    }
  }

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceModalLesson) return
    setSavingResource(true)
    try {
      if (editingResourceId) {
        const res = await fetch(`/api/lesson-resources/${editingResourceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: resourceTitle,
            type: resourceType,
            resource: resourceUrl,
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Resource updated successfully')
          setEditingResourceId(null)
          openResourceModal(resourceModalLesson)
        } else {
          toast.error(data.message || 'Failed to update resource')
        }
      } else {
        const res = await fetch('/api/lesson-resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: resourceTitle,
            type: resourceType,
            resource: resourceUrl,
            section_lesson_id: resourceModalLesson.id,
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Resource added successfully')
          setResourceTitle('')
          setResourceUrl('')
          setResourceType('document')
          setResourceTab('list')
          openResourceModal(resourceModalLesson)
        } else {
          toast.error(data.message || 'Failed to add resource')
        }
      }
    } catch {
      toast.error('Network error saving resource')
    } finally {
      setSavingResource(false)
    }
  }

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    try {
      const res = await fetch(`/api/lesson-resources/${resourceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Resource deleted successfully')
        if (resourceModalLesson) openResourceModal(resourceModalLesson)
      } else {
        toast.error(data.message || 'Failed to delete resource')
      }
    } catch {
      toast.error('Network error deleting resource')
    }
  }

  // Sort Sections handlers
  const openSortSectionsModal = () => {
    if (course?.sections) {
      setSortedSectionsList([...course.sections])
      setSortSectionsModalOpen(true)
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedSectionsList.length) return
    const updated = [...sortedSectionsList]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setSortedSectionsList(updated)
  }

  const handleSaveSectionsSort = async () => {
    if (!course) return
    setSavingSectionsSort(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/sections/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sortedData: sortedSectionsList.map((s, idx) => ({ id: s.id, sort: idx + 1 })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Sections reordered successfully')
        setSortSectionsModalOpen(false)
        fetchCourse(course.id)
      } else {
        toast.error(data.message || 'Failed to reorder sections')
      }
    } catch {
      toast.error('Network error reordering sections')
    } finally {
      setSavingSectionsSort(false)
    }
  }

  // Sort Lessons handlers
  const openSortLessonsModal = (section: Section) => {
    const lessons = section.section_lessons || section.lessons || []
    setActiveSectionForSort(section)
    setSortedLessonsList([...lessons])
    setSortLessonsModalOpen(true)
  }

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedLessonsList.length) return
    const updated = [...sortedLessonsList]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setSortedLessonsList(updated)
  }

  const handleSaveLessonsSort = async () => {
    if (!course) return
    setSavingLessonsSort(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/lessons/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sortedData: sortedLessonsList.map((l, idx) => ({ id: l.id, sort: idx + 1 })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lessons reordered successfully')
        setSortLessonsModalOpen(false)
        fetchCourse(course.id)
      } else {
        toast.error(data.message || 'Failed to reorder lessons')
      }
    } catch {
      toast.error('Network error reordering lessons')
    } finally {
      setSavingLessonsSort(false)
    }
  }

  // Quiz Questions handlers
  const openQuestionsModal = async (quiz: Quiz) => {
    if (!course) return
    setActiveQuizForQuestions(quiz)
    setQuestionsTab('list')
    setNewQuestionTitle('')
    setNewQuestionType('single_choice')
    setNewQuestionOptions('')
    setNewQuestionAnswer('')
    setQuestionsModalOpen(true)
    setLoadingQuestions(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/quizzes/${quiz.id}/questions`)
      const data = await res.json()
      if (data.success && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions)
      } else {
        setQuizQuestions([])
      }
    } catch {
      setQuizQuestions([])
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course || !activeQuizForQuestions) return
    setSavingQuestion(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/quizzes/${activeQuizForQuestions.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuestionTitle,
          type: newQuestionType,
          options: newQuestionOptions,
          answer: newQuestionAnswer,
          sort: quizQuestions.length + 1,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Question added successfully')
        setNewQuestionTitle('')
        setNewQuestionOptions('')
        setNewQuestionAnswer('')
        setQuestionsTab('list')
        openQuestionsModal(activeQuizForQuestions)
      } else {
        toast.error(data.message || 'Failed to add question')
      }
    } catch {
      toast.error('Network error adding question')
    } finally {
      setSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!course || !activeQuizForQuestions) return
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch(
        `/api/instructor/courses/${course.id}/quizzes/${activeQuizForQuestions.id}/questions/${questionId}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (data.success) {
        toast.success('Question deleted successfully')
        openQuestionsModal(activeQuizForQuestions)
      } else {
        toast.error(data.message || 'Failed to delete question')
      }
    } catch {
      toast.error('Network error deleting question')
    }
  }

  useEffect(() => {
    // 1. Current user
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setCurrentUser(data.user)
          if (data.user.role === 'admin') {
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
          }
        }
      })
      .catch(() => {})

    // 2. Categories with hierarchy
    fetch('/api/course-categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data)
          const transformed: ComboboxItem[] = data.flatMap((c: any) => {
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
          setCategoryItems(transformed)
        }
      })
      .catch(() => {})
  }, [])

  const getSelectedCategoryValue = () => {
    if (course?.course_category_child_id) {
      return `child-${course.course_category_child_id}`
    }
    return course?.course_category_id ? String(course.course_category_id) : ''
  }

  useEffect(() => {
    if (initialCourseId) {
      fetchCourse(initialCourseId)
    } else {
      setLoading(false)
    }
  }, [initialCourseId])

  // Save full course updates
  const handleSaveCourse = async (tabName: string) => {
    if (!course?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          faqs,
          requirements,
          outcomes,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`${tabName} updated successfully!`)
        if (json.course) {
          setCourse((prev) => ({ ...prev, ...json.course }))
        }
      } else {
        toast.error(json.message || 'Failed to update course.')
      }
    } catch {
      toast.error('Error saving course changes.')
    } finally {
      setSaving(false)
    }
  }

  // Update Status
  const handleUpdateStatus = async () => {
    if (!course?.id) return
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, feedback: statusFeedback }),
      })
      if (res.ok) {
        setCourse((prev) => (prev ? { ...prev, status: selectedStatus } : null))
        toast.success(`Course status updated to ${selectedStatus}`)
        setStatusDialogOpen(false)
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !course?.id) return
    setUploadingThumbnail(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_id', String(course.id))
      formData.append('collection_name', 'thumbnail')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        const updateRes = await fetch(`/api/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnail: json.url }),
        })
        const updateJson = await updateRes.json()
        if (updateJson.course) {
          setCourse((prev) => (prev ? { ...prev, ...updateJson.course } : null))
        } else {
          setCourse((prev) => (prev ? { ...prev, thumbnail: json.url } : null))
        }
        toast.success('Thumbnail uploaded successfully')
      } else {
        toast.error('Failed to upload thumbnail')
      }
    } catch {
      toast.error('Error uploading thumbnail')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  // Banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !course?.id) return
    setUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_id', String(course.id))
      formData.append('collection_name', 'banner')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        const updateRes = await fetch(`/api/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ banner: json.url }),
        })
        const updateJson = await updateRes.json()
        if (updateJson.course) {
          setCourse((prev) => (prev ? { ...prev, ...updateJson.course } : null))
        } else {
          setCourse((prev) => (prev ? { ...prev, banner: json.url } : null))
        }
        toast.success('Banner uploaded successfully')
      } else {
        toast.error('Failed to upload banner')
      }
    } catch {
      toast.error('Error uploading banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  // Sections
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionTitle.trim() || !course?.id) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSectionTitle }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Section created!')
        setNewSectionTitle('')
        setSectionDialogOpen(false)
        fetchCourse(course.id)
      } else {
        toast.error(json.message || 'Failed to create section.')
      }
    } catch {
      toast.error('Error creating section.')
    }
  }

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSection || !editSectionTitle.trim() || !course?.id) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/sections/${activeSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editSectionTitle }),
      })
      if (res.ok) {
        toast.success('Section updated!')
        setEditSectionDialogOpen(false)
        fetchCourse(course.id)
      }
    } catch {
      toast.error('Failed to update section')
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (!course?.id || !confirm('Are you sure you want to delete this section and all its contents?')) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/sections/${sectionId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Section removed.')
        fetchCourse(course.id)
      } else {
        toast.error('Failed to delete section.')
      }
    } catch {
      toast.error('Error deleting section.')
    }
  }

  // Lessons
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSectionId || !lessonForm.title.trim() || !course?.id) return
    setSavingLesson(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_section_id: activeSectionId,
          section_id: activeSectionId,
          title: lessonForm.title,
          lesson_type: lessonForm.lesson_type,
          lesson_provider: lessonForm.lesson_provider,
          lesson_src: lessonForm.lesson_src,
          duration: lessonForm.duration,
          is_free: lessonForm.is_free ? 1 : 0,
          summary: lessonForm.summary,
          description: lessonForm.summary || lessonForm.description,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Lesson added!')
        setLessonDialogOpen(false)
        setLessonForm({
          title: '',
          lesson_type: 'video_url',
          lesson_provider: 'youtube',
          lesson_src: '',
          duration: '',
          is_free: false,
          summary: '',
          description: '',
        })
        setAddLessonStep('type')
        fetchCourse(course.id)
      } else {
        const errorMsg = json.message || (json.errors ? Object.values(json.errors).flat()[0] : null) || 'Failed to add lesson.'
        toast.error(String(errorMsg))
      }
    } catch {
      toast.error('Error adding lesson.')
    } finally {
      setSavingLesson(false)
    }
  }

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLesson || !lessonForm.title.trim() || !course?.id) return
    setSavingLesson(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/lessons/${activeLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonForm.title,
          lesson_type: lessonForm.lesson_type,
          lesson_provider: lessonForm.lesson_provider,
          lesson_src: lessonForm.lesson_src,
          duration: lessonForm.duration,
          is_free: lessonForm.is_free ? 1 : 0,
          summary: lessonForm.summary,
          description: lessonForm.summary || lessonForm.description,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Lesson updated!')
        setEditLessonDialogOpen(false)
        fetchCourse(course.id)
      } else {
        const errorMsg = json.message || (json.errors ? Object.values(json.errors).flat()[0] : null) || 'Failed to update lesson.'
        toast.error(String(errorMsg))
      }
    } catch {
      toast.error('Failed to update lesson')
    } finally {
      setSavingLesson(false)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!course?.id || !confirm('Are you sure you want to delete this lesson?')) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/lessons/${lessonId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Lesson deleted.')
        fetchCourse(course.id)
      } else {
        toast.error('Failed to delete lesson.')
      }
    } catch {
      toast.error('Error deleting lesson.')
    }
  }

  // Quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSectionId || !quizForm.title.trim() || !course?.id) return
    setSavingQuiz(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_section_id: activeSectionId,
          section_id: activeSectionId,
          title: quizForm.title,
          hours: quizForm.hours,
          minutes: quizForm.minutes,
          seconds: quizForm.seconds,
          total_marks: quizForm.total_marks,
          pass_mark: quizForm.pass_mark,
          retake: quizForm.retake,
          summary: quizForm.summary,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Quiz added!')
        setQuizDialogOpen(false)
        setQuizForm({
          title: '',
          hours: 0,
          minutes: 30,
          seconds: 0,
          total_marks: 100,
          pass_mark: 50,
          retake: 1,
          summary: '',
        })
        fetchCourse(course.id)
      } else {
        const errorMsg = json.message || (json.errors ? Object.values(json.errors).flat()[0] : null) || 'Failed to add quiz.'
        toast.error(String(errorMsg))
      }
    } catch {
      toast.error('Error adding quiz')
    } finally {
      setSavingQuiz(false)
    }
  }

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeQuiz || !quizForm.title.trim() || !course?.id) return
    setSavingQuiz(true)
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/quizzes/${activeQuiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizForm.title,
          hours: quizForm.hours,
          minutes: quizForm.minutes,
          seconds: quizForm.seconds,
          total_marks: quizForm.total_marks,
          pass_mark: quizForm.pass_mark,
          retake: quizForm.retake,
          summary: quizForm.summary,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Quiz updated!')
        setEditQuizDialogOpen(false)
        fetchCourse(course.id)
      } else {
        const errorMsg = json.message || 'Failed to update quiz.'
        toast.error(String(errorMsg))
      }
    } catch {
      toast.error('Error updating quiz.')
    } finally {
      setSavingQuiz(false)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!course?.id || !confirm('Are you sure you want to delete this quiz?')) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/quizzes/${quizId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Quiz deleted.')
        fetchCourse(course.id)
      } else {
        toast.error('Failed to delete quiz.')
      }
    } catch {
      toast.error('Error deleting quiz.')
    }
  }

  // Live Class
  const handleScheduleLiveClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course?.id || !liveClassForm.class_topic || !liveClassForm.class_date_and_time) return
    try {
      const url = editingLiveClassId
        ? `/api/instructor/courses/${course.id}/live-classes/${editingLiveClassId}`
        : `/api/instructor/courses/${course.id}/live-classes`
      const method = editingLiveClassId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liveClassForm),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(editingLiveClassId ? 'Live class updated!' : 'Live class scheduled!')
        setLiveClassDialogOpen(false)
        setEditingLiveClassId(null)
        setLiveClassForm({
          class_topic: '',
          provider: 'Zoom',
          class_date_and_time: '',
          class_note: '',
          additional_info: '',
        })
        fetchCourse(course.id)
      } else {
        toast.error(json.message || 'Failed to save class.')
      }
    } catch {
      toast.error('Error saving live class.')
    }
  }

  const handleDeleteLiveClass = async (liveClassId: number) => {
    if (!course?.id || !confirm('Are you sure you want to delete this live class?')) return
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}/live-classes/${liveClassId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Live class deleted.')
        fetchCourse(course.id)
      } else {
        toast.error('Failed to delete live class.')
      }
    } catch {
      toast.error('Error deleting live class.')
    }
  }

  // Info: FAQs
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!faqQ.trim() || !faqA.trim()) return
    const newItem: FaqItem = { id: Date.now(), question: faqQ.trim(), answer: faqA.trim() }
    const updated = [...faqs, newItem]
    setFaqs(updated)
    setFaqQ('')
    setFaqA('')
    setFaqDialogOpen(false)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs: updated }),
      }).catch(() => {})
    }
    toast.success('FAQ added!')
  }

  const handleDeleteFaq = async (id: number) => {
    const updated = faqs.filter((f) => f.id !== id)
    setFaqs(updated)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs: updated }),
      }).catch(() => {})
    }
    toast.success('FAQ removed.')
  }

  // Info: Requirements
  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqText.trim()) return
    const newItem: RequirementItem = { id: Date.now(), requirement: reqText.trim() }
    const updated = [...requirements, newItem]
    setRequirements(updated)
    setReqText('')
    setReqDialogOpen(false)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updated }),
      }).catch(() => {})
    }
    toast.success('Requirement added!')
  }

  const handleDeleteRequirement = async (id: number) => {
    const updated = requirements.filter((r) => r.id !== id)
    setRequirements(updated)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updated }),
      }).catch(() => {})
    }
    toast.success('Requirement removed.')
  }

  // Info: Outcomes
  const handleAddOutcome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!outcomeText.trim()) return
    const newItem: OutcomeItem = { id: Date.now(), outcome: outcomeText.trim() }
    const updated = [...outcomes, newItem]
    setOutcomes(updated)
    setOutcomeText('')
    setOutcomeDialogOpen(false)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomes: updated }),
      }).catch(() => {})
    }
    toast.success('Outcome added!')
  }

  const handleDeleteOutcome = async (id: number) => {
    const updated = outcomes.filter((o) => o.id !== id)
    setOutcomes(updated)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomes: updated }),
      }).catch(() => {})
    }
    toast.success('Outcome removed.')
  }

  // Update FAQ
  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEditFaq || !editFaqQ.trim() || !editFaqA.trim()) return
    const updated = faqs.map((f) => (f.id === activeEditFaq.id ? { ...f, question: editFaqQ.trim(), answer: editFaqA.trim() } : f))
    setFaqs(updated)
    setEditFaqDialogOpen(false)
    setActiveEditFaq(null)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs: updated }),
      }).catch(() => {})
    }
    toast.success('FAQ updated!')
  }

  // Update Requirement
  const handleUpdateRequirement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEditReq || !editReqText.trim()) return
    const updated = requirements.map((r) => (r.id === activeEditReq.id ? { ...r, requirement: editReqText.trim() } : r))
    setRequirements(updated)
    setEditReqDialogOpen(false)
    setActiveEditReq(null)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: updated }),
      }).catch(() => {})
    }
    toast.success('Requirement updated!')
  }

  // Update Outcome
  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEditOutcome || !editOutcomeText.trim()) return
    const updated = outcomes.map((o) => (o.id === activeEditOutcome.id ? { ...o, outcome: editOutcomeText.trim() } : o))
    setOutcomes(updated)
    setEditOutcomeDialogOpen(false)
    setActiveEditOutcome(null)
    if (course?.id) {
      fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomes: updated }),
      }).catch(() => {})
    }
    toast.success('Outcome updated!')
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading Course Manager...</span>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <p className="mt-2 text-muted-foreground">The requested course could not be retrieved.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const isPublished = course.status === 'approved' || course.status === 'published'

  const tabs = [
    { name: 'Curriculum', slug: 'curriculum', Icon: FilePenLine },
    { name: 'Live Class', slug: 'live-class', Icon: TvMinimalPlay },
    { name: 'Basic', slug: 'basic', Icon: Settings },
    { name: 'Pricing', slug: 'pricing', Icon: CircleDollarSign },
    { name: 'Info', slug: 'info', Icon: BookText },
    { name: 'Media', slug: 'media', Icon: FolderInput },
    { name: 'SEO', slug: 'seo', Icon: FlaskConical },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumbs with Action Header matching Screenshot 1 */}
      <Breadcrumbs
        title="Manage Course Contents"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Courses', href: '/dashboard/courses' },
          { title: course.title || 'Course' },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Player Button matching Laravel course-update-header.tsx */}
            {approvalStatus.approve_able ? (
              <Button asChild className="bg-[#71717a] text-white hover:bg-[#52525b] gap-1.5 h-9 px-4 rounded-md">
                <Link href={`/watch/${course.slug || course.id}`}>
                  <Play className="mr-1.5 h-4 w-4 fill-current" />
                  Player
                </Link>
              </Button>
            ) : (
              <Button disabled variant="secondary" className="gap-1.5 h-9 px-4 rounded-md opacity-60 cursor-not-allowed">
                <Play className="mr-1.5 h-4 w-4" />
                Player
              </Button>
            )}

            {/* Preview Button (White Outline) */}
            <Button asChild variant="outline" className="gap-1.5 h-9 px-4 bg-background rounded-md">
              <Link href={`/courses/${course.slug || course.id}`} target="_blank">
                <Eye className="mr-1.5 h-4 w-4" />
                Preview
              </Link>
            </Button>

            {/* Status Pill Badge matching Laravel STATUS_CONFIG */}
            {currentUser?.role !== 'instructor' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusDialogOpen(true)}
                className={cn(
                  'border px-3 py-1.5 text-xs font-semibold capitalize shadow-xs transition-all gap-1.5 h-9 rounded-md',
                  STATUS_CONFIG[course.status || 'draft']?.bg || STATUS_CONFIG.draft.bg
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                      STATUS_CONFIG[course.status || 'draft']?.ping || STATUS_CONFIG.draft.ping
                    )}
                  />
                  <span
                    className={cn(
                      'relative inline-flex h-2 w-2 rounded-full',
                      STATUS_CONFIG[course.status || 'draft']?.dot || STATUS_CONFIG.draft.dot
                    )}
                  />
                </span>
                {course.status || 'draft'}
                <ChevronDown className="ml-0.5 h-3.5 w-3.5 opacity-60" />
              </Button>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize select-none',
                  STATUS_CONFIG[course.status || 'draft']?.bg || STATUS_CONFIG.draft.bg
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'relative inline-flex h-2 w-2 rounded-full',
                      STATUS_CONFIG[course.status || 'draft']?.dot || STATUS_CONFIG.draft.dot
                    )}
                  />
                </span>
                {course.status || 'draft'}
              </span>
            )}

            {/* Submit for Approval Button matching Screenshots 1 & 2 (Instructor Only) */}
            {currentUser?.role === 'instructor' && (
              approvalStatus.approve_able ? (
                course.status !== 'approved' && course.status !== 'pending' && (
                  <Button
                    onClick={handleSubmitForApproval}
                    className="h-9 px-4 gap-1.5"
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    Submit for Approval
                  </Button>
                )
              ) : (
                course.status !== 'approved' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApprovalDialogOpen(true)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/20 h-9 px-4 gap-1.5 rounded-md font-medium"
                  >
                    <AlertTriangle className="mr-1.5 h-4 w-4" />
                    Submit for Approval
                  </Button>
                )
              )
            )}

            {/* Admin Status Update Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="sm:max-w-125">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    Update Approval Status
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Change the status of this course and provide optional feedback.
                  </p>
                </DialogHeader>
                <div className="space-y-4 pt-3">
                  <div>
                    <Label className="text-sm font-semibold">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full capitalize mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved" className="capitalize">Approved (Published)</SelectItem>
                        <SelectItem value="draft" className="capitalize">Draft</SelectItem>
                        <SelectItem value="pending" className="capitalize">Pending Review</SelectItem>
                        <SelectItem value="rejected" className="capitalize">Rejected</SelectItem>
                        <SelectItem value="upcoming" className="capitalize">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Feedback (Optional)</Label>
                    <Textarea
                      rows={4}
                      placeholder="Enter review feedback notes..."
                      value={statusFeedback}
                      onChange={(e) => setStatusFeedback(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateStatus}>Update Status</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Course Approval Checklist Dialog (Screenshot 1 & 3) */}
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
              <DialogContent className="sm:max-w-125">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    Course Approval Status
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Review the current status and checklist items required for submission.
                  </p>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="mb-1 text-sm leading-none font-semibold">Course Needs Attention</h4>
                      <p className="text-xs text-destructive/90">
                        Please resolve the requirements below before submitting the course.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Pending Requirements
                    </h4>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {approvalStatus.validation_messages && approvalStatus.validation_messages.length > 0 ? (
                        approvalStatus.validation_messages.map((message: string, index: number) => {
                          const msgLower = message.toLowerCase()
                          let targetTab: string | null = null
                          let targetSubTab: 'faqs' | 'requirements' | 'outcomes' | null = null
                          let label = ''

                          if (msgLower.includes('thumbnail')) {
                            targetTab = 'media'
                            label = 'Media'
                          } else if (msgLower.includes('outcome')) {
                            targetTab = 'info'
                            targetSubTab = 'outcomes'
                            label = 'Outcomes'
                          } else if (msgLower.includes('requirement')) {
                            targetTab = 'info'
                            targetSubTab = 'requirements'
                            label = 'Requirements'
                          } else if (msgLower.includes('faq')) {
                            targetTab = 'info'
                            targetSubTab = 'faqs'
                            label = 'FAQs'
                          } else if (msgLower.includes('section') || msgLower.includes('lesson') || msgLower.includes('content')) {
                            targetTab = 'curriculum'
                            label = 'Curriculum'
                          }

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (targetTab) {
                                  setApprovalDialogOpen(false)
                                  handleTabChange(targetTab)
                                  if (targetSubTab) {
                                    setInfoSubTab(targetSubTab)
                                  }
                                }
                              }}
                              className={cn(
                                'flex items-center justify-between gap-2.5 rounded-lg border bg-card p-3 text-sm text-foreground shadow-xs transition-all',
                                targetTab && 'cursor-pointer hover:bg-muted/60 hover:border-primary/50'
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                <span className="leading-snug">{message}</span>
                              </div>
                              {targetTab && (
                                <span className="text-xs font-semibold text-primary capitalize flex items-center gap-1 shrink-0 ml-2">
                                  {label || targetTab} &rarr;
                                </span>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm text-muted-foreground shadow-xs">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>All baseline requirements met.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Course Content Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 rounded-xl border bg-muted/10 p-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Sections</p>
                          <p className="text-base font-bold">{approvalStatus.counts?.sections_count || course.sections?.length || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border bg-muted/10 p-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Lessons</p>
                          <p className="text-base font-bold">{approvalStatus.counts?.lessons_count || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border bg-muted/10 p-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Quizzes</p>
                          <p className="text-base font-bold">{approvalStatus.counts?.quizzes_count || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <div className="rounded-lg bg-primary/20 p-2 text-primary">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-primary/80">Total Content Items</p>
                          <p className="text-base font-extrabold text-primary">
                            {approvalStatus.counts?.total_content_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
        className="mb-4"
      />

      {/* Main Grid: Left Nav Sidebar Card (1 col) + Right Content (3 cols) */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        {/* Left Navigation Card matching Laravel .horizontal-tabs-list */}
        <div className="col-span-full md:col-span-1">
          <TabsList className="horizontal-tabs-list space-y-1 w-full grid! h-auto!">
            {tabs.map(({ name, slug, Icon }) => (
              <TabsTrigger
                key={slug}
                value={slug}
                className="horizontal-tabs-trigger w-full"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right Content Panel */}
        <div className="col-span-full md:col-span-3 space-y-6">
          {/* TAB 1: CURRICULUM (Screenshot 1 1:1 Parity) */}
          <TabsContent value="curriculum" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6">
              {/* Top actions matching Screenshot 1: Add Section (bg-muted), Sort Section (bg-muted) */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  className="bg-muted hover:bg-muted-foreground/10 text-foreground font-medium text-sm px-4 py-2 rounded-md"
                  onClick={() => setSectionDialogOpen(true)}
                >
                  Add Section
                </Button>
                <Button
                  variant="ghost"
                  className="bg-muted hover:bg-muted-foreground/10 text-foreground font-medium text-sm px-4 py-2 rounded-md cursor-pointer"
                  onClick={openSortSectionsModal}
                >
                  Sort Section
                </Button>
              </div>

              <Separator className="my-5" />

              {/* Add Section Dialog */}
              <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Course Section</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSection} className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="sec-title">Section Title *</Label>
                      <Input
                        id="sec-title"
                        placeholder="e.g. 1. Introduction"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setSectionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Section</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Edit Section Dialog */}
              <Dialog open={editSectionDialogOpen} onOpenChange={setEditSectionDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Section Title</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateSection} className="space-y-4 pt-2">
                    <div>
                      <Label>Section Title *</Label>
                      <Input
                        value={editSectionTitle}
                        onChange={(e) => setEditSectionTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditSectionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Update Section</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Sections Accordion */}
              {(!course.sections || course.sections.length === 0) ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="font-medium">No sections found in this course.</p>
                  <p className="text-xs">Click &quot;Add Section&quot; above to get started.</p>
                </div>
              ) : (
                <Accordion
                  defaultValue={course.sections.map((s) => `sec-${s.id}`)}
                  className="space-y-4"
                >
                  {course.sections.map((section, idx) => {
                    const lessons = section.section_lessons || section.lessons || []
                    const quizzes = section.section_quizzes || section.quizzes || []

                    return (
                      <AccordionItem
                        key={section.id}
                        value={`sec-${section.id}`}
                        className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-none"
                      >
                        {/* Section Header: AccordionTrigger and Popover Menu separated to avoid nested button */}
                        <div className="flex w-full items-center justify-between px-4 py-1 hover:bg-muted/40 transition-colors">
                          <AccordionTrigger className="flex-1 py-2 text-base font-medium hover:no-underline text-foreground">
                            <span>
                              {idx + 1}. {section.title}
                            </span>
                          </AccordionTrigger>

                          {/* Section Menu Popover matching Screenshot 1 */}
                          <div className="ml-3 shrink-0">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="bg-muted px-2.5 py-1 text-sm font-medium hover:bg-muted-foreground/10 flex items-center gap-1 rounded-md cursor-pointer"
                                >
                                  <span>Section Menu</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="flex w-40 flex-col space-y-1 p-2">
                                <Button
                                  variant="ghost"
                                  className="h-8 w-full justify-start bg-muted hover:bg-muted-foreground/10 text-xs gap-2 font-normal has-[svg]:px-2! rounded-md"
                                  onClick={() => {
                                    setActiveSectionId(section.id)
                                    setAddLessonStep('type')
                                    setLessonForm({
                                      title: '',
                                      lesson_type: 'video_url',
                                      lesson_provider: 'youtube',
                                      lesson_src: '',
                                      duration: '',
                                      is_free: false,
                                      summary: '',
                                      description: '',
                                    })
                                    setLessonDialogOpen(true)
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Add Lesson</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-full justify-start bg-muted hover:bg-muted-foreground/10 text-xs gap-2 font-normal has-[svg]:px-2! rounded-md"
                                  onClick={() => openSortLessonsModal(section)}
                                >
                                  <ArrowDownUp className="h-3.5 w-3.5" />
                                  <span>Sort Lessons</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-full justify-start bg-muted hover:bg-muted-foreground/10 text-xs gap-2 font-normal has-[svg]:px-2! rounded-md"
                                  onClick={() => {
                                    setActiveSectionId(section.id)
                                    setQuizForm({
                                      title: '',
                                      hours: 0,
                                      minutes: 30,
                                      seconds: 0,
                                      total_marks: 100,
                                      pass_mark: 50,
                                      retake: 1,
                                      summary: '',
                                    })
                                    setQuizDialogOpen(true)
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Add Quiz</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-full justify-start bg-muted hover:bg-muted-foreground/10 text-xs gap-2 font-normal has-[svg]:px-2! rounded-md"
                                  onClick={() => {
                                    setActiveSection(section)
                                    setEditSectionTitle(section.title)
                                    setEditSectionDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span>Update Section</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-full justify-start bg-red-50 text-destructive hover:bg-red-100 hover:text-destructive dark:bg-destructive/15 text-xs gap-2 font-normal has-[svg]:px-2! rounded-md"
                                  onClick={() => handleDeleteSection(section.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Section</span>
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Lesson / Quiz items inside section matching Screenshot 1 */}
                        <AccordionContent className="space-y-3 p-4 bg-background border-t">
                          {lessons.length === 0 && quizzes.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                              No lessons found in this section.
                            </div>
                          ) : null}

                          {/* Lessons Cards */}
                          {lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="group flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 shadow-xs hover:border-border/80 transition-colors"
                            >
                              <p className="text-sm font-medium text-foreground">{lesson.title}</p>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-36 p-1 space-y-1">
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal"
                                    onClick={() => openResourceModal(lesson)}
                                  >
                                    <FolderOpen className="h-3.5 w-3.5" />
                                    <span>Resource</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal"
                                    onClick={() => {
                                      setActiveLesson(lesson)
                                      const isUrl = lesson.lesson_provider === 'youtube' || lesson.lesson_provider === 'vimeo' || lesson.lesson_src?.includes('youtu') || lesson.lesson_src?.includes('vimeo')
                                      setLessonForm({
                                        title: lesson.title,
                                        lesson_type: isUrl ? 'video_url' : (lesson.lesson_type || 'video'),
                                        lesson_provider: lesson.lesson_provider || (lesson.lesson_src?.includes('vimeo') ? 'vimeo' : 'youtube'),
                                        lesson_src: lesson.lesson_src || '',
                                        duration: lesson.duration || '',
                                        is_free: Boolean(lesson.is_free),
                                        summary: lesson.summary || lesson.description || '',
                                        description: lesson.description || '',
                                      })
                                      setEditLessonDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>Update Lesson</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete Lesson</span>
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          ))}

                          {/* Quizzes Cards */}
                          {quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="group flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 shadow-xs hover:border-border/80 transition-colors"
                            >
                              <p className="text-sm font-medium text-foreground">{quiz.title}</p>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-36 p-1 space-y-1">
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal"
                                    onClick={() => openQuestionsModal(quiz)}
                                  >
                                    <ListOrdered className="h-3.5 w-3.5" />
                                    <span>Questions</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal"
                                    onClick={() => {
                                      setActiveQuiz(quiz)
                                      setQuizForm({
                                        title: quiz.title,
                                        hours: quiz.hours || 0,
                                        minutes: quiz.minutes || 30,
                                        seconds: quiz.seconds || 0,
                                        total_marks: quiz.total_marks || quiz.total_mark || 100,
                                        pass_mark: quiz.pass_mark || 50,
                                        retake: quiz.retake || 1,
                                        summary: quiz.summary || '',
                                      })
                                      setEditQuizDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>Update Quiz</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start text-xs gap-2 font-normal text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete Quiz</span>
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </Card>

            {/* Resource Modal for Lesson matching Laravel ResourceModal */}
            <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
              <DialogContent className="sm:max-w-137.5 p-0">
                <ScrollArea className="max-h-[90vh] p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      Lesson Resources - {resourceModalLesson?.title}
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs value={resourceTab} onValueChange={(v) => setResourceTab(v as 'list' | 'add')}>
                    <TabsList className="h-10 w-full mb-4">
                      <TabsTrigger value="list" className="h-8 w-full cursor-pointer">
                        Resource List
                      </TabsTrigger>
                      <TabsTrigger value="add" className="h-8 w-full cursor-pointer">
                        {editingResourceId ? 'Edit Resource' : 'Add Resource'}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-3 pt-1">
                      {loadingResources ? (
                        <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading resources...
                        </div>
                      ) : lessonResources.length > 0 ? (
                        <div className="space-y-2">
                          {lessonResources.map((res: any) => (
                            <div
                              key={res.id}
                              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-sm hover:bg-muted/70 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate">{res.title}</p>
                                <span className="text-xs text-muted-foreground capitalize">{res.type}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {res.resource && (
                                  <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                    <a href={res.resource} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                      {res.type === 'link' ? <Eye className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                                      <span>{res.type === 'link' ? 'Preview' : 'Download'}</span>
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => {
                                    setEditingResourceId(res.id)
                                    setResourceTitle(res.title)
                                    setResourceType(res.type || 'document')
                                    setResourceUrl(res.resource || '')
                                    setResourceTab('add')
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteResource(res.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                          <FolderOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                          <p className="font-medium">No resources available for this lesson.</p>
                          <p className="text-xs mt-1">Switch to &quot;Add Resource&quot; above to attach documents or links.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4 pt-1">
                      <form onSubmit={handleSaveResource} className="space-y-4">
                        <div>
                          <Label>Resource Title *</Label>
                          <Input
                            required
                            placeholder="e.g. Course Slides or Cheat Sheet"
                            value={resourceTitle}
                            onChange={(e) => setResourceTitle(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Resource Type *</Label>
                          <Select value={resourceType} onValueChange={setResourceType}>
                            <SelectTrigger className="w-full mt-1 capitalize">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="image">Image File</SelectItem>
                              <SelectItem value="video">Video File</SelectItem>
                              <SelectItem value="zip">Zip / Archive</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>{resourceType === 'link' ? 'Resource URL *' : 'Resource File / URL *'}</Label>
                          <Input
                            required
                            type={resourceType === 'link' ? 'url' : 'text'}
                            placeholder={resourceType === 'link' ? 'https://example.com/resource' : 'URL or uploaded file path'}
                            value={resourceUrl}
                            onChange={(e) => setResourceUrl(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingResourceId(null)
                              setResourceTab('list')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={savingResource}>
                            {savingResource && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            {editingResourceId ? 'Update Resource' : 'Add Resource'}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            {/* Questions Modal for Quiz */}
            <Dialog open={questionsModalOpen} onOpenChange={setQuestionsModalOpen}>
              <DialogContent className="sm:max-w-137.5 p-0">
                <ScrollArea className="max-h-[90vh] p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                      <ListOrdered className="h-5 w-5 text-primary" />
                      Quiz Questions - {activeQuizForQuestions?.title}
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs value={questionsTab} onValueChange={(v) => setQuestionsTab(v as 'list' | 'add')}>
                    <TabsList className="h-10 w-full mb-4">
                      <TabsTrigger value="list" className="h-8 w-full cursor-pointer">
                        Questions List ({quizQuestions.length})
                      </TabsTrigger>
                      <TabsTrigger value="add" className="h-8 w-full cursor-pointer">
                        Add Question
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-3 pt-1">
                      {loadingQuestions ? (
                        <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading questions...
                        </div>
                      ) : quizQuestions.length > 0 ? (
                        <div className="space-y-2">
                          {quizQuestions.map((q: any, i: number) => (
                            <div
                              key={q.id || i}
                              className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-sm hover:bg-muted/70 transition-colors"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <p className="font-medium text-foreground">
                                  {i + 1}. {q.title}
                                </p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                                  {q.type?.replace('_', ' ') || 'Question'}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                          <ListOrdered className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                          <p className="font-medium">No questions yet in this quiz.</p>
                          <p className="text-xs mt-1">Switch to &quot;Add Question&quot; above to create quiz questions.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4 pt-1">
                      <form onSubmit={handleAddQuestion} className="space-y-4">
                        <div>
                          <Label>Question Title *</Label>
                          <Input
                            required
                            placeholder="e.g. What is the output of console.log(typeof null)?"
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Question Type *</Label>
                          <Select value={newQuestionType} onValueChange={setNewQuestionType}>
                            <SelectTrigger className="w-full mt-1 capitalize">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single_choice">Single Choice</SelectItem>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True / False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Options (JSON array or comma-separated)</Label>
                          <Input
                            placeholder='e.g. ["object", "null", "undefined", "number"]'
                            value={newQuestionOptions}
                            onChange={(e) => setNewQuestionOptions(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Correct Answer *</Label>
                          <Input
                            required
                            placeholder="e.g. object"
                            value={newQuestionAnswer}
                            onChange={(e) => setNewQuestionAnswer(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setQuestionsTab('list')}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={savingQuestion}>
                            {savingQuestion && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            Save Question
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            {/* Sort Sections Modal matching Laravel DataSortModal */}
            <Dialog open={sortSectionsModalOpen} onOpenChange={setSortSectionsModalOpen}>
              <DialogContent className="sm:max-w-120">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ArrowDownUp className="h-5 w-5 text-primary" />
                    Sort Sections
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">Use the buttons to reorder the course sections.</p>
                </DialogHeader>

                <div className="space-y-2 py-3 max-h-[60vh] overflow-y-auto">
                  {sortedSectionsList.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-2xs"
                    >
                      <span className="text-sm font-medium">
                        {idx + 1}. {sec.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === sortedSectionsList.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSortSectionsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSectionsSort} disabled={savingSectionsSort}>
                    {savingSectionsSort && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Save Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Sort Lessons Modal matching Laravel DataSortModal */}
            <Dialog open={sortLessonsModalOpen} onOpenChange={setSortLessonsModalOpen}>
              <DialogContent className="sm:max-w-120">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ArrowDownUp className="h-5 w-5 text-primary" />
                    Sort Lessons - {activeSectionForSort?.title}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">Use the buttons to reorder the lessons in this section.</p>
                </DialogHeader>

                <div className="space-y-2 py-3 max-h-[60vh] overflow-y-auto">
                  {sortedLessonsList.length > 0 ? (
                    sortedLessonsList.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-2xs"
                      >
                        <span className="text-sm font-medium">
                          {idx + 1}. {lesson.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === 0}
                            onClick={() => moveLesson(idx, 'up')}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === sortedLessonsList.length - 1}
                            onClick={() => moveLesson(idx, 'down')}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">No lessons in this section to sort.</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSortLessonsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLessonsSort} disabled={savingLessonsSort || sortedLessonsList.length === 0}>
                    {savingLessonsSort && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Save Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Lesson Dialog - Exact 1:1 Laravel replica */}
            <Dialog
              open={lessonDialogOpen}
              onOpenChange={(open) => {
                setLessonDialogOpen(open);
                if (open) setAddLessonStep('type');
              }}
            >
              <DialogContent className="sm:max-w-[540px] max-h-[90vh] p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg font-semibold">
                    Add Lesson
                  </DialogTitle>
                </DialogHeader>

                {addLessonStep === 'type' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Lesson type</Label>
                      <RadioGroup
                        value={lessonForm.lesson_type}
                        onValueChange={(val) => setLessonForm((p) => ({ ...p, lesson_type: val }))}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { value: 'video', label: 'Video File' },
                          { value: 'video_url', label: 'Video URL' },
                          { value: 'document', label: 'Document File' },
                          { value: 'image', label: 'Image File' },
                          { value: 'text', label: 'Text Content' },
                          { value: 'embed', label: 'Embed Source' },
                        ].map((type) => (
                          <Label
                            key={type.value}
                            className={cn(
                              'flex items-center space-x-2 rounded-lg border p-2 cursor-pointer transition-colors text-sm',
                              lessonForm.lesson_type === type.value
                                ? 'border-foreground/80 font-medium'
                                : 'border-border hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem
                              className="mb-0 cursor-pointer"
                              value={type.value}
                            />
                            <span>{type.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    <DialogFooter className="w-full justify-start space-x-2 pt-6">
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                          Close
                        </Button>
                        <Button type="button" onClick={() => setAddLessonStep('form')}>
                          Next
                        </Button>
                      </div>
                    </DialogFooter>
                  </div>
                ) : (
                  <form onSubmit={handleCreateLesson}>
                    <ScrollArea className="max-h-[calc(85vh-160px)] pr-3">
                      <div className="space-y-4 p-0.5">
                        <div>
                          <Label htmlFor="les-title">Title *</Label>
                          <Input
                            id="les-title"
                            placeholder="Title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1"
                            required
                          />
                        </div>

                        {/* File Upload for video, document, image */}
                        {['video', 'document', 'image'].includes(lessonForm.lesson_type) && (
                          <div>
                            <Label className="capitalize">Select {lessonForm.lesson_type}</Label>
                            <Input
                              type="file"
                              className="mt-1 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (!lessonForm.title) {
                                    setLessonForm((p) => ({
                                      ...p,
                                      title: file.name.replace(/\.[^/.]+$/, ''),
                                    }));
                                  }
                                }
                              }}
                            />
                          </div>
                        )}

                        {/* Video URL Provider and Source */}
                        {lessonForm.lesson_type === 'video_url' && (
                          <div className="space-y-4">
                            <div>
                              <Label>Video URL Provider</Label>
                              <Select
                                value={lessonForm.lesson_provider || 'youtube'}
                                onValueChange={(val) => setLessonForm((p) => ({ ...p, lesson_provider: val }))}
                              >
                                <SelectTrigger className="mt-1 w-full">
                                  <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="vimeo">Vimeo</SelectItem>
                                  <SelectItem value="html5">HTML5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="les-src">
                                Video URL{' '}
                                <span className="text-xs text-muted-foreground">
                                  (Provide the shareable url only)
                                </span>
                              </Label>
                              <Input
                                id="les-src"
                                placeholder={`Type your ${lessonForm.lesson_provider || 'youtube'} video url`}
                                value={lessonForm.lesson_src}
                                onChange={(e) => setLessonForm((p) => ({ ...p, lesson_src: e.target.value }))}
                                className="mt-1"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* Embed Source */}
                        {lessonForm.lesson_type === 'embed' && (
                          <div>
                            <Label htmlFor="les-embed">
                              Embed source{' '}
                              <span className="text-xs text-muted-foreground">
                                (Provide the source url only)
                              </span>
                            </Label>
                            <Textarea
                              id="les-embed"
                              placeholder="Type your embed source code or url"
                              rows={4}
                              value={lessonForm.lesson_src}
                              onChange={(e) => setLessonForm((p) => ({ ...p, lesson_src: e.target.value }))}
                              className="mt-1"
                              required
                            />
                          </div>
                        )}

                        {/* Rich Text for text type */}
                        {lessonForm.lesson_type === 'text' && (
                          <div>
                            <Label>Your text</Label>
                            <div className="mt-1">
                              <Editor
                                ssr={true}
                                output="html"
                                placeholder={{
                                  paragraph: 'Type your content here...',
                                  imageCaption: 'Type caption for image (optional)',
                                }}
                                contentMinHeight={220}
                                contentMaxHeight={500}
                                initialContent={lessonForm.lesson_src}
                                onContentChange={(val) =>
                                  setLessonForm((p) => ({ ...p, lesson_src: val }))
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Duration for video and video_url */}
                        {['video_url', 'video'].includes(lessonForm.lesson_type) && (
                          <div>
                            <Label htmlFor="les-dur">Duration</Label>
                            <Input
                              id="les-dur"
                              placeholder="00:00:00"
                              value={lessonForm.duration}
                              onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        )}

                        {/* Summary with TipTap Rich Editor matching Laravel */}
                        <div>
                          <Label htmlFor="les-summary">Summary</Label>
                          <div className="mt-1">
                            <Editor
                              ssr={true}
                              output="html"
                              placeholder={{
                                paragraph: 'Type your content here...',
                                imageCaption: 'Type caption for image (optional)',
                              }}
                              contentMinHeight={200}
                              contentMaxHeight={400}
                              initialContent={lessonForm.summary}
                              onContentChange={(val) =>
                                setLessonForm((p) => ({ ...p, summary: val }))
                              }
                            />
                          </div>
                        </div>

                        {/* Lesson Type Radio Group */}
                        <div>
                          <Label className="block mb-2 text-sm font-medium">Lesson type</Label>
                          <RadioGroup
                            value={lessonForm.is_free ? 'free' : 'paid'}
                            onValueChange={(val) => setLessonForm((p) => ({ ...p, is_free: val === 'free' }))}
                            className="flex items-center space-x-4 pt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paid" id="create-lesson-paid" className="cursor-pointer" />
                              <Label htmlFor="create-lesson-paid" className="text-sm font-normal cursor-pointer capitalize">
                                paid
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="free" id="create-lesson-free" className="cursor-pointer" />
                              <Label htmlFor="create-lesson-free" className="text-sm font-normal cursor-pointer capitalize">
                                free
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </ScrollArea>

                    <DialogFooter className="w-full justify-between space-x-2 pt-6">
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                            Close
                          </Button>
                          <Button type="button" onClick={() => setAddLessonStep('type')}>
                            Back
                          </Button>
                        </div>
                        <Button type="submit" disabled={savingLesson}>
                          {savingLesson ? 'Saving...' : 'Add Lesson'}
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Lesson Dialog - 1:1 replica matching Laravel */}
            <Dialog open={editLessonDialogOpen} onOpenChange={setEditLessonDialogOpen}>
              <DialogContent className="sm:max-w-[540px] max-h-[90vh] p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg font-semibold">Update Lesson</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateLesson}>
                  <ScrollArea className="max-h-[calc(85vh-160px)] pr-3">
                    <div className="space-y-4 p-0.5">
                      <div>
                        <Label htmlFor="edit-les-title">Title *</Label>
                        <Input
                          id="edit-les-title"
                          placeholder="Title"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>

                      {/* Video URL Provider and Source */}
                      {lessonForm.lesson_type === 'video_url' && (
                        <div className="space-y-4">
                          <div>
                            <Label>Video URL Provider</Label>
                            <Select
                              value={lessonForm.lesson_provider || 'youtube'}
                              onValueChange={(val) => setLessonForm((p) => ({ ...p, lesson_provider: val }))}
                            >
                              <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select Provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="vimeo">Vimeo</SelectItem>
                                <SelectItem value="html5">HTML5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="edit-les-src">
                              Video URL{' '}
                              <span className="text-xs text-muted-foreground">
                                (Provide the shareable url only)
                              </span>
                            </Label>
                            <Input
                              id="edit-les-src"
                              placeholder={`Type your ${lessonForm.lesson_provider || 'youtube'} video url`}
                              value={lessonForm.lesson_src}
                              onChange={(e) => setLessonForm((p) => ({ ...p, lesson_src: e.target.value }))}
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* File Upload for video, document, image */}
                      {['video', 'document', 'image'].includes(lessonForm.lesson_type) && (
                        <div>
                          <Label className="capitalize">Select {lessonForm.lesson_type}</Label>
                          <Input
                            type="file"
                            className="mt-1 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && !lessonForm.title) {
                                setLessonForm((p) => ({
                                  ...p,
                                  title: file.name.replace(/\.[^/.]+$/, ''),
                                }));
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* Embed Source */}
                      {lessonForm.lesson_type === 'embed' && (
                        <div>
                          <Label htmlFor="edit-les-embed">
                            Embed source{' '}
                            <span className="text-xs text-muted-foreground">
                              (Provide the source url only)
                            </span>
                          </Label>
                          <Textarea
                            id="edit-les-embed"
                            placeholder="Type your embed source code or url"
                            rows={4}
                            value={lessonForm.lesson_src}
                            onChange={(e) => setLessonForm((p) => ({ ...p, lesson_src: e.target.value }))}
                            className="mt-1"
                            required
                          />
                        </div>
                      )}

                      {/* Rich Text for text type */}
                      {lessonForm.lesson_type === 'text' && (
                        <div>
                          <Label>Your text</Label>
                          <div className="mt-1">
                            <Editor
                              ssr={true}
                              output="html"
                              placeholder={{
                                paragraph: 'Type your content here...',
                                imageCaption: 'Type caption for image (optional)',
                              }}
                              contentMinHeight={220}
                              contentMaxHeight={500}
                              initialContent={lessonForm.lesson_src}
                              onContentChange={(val) =>
                                setLessonForm((p) => ({ ...p, lesson_src: val }))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* Duration for video and video_url */}
                      {['video_url', 'video'].includes(lessonForm.lesson_type) && (
                        <div>
                          <Label htmlFor="edit-les-dur">Duration</Label>
                          <Input
                            id="edit-les-dur"
                            placeholder="00:00:00"
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {/* Summary with TipTap Rich Editor */}
                      <div>
                        <Label htmlFor="edit-les-summary">Summary</Label>
                        <div className="mt-1">
                          <Editor
                            ssr={true}
                            output="html"
                            placeholder={{
                              paragraph: 'Type your content here...',
                              imageCaption: 'Type caption for image (optional)',
                            }}
                            contentMinHeight={200}
                            contentMaxHeight={400}
                            initialContent={lessonForm.summary}
                            onContentChange={(val) =>
                              setLessonForm((p) => ({ ...p, summary: val }))
                            }
                          />
                        </div>
                      </div>

                      {/* Lesson Type Radio Group */}
                      <div>
                        <Label className="block mb-2 text-sm font-medium">Lesson type</Label>
                        <RadioGroup
                          value={lessonForm.is_free ? 'free' : 'paid'}
                          onValueChange={(val) => setLessonForm((p) => ({ ...p, is_free: val === 'free' }))}
                          className="flex items-center space-x-4 pt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id="edit-lesson-paid" className="cursor-pointer" />
                            <Label htmlFor="edit-lesson-paid" className="text-sm font-normal cursor-pointer capitalize">
                              paid
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="edit-lesson-free" className="cursor-pointer" />
                            <Label htmlFor="edit-lesson-free" className="text-sm font-normal cursor-pointer capitalize">
                              free
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </ScrollArea>

                  <DialogFooter className="w-full justify-between space-x-2 pt-6">
                    <div className="flex w-full items-center justify-between">
                      <Button type="button" variant="outline" onClick={() => setEditLessonDialogOpen(false)}>
                        Close
                      </Button>
                      <Button type="submit" disabled={savingLesson}>
                        {savingLesson ? 'Saving...' : 'Update Lesson'}
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Section Quiz Dialog */}
            <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg font-semibold">Add Quiz</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-title">Quiz Title *</Label>
                    <Input
                      id="quiz-title"
                      placeholder="Title"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Duration</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="quiz-hours" className="text-xs text-muted-foreground">Hours</Label>
                        <Input
                          id="quiz-hours"
                          type="number"
                          min={0}
                          value={quizForm.hours}
                          onChange={(e) => setQuizForm((p) => ({ ...p, hours: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiz-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                        <Input
                          id="quiz-minutes"
                          type="number"
                          min={0}
                          max={59}
                          value={quizForm.minutes}
                          onChange={(e) => setQuizForm((p) => ({ ...p, minutes: parseInt(e.target.value) || 0 }))}
                          placeholder="30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiz-seconds" className="text-xs text-muted-foreground">Seconds</Label>
                        <Input
                          id="quiz-seconds"
                          type="number"
                          min={0}
                          max={59}
                          value={quizForm.seconds}
                          onChange={(e) => setQuizForm((p) => ({ ...p, seconds: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="quiz-total-marks">Total Mark *</Label>
                      <Input
                        id="quiz-total-marks"
                        type="number"
                        min={1}
                        value={quizForm.total_marks}
                        onChange={(e) => setQuizForm((p) => ({ ...p, total_marks: parseInt(e.target.value) || 0 }))}
                        placeholder="100"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-pass-mark">Pass Mark *</Label>
                      <Input
                        id="quiz-pass-mark"
                        type="number"
                        min={0}
                        value={quizForm.pass_mark}
                        onChange={(e) => setQuizForm((p) => ({ ...p, pass_mark: parseInt(e.target.value) || 0 }))}
                        placeholder="50"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-retake">Retake Attempts</Label>
                      <Input
                        id="quiz-retake"
                        type="number"
                        min={0}
                        value={quizForm.retake}
                        onChange={(e) => setQuizForm((p) => ({ ...p, retake: parseInt(e.target.value) || 0 }))}
                        placeholder="1"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quiz-summary">Quiz Summary</Label>
                    <div className="mt-1">
                      <Editor
                        ssr={true}
                        output="html"
                        placeholder={{
                          paragraph: 'Type your content here...',
                          imageCaption: 'Type caption for image (optional)',
                        }}
                        contentMinHeight={160}
                        contentMaxHeight={350}
                        initialContent={quizForm.summary}
                        onContentChange={(val) => setQuizForm((p) => ({ ...p, summary: val }))}
                      />
                    </div>
                  </div>

                  <DialogFooter className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setQuizDialogOpen(false)}>
                      Close
                    </Button>
                    <Button type="submit" disabled={savingQuiz}>
                      {savingQuiz ? 'Saving...' : 'Submit'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Update Section Quiz Dialog - 1:1 replica matching Laravel */}
            <Dialog open={editQuizDialogOpen} onOpenChange={setEditQuizDialogOpen}>
              <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg font-semibold">Update Quiz</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateQuiz} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-quiz-title">Quiz Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="edit-quiz-title"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Duration</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="edit-quiz-hours" className="text-xs text-muted-foreground">Hours</Label>
                        <Input
                          id="edit-quiz-hours"
                          type="number"
                          min={0}
                          value={quizForm.hours}
                          onChange={(e) => setQuizForm((p) => ({ ...p, hours: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-quiz-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                        <Input
                          id="edit-quiz-minutes"
                          type="number"
                          min={0}
                          max={59}
                          value={quizForm.minutes}
                          onChange={(e) => setQuizForm((p) => ({ ...p, minutes: parseInt(e.target.value) || 0 }))}
                          placeholder="30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-quiz-seconds" className="text-xs text-muted-foreground">Seconds</Label>
                        <Input
                          id="edit-quiz-seconds"
                          type="number"
                          min={0}
                          max={59}
                          value={quizForm.seconds}
                          onChange={(e) => setQuizForm((p) => ({ ...p, seconds: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="edit-quiz-total-marks">Total Mark <span className="text-destructive">*</span></Label>
                      <Input
                        id="edit-quiz-total-marks"
                        type="number"
                        min={1}
                        value={quizForm.total_marks}
                        onChange={(e) => setQuizForm((p) => ({ ...p, total_marks: parseInt(e.target.value) || 0 }))}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-quiz-pass-mark">Pass Mark <span className="text-destructive">*</span></Label>
                      <Input
                        id="edit-quiz-pass-mark"
                        type="number"
                        min={0}
                        value={quizForm.pass_mark}
                        onChange={(e) => setQuizForm((p) => ({ ...p, pass_mark: parseInt(e.target.value) || 0 }))}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-quiz-retake">Retake Attempts</Label>
                      <Input
                        id="edit-quiz-retake"
                        type="number"
                        min={0}
                        value={quizForm.retake}
                        onChange={(e) => setQuizForm((p) => ({ ...p, retake: parseInt(e.target.value) || 0 }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-quiz-summary">Quiz Summary</Label>
                    <div className="mt-1">
                      <Editor
                        ssr={true}
                        output="html"
                        placeholder={{
                          paragraph: 'Type your content here...',
                          imageCaption: 'Type caption for image (optional)',
                        }}
                        contentMinHeight={160}
                        contentMaxHeight={350}
                        initialContent={quizForm.summary}
                        onContentChange={(val) => setQuizForm((p) => ({ ...p, summary: val }))}
                      />
                    </div>
                  </div>

                  <DialogFooter className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditQuizDialogOpen(false)}>
                      Close
                    </Button>
                    <Button type="submit" disabled={savingQuiz}>
                      {savingQuiz ? 'Saving...' : 'Update Quiz'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB 2: LIVE CLASS (1:1 with Laravel screenshot & live-class.tsx) */}
          <TabsContent value="live-class" className="m-0 space-y-4">
            <Card className="container p-4 sm:p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Live Classes</h2>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setEditingLiveClassId(null)
                        setLiveClassForm({
                          class_topic: '',
                          provider: 'Zoom',
                          class_date_and_time: '',
                          class_note: '',
                          additional_info: '',
                        })
                        setLiveClassDialogOpen(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Schedule Class
                    </Button>
                  </div>
                </div>

                <Dialog open={liveClassDialogOpen} onOpenChange={setLiveClassDialogOpen}>
                  <DialogContent className="sm:max-w-125 p-6">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-lg font-semibold">
                        {editingLiveClassId ? 'Edit Live Class' : 'Schedule Class'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleScheduleLiveClass} className="space-y-4">
                      <div>
                        <Label htmlFor="live-topic">Class Topic *</Label>
                        <Input
                          id="live-topic"
                          placeholder="Class Topic"
                          value={liveClassForm.class_topic}
                          onChange={(e) => setLiveClassForm((p) => ({ ...p, class_topic: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="live-dt">Start Date & Time *</Label>
                        <Input
                          id="live-dt"
                          type="datetime-local"
                          value={liveClassForm.class_date_and_time}
                          onChange={(e) =>
                            setLiveClassForm((p) => ({ ...p, class_date_and_time: e.target.value }))
                          }
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="live-note">Class Note</Label>
                        <div className="mt-1">
                          <Editor
                            ssr={true}
                            output="html"
                            placeholder={{
                              paragraph: 'Type your content here...',
                              imageCaption: 'Type caption for image (optional)',
                            }}
                            contentMinHeight={160}
                            contentMaxHeight={350}
                            initialContent={liveClassForm.class_note}
                            onContentChange={(val) =>
                              setLiveClassForm((p) => ({ ...p, class_note: val }))
                            }
                          />
                        </div>
                      </div>

                      <DialogFooter className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setLiveClassDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingLiveClassId ? 'Update Live Class' : 'Schedule Class'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Live Classes List matching Laravel screenshot 1:1 */}
                <div className="space-y-4">
                  {(liveClasses.length > 0
                    ? liveClasses
                    : [
                        {
                          id: 1,
                          class_topic: 'Live Kickoff & Q&A Session',
                          provider: 'Zoom',
                          class_date_and_time: '2026-10-02T00:00:00',
                          class_note: 'Please come prepared with your full-stack development environment set up.',
                          additional_info: 'https://zoom.us/j/123456789',
                        },
                      ]
                  ).map((cls: any) => {
                    const formatDate = (dateStr: string) => {
                      try {
                        const d = new Date(dateStr)
                        if (isNaN(d.getTime())) return 'October 2nd, 2026'
                        const day = d.getDate()
                        const nth = (n: number) => {
                          if (n > 3 && n < 21) return 'th'
                          switch (n % 10) {
                            case 1:
                              return 'st'
                            case 2:
                              return 'nd'
                            case 3:
                              return 'rd'
                            default:
                              return 'th'
                          }
                        }
                        const month = d.toLocaleDateString('en-US', { month: 'long' })
                        const year = d.getFullYear()
                        return `${month} ${day}${nth(day)}, ${year}`
                      } catch {
                        return 'October 2nd, 2026'
                      }
                    }

                    const formatTime = (dateStr: string) => {
                      try {
                        const d = new Date(dateStr)
                        if (isNaN(d.getTime())) return '12:00 AM'
                        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                      } catch {
                        return '12:00 AM'
                      }
                    }

                    return (
                      <Card key={cls.id} className="p-6">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
                          <div className="flex-1">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">
                              {cls.class_topic}
                            </h3>

                            <div className="mb-4 space-y-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(cls.class_date_and_time)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(cls.class_date_and_time)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                  Instructor: {(course as any)?.instructor?.user?.name || (course as any)?.instructor?.name || 'Elena Rostova'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 sm:w-36">
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-4 py-1 text-center text-xs font-semibold capitalize select-none">
                              Upcoming
                            </span>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-full justify-start bg-muted hover:bg-muted/80 text-foreground px-2 text-xs"
                              asChild
                            >
                              <a
                                href={cls.additional_info || 'https://zoom.us'}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                <span>Join Class</span>
                              </a>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-full justify-start bg-muted hover:bg-muted/80 text-foreground px-2 text-xs"
                              onClick={() => {
                                setEditingLiveClassId(cls.id)
                                setLiveClassForm({
                                  class_topic: cls.class_topic || '',
                                  provider: cls.provider || 'Zoom',
                                  class_date_and_time: cls.class_date_and_time || '',
                                  class_note: cls.class_note || '',
                                  additional_info: cls.additional_info || '',
                                })
                                setLiveClassDialogOpen(true)
                              }}
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                              <span>Edit Live Class</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-full justify-start bg-rose-50 dark:bg-rose-950/20 text-destructive hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-destructive px-2 text-xs"
                              onClick={() => handleDeleteLiveClass(cls.id)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                              <span>Delete Class</span>
                            </Button>
                          </div>
                        </div>

                        {cls.class_note && (
                          <Accordion className="mt-4 w-full">
                            <AccordionItem
                              value="class-note-item"
                              className="overflow-hidden rounded-lg border-none bg-muted/60"
                            >
                              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                                Class Note
                              </AccordionTrigger>
                              <AccordionContent className="p-4 pt-1">
                                <div
                                  className="prose dark:prose-invert text-xs text-muted-foreground"
                                  dangerouslySetInnerHTML={{ __html: cls.class_note }}
                                />
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: BASIC */}
          <TabsContent value="basic" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Basic Information</h3>
              <div className="space-y-6 pt-4">
                <div>
                  <Label htmlFor="c-title">Course Title *</Label>
                  <Input
                    id="c-title"
                    value={course.title || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, title: e.target.value } : null))}
                    placeholder="Course Title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="c-slug">Course Slug (URL path)</Label>
                  <Input
                    id="c-slug"
                    value={course.slug || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, slug: e.target.value } : null))}
                    placeholder="course-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="c-short-desc">Short Description</Label>
                  <Textarea
                    id="c-short-desc"
                    rows={4}
                    value={course.short_description || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, short_description: e.target.value } : null))}
                    placeholder="Brief overview of course content..."
                  />
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
                    contentMaxHeight={640}
                    initialContent={course.description || ''}
                    onContentChange={(val) =>
                      setCourse((p) => (p ? { ...p, description: val } : null))
                    }
                  />
                </div>

                {currentUser?.role === 'admin' && (
                  <div>
                    <Label htmlFor="instructor_id">Course Instructor *</Label>
                    <Combobox
                      name="instructor_id"
                      data={instructors}
                      placeholder="Select Instructor"
                      defaultValue={course.instructor_id ? String(course.instructor_id) : ''}
                      onSelect={(selected) => {
                        setCourse((p) => (p ? {
                          ...p,
                          instructor_id: Number(selected.id || selected.value),
                        } : null))
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="course_category_id">Category *</Label>
                    <Combobox
                      name="course_category_id"
                      data={categoryItems}
                      placeholder="Select category"
                      defaultValue={getSelectedCategoryValue()}
                      onSelect={(selected) => {
                        setCourse((p) => (p ? {
                          ...p,
                          course_category_id: selected.id ? Number(selected.id) : p.course_category_id,
                          course_category_child_id: selected.child_id ? Number(selected.child_id) : null,
                        } : null))
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="level">Course Level *</Label>
                    <Select
                      value={course.level || 'Beginner'}
                      onValueChange={(val) => setCourse((p) => (p ? { ...p, level: val } : null))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Course Language *</Label>
                    <Combobox
                      name="language"
                      data={courseLanguages}
                      defaultValue={course.language || 'English'}
                      placeholder="Select Course Language"
                      onSelect={(selected) =>
                        setCourse((p) => (p ? { ...p, language: selected.value } : null))
                      }
                    />
                  </div>

                  <div>
                    <Label>Enable Drip Content</Label>
                    <RadioGroup
                      value={course.drip_content ? 'enable' : 'disable'}
                      onValueChange={(val) => setCourse((p) => (p ? { ...p, drip_content: val === 'enable' } : null))}
                      className="flex items-center space-x-6 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="drip-enable" value="enable" />
                        <Label htmlFor="drip-enable" className="cursor-pointer mb-0">Enabled</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="drip-disable" value="disable" />
                        <Label htmlFor="drip-disable" className="cursor-pointer mb-0">Disabled</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={() => handleSaveCourse('Basic Info')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PRICING */}
          <TabsContent value="pricing" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Pricing Settings</h3>
              <div className="space-y-6 pt-4">
                <div>
                  <Label className="mb-2 block">Pricing Model *</Label>
                  <RadioGroup
                    value={course.pricing_type || 'paid'}
                    onValueChange={(val) => setCourse((p) => (p ? { ...p, pricing_type: val as 'free' | 'paid' } : null))}
                    className="flex items-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="price-paid" />
                      <Label htmlFor="price-paid" className="cursor-pointer">Paid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="price-free" />
                      <Label htmlFor="price-free" className="cursor-pointer">Free</Label>
                    </div>
                  </RadioGroup>
                </div>

                {course.pricing_type === 'paid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="c-price">Course Price ($) *</Label>
                      <Input
                        id="c-price"
                        type="number"
                        placeholder="49.99"
                        value={course.price || ''}
                        onChange={(e) => setCourse((p) => (p ? { ...p, price: e.target.value } : null))}
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="c-disc"
                          checked={Boolean(course.discount)}
                          onCheckedChange={(checked) =>
                            setCourse((p) => (p ? { ...p, discount: Boolean(checked) } : null))
                          }
                        />
                        <Label htmlFor="c-disc" className="cursor-pointer text-sm font-normal">
                          Enable Discounted Price
                        </Label>
                      </div>
                      {course.discount ? (
                        <Input
                          placeholder="Discount Price ($)"
                          type="number"
                          value={course.discount_price || ''}
                          onChange={(e) =>
                            setCourse((p) => (p ? { ...p, discount_price: e.target.value } : null))
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Enrollment Validity / Expiry</Label>
                  <RadioGroup
                    value={course.expiry_type || 'lifetime'}
                    onValueChange={(val) => setCourse((p) => (p ? { ...p, expiry_type: val } : null))}
                    className="flex items-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lifetime" id="exp-life" />
                      <Label htmlFor="exp-life" className="cursor-pointer">Lifetime Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited_time" id="exp-lim" />
                      <Label htmlFor="exp-lim" className="cursor-pointer">Limited Period Access</Label>
                    </div>
                  </RadioGroup>
                </div>

                {course.expiry_type === 'limited_time' && (
                  <div className="pt-2">
                    <Label htmlFor="exp-duration">Expiry Duration</Label>
                    <Combobox
                      name="expiry_duration"
                      data={courseDurations}
                      defaultValue={course.expiry_duration || ''}
                      placeholder="Select duration"
                      onSelect={(selected) =>
                        setCourse((p) => (p ? { ...p, expiry_duration: selected.value } : null))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={() => handleSaveCourse('Pricing')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: INFO (FAQs, Requirements, Learning Outcomes) */}
          <TabsContent value="info" className="m-0 space-y-4">
            <Card className="p-0 sm:p-6">
              <Tabs value={infoSubTab} onValueChange={(val) => setInfoSubTab(val as any)} className="w-full md:space-y-6">
                <TabsList className="h-10 w-full">
                  <TabsTrigger value="faqs" className="h-8 w-full cursor-pointer">
                    Course FAQs
                  </TabsTrigger>
                  <TabsTrigger value="requirements" className="h-8 w-full cursor-pointer">
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger value="outcomes" className="h-8 w-full cursor-pointer">
                    Outcomes
                  </TabsTrigger>
                </TabsList>

                {/* Sub-tab 1: FAQs */}
                <TabsContent value="faqs" className="m-0! space-y-4 p-4 md:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Course FAQs</h4>
                    <Button onClick={() => setFaqDialogOpen(true)} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {faqs.length === 0 ? (
                      <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No FAQs added yet
                      </p>
                    ) : (
                      faqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="flex items-start justify-between rounded-lg border p-4 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="space-y-1 pr-4">
                            <p className="text-sm font-semibold text-foreground">{faq.question}</p>
                            <p className="text-xs text-muted-foreground">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setActiveEditFaq(faq)
                                setEditFaqQ(faq.question)
                                setEditFaqA(faq.answer)
                                setEditFaqDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteFaq(faq.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Create FAQ Dialog */}
                  <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Course FAQ</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddFaq} className="space-y-4 pt-2">
                        <div>
                          <Label>Question *</Label>
                          <Input
                            placeholder="e.g. Do I get a certificate upon completion?"
                            value={faqQ}
                            onChange={(e) => setFaqQ(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Answer *</Label>
                          <Textarea
                            rows={3}
                            placeholder="e.g. Yes, a downloadable verified certificate is provided."
                            value={faqA}
                            onChange={(e) => setFaqA(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add FAQ</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit FAQ Dialog */}
                  <Dialog open={editFaqDialogOpen} onOpenChange={setEditFaqDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Course FAQ</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateFaq} className="space-y-4 pt-2">
                        <div>
                          <Label>Question *</Label>
                          <Input
                            placeholder="Question"
                            value={editFaqQ}
                            onChange={(e) => setEditFaqQ(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Answer *</Label>
                          <Textarea
                            rows={3}
                            placeholder="Answer"
                            value={editFaqA}
                            onChange={(e) => setEditFaqA(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setEditFaqDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Update FAQ</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Sub-tab 2: Requirements */}
                <TabsContent value="requirements" className="m-0! space-y-4 p-4 md:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Course Requirements / Prerequisites</h4>
                    <Button onClick={() => setReqDialogOpen(true)} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add Requirement
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {requirements.length === 0 ? (
                      <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No requirements added yet
                      </p>
                    ) : (
                      requirements.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">{req.requirement}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setActiveEditReq(req)
                                setEditReqText(req.requirement)
                                setEditReqDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteRequirement(req.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Create Requirement Dialog */}
                  <Dialog open={reqDialogOpen} onOpenChange={setReqDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Prerequisite Requirement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddRequirement} className="space-y-4 pt-2">
                        <div>
                          <Label>Requirement *</Label>
                          <Input
                            placeholder="e.g. Basic understanding of HTML and JavaScript"
                            value={reqText}
                            onChange={(e) => setReqText(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setReqDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Requirement</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Requirement Dialog */}
                  <Dialog open={editReqDialogOpen} onOpenChange={setEditReqDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Prerequisite Requirement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateRequirement} className="space-y-4 pt-2">
                        <div>
                          <Label>Requirement *</Label>
                          <Input
                            placeholder="Requirement"
                            value={editReqText}
                            onChange={(e) => setEditReqText(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setEditReqDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Update Requirement</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                {/* Sub-tab 3: Outcomes */}
                <TabsContent value="outcomes" className="m-0! space-y-4 p-4 md:p-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Learning Outcomes</h4>
                    <Button onClick={() => setOutcomeDialogOpen(true)} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add Outcome
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {outcomes.length === 0 ? (
                      <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No outcomes added yet
                      </p>
                    ) : (
                      outcomes.map((out) => (
                        <div
                          key={out.id}
                          className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">{out.outcome}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setActiveEditOutcome(out)
                                setEditOutcomeText(out.outcome)
                                setEditOutcomeDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteOutcome(out.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Create Outcome Dialog */}
                  <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Learning Outcome</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddOutcome} className="space-y-4 pt-2">
                        <div>
                          <Label>Outcome *</Label>
                          <Input
                            placeholder="e.g. Build modern, responsive Next.js web applications"
                            value={outcomeText}
                            onChange={(e) => setOutcomeText(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setOutcomeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Outcome</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Outcome Dialog */}
                  <Dialog open={editOutcomeDialogOpen} onOpenChange={setEditOutcomeDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Learning Outcome</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateOutcome} className="space-y-4 pt-2">
                        <div>
                          <Label>Outcome *</Label>
                          <Input
                            placeholder="Outcome"
                            value={editOutcomeText}
                            onChange={(e) => setEditOutcomeText(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setEditOutcomeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Update Outcome</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-6">
                <Button onClick={() => handleSaveCourse('Course Information')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 6: MEDIA (1:1 with Laravel media.tsx) */}
          <TabsContent value="media" className="m-0 space-y-6">
            <Card className="p-4 sm:p-6 space-y-6">
              {/* Thumbnail Section */}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingThumbnail}
                  onChange={handleThumbnailUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 600x400px. Max size: 2MB.
                </p>
                <div className="mt-2">
                  <img
                    src={course.thumbnail || '/assets/images/blank-image.jpg'}
                    alt="Course Thumbnail"
                    className="w-full max-w-sm rounded-md border object-cover aspect-video"
                  />
                </div>
              </div>

              {/* Banner Section */}
              <div className="space-y-2">
                <Label>Banner</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingBanner}
                  onChange={handleBannerUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x400px. Max size: 4MB.
                </p>
                <div className="mt-2">
                  <img
                    src={course.banner || '/assets/images/blank-image.jpg'}
                    alt="Course Banner"
                    className="w-full max-w-sm rounded-md border object-cover aspect-video"
                  />
                </div>
              </div>

              <Separator />

              {/* Preview Video Type */}
              <div className="space-y-3">
                <Label>Preview Video Type</Label>
                <RadioGroup
                  value={course.preview_type || 'video_url'}
                  onValueChange={(val) => setCourse((p) => (p ? { ...p, preview_type: val } : null))}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video_url" id="vid-url" />
                    <Label htmlFor="vid-url" className="cursor-pointer mb-0">Video URL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="vid-file" />
                    <Label htmlFor="vid-file" className="cursor-pointer mb-0">Video File</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Preview Video URL */}
              <div className="space-y-2">
                <Label>Preview Video</Label>
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or vimeo URL"
                  value={course.preview || ''}
                  onChange={(e) => setCourse((p) => (p ? { ...p, preview: e.target.value } : null))}
                />
                <p className="text-xs text-muted-foreground">
                  Supported URL: youtube or vimeo.
                </p>

                {course.preview && (
                  <div className="mt-4 max-w-lg rounded-xl overflow-hidden border bg-black aspect-video flex items-center justify-center">
                    <iframe
                      src={
                        course.preview.includes('watch?v=')
                          ? course.preview.replace('watch?v=', 'embed/')
                          : course.preview
                      }
                      title="Course Trailer"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveCourse('Media')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 7: SEO */}
          <TabsContent value="seo" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Search Engine Optimization (SEO)</h3>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="seo-title">Meta Title</Label>
                  <Input
                    id="seo-title"
                    placeholder="Search engine title"
                    value={course.meta_title || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, meta_title: e.target.value } : null))}
                  />
                </div>

                <div>
                  <Label htmlFor="seo-kw">Meta Keywords</Label>
                  <Textarea
                    id="seo-kw"
                    rows={3}
                    placeholder="Comma separated keywords"
                    value={course.meta_keywords || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, meta_keywords: e.target.value } : null))}
                  />
                </div>

                <div>
                  <Label htmlFor="seo-desc">Meta Description</Label>
                  <Textarea
                    id="seo-desc"
                    rows={3}
                    placeholder="Meta description displayed in search results..."
                    value={course.meta_description || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, meta_description: e.target.value } : null))}
                  />
                </div>

                <div>
                  <Label htmlFor="seo-og-title">OG Title</Label>
                  <Input
                    id="seo-og-title"
                    placeholder="Open Graph title"
                    value={course.og_title || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, og_title: e.target.value } : null))}
                  />
                </div>

                <div>
                  <Label htmlFor="seo-og-desc">OG Description</Label>
                  <Textarea
                    id="seo-og-desc"
                    rows={3}
                    placeholder="Open Graph description"
                    value={course.og_description || ''}
                    onChange={(e) => setCourse((p) => (p ? { ...p, og_description: e.target.value } : null))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={() => handleSaveCourse('SEO')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
