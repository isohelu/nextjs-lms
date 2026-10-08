'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RichEditor from '@/components/ui/rich-editor'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
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
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  HelpCircle,
  ListTodo,
  Settings,
  CircleDollarSign,
  BookText,
  FileText,
  FolderInput,
  FlaskConical,
  Eye,
  Plus,
  Trash2,
  Copy,
  Edit,
  Pencil,
  Circle,
  CircleCheck,
  CheckCircle2,
  CheckSquare,
  ArrowUpDown,
  ArrowRight,
  Headphones,
  Link2,
  ListOrdered,
  Type,
  Loader2,
  Save,
  MoreVertical,
  Download,
  BadgeCheck,
} from 'lucide-react'

// Question Type Config matching Laravel QuestionTypeBadge
export type ExamQuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'matching'
  | 'fill_blank'
  | 'ordering'
  | 'short_answer'
  | 'listening'

const questionTypeConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }
> = {
  multiple_choice: {
    label: 'Multiple Choice',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300',
  },
  multiple_select: {
    label: 'Multiple Select',
    icon: CheckSquare,
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300',
  },
  matching: {
    label: 'Matching',
    icon: Link2,
    color: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-300',
  },
  fill_blank: {
    label: 'Fill in the Blank',
    icon: Type,
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:text-yellow-300',
  },
  ordering: {
    label: 'Ordering',
    icon: ListOrdered,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-300',
  },
  short_answer: {
    label: 'Short Answer',
    icon: FileText,
    color: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300',
  },
  listening: {
    label: 'Listening',
    icon: Headphones,
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300',
  },
}

function QuestionTypeBadge({ type, className }: { type: string; className?: string }) {
  const config = questionTypeConfig[type] || questionTypeConfig.multiple_choice
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-xs font-semibold',
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  )
}

interface QuestionOption {
  id?: number
  option_text: string
  is_correct: boolean | number
}

interface QuestionItem {
  id: number
  exam_id: number
  title: string
  description?: string | null
  question_type: ExamQuestionType | string
  marks: number
  options?: any
  question_options?: QuestionOption[]
}

interface ExamResource {
  id: number
  title: string
  resource: string
  type?: string
}

interface ExamData {
  id: number
  title: string
  slug: string
  status?: string
  level?: string
  exam_category_id?: number | string
  instructor_id?: number | string
  duration_hours?: number
  duration_minutes?: number
  pass_mark?: number
  total_marks?: number
  max_attempts?: number
  pricing_type?: 'paid' | 'free'
  price?: number | string
  discount?: boolean | number
  discount_price?: number | string
  expiry_type?: string
  expiry_duration?: string
  short_description?: string
  description?: string
  instructions?: string
  rules?: string
  thumbnail?: string
  meta_title?: string
  meta_keywords?: string
  meta_description?: string
  og_title?: string
  og_description?: string
  questions?: QuestionItem[]
  resources?: ExamResource[]
  faqs?: Array<{ id?: number; question: string; answer: string; sort?: number }>
  requirements?: Array<{ id?: number; requirement: string; sort?: number }>
  outcomes?: Array<{ id?: number; outcome: string; sort?: number }>
}

interface Props {
  initialExamId?: number
  initialTab?: string
}

export default function ExamUpdateManager({ initialExamId, initialTab = 'questions' }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exam, setExam] = useState<ExamData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [categories, setCategories] = useState<{ id: number; title: string }[]>([])
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([])

  // Status Dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('published')
  const [statusFeedback, setStatusFeedback] = useState('')

  // Question Dialog states (1:1 with Laravel question-dialog.tsx)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    question_type: 'multiple_choice' as ExamQuestionType,
    marks: 10,
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
    // For other types:
    matches: [
      { question: '', answer: '' },
      { question: '', answer: '' },
    ],
    answers: [''],
    items: ['', '', ''],
    sample_answer: '',
    audio_url: '',
    audio_instructions: '',
  })

  // Resource Dialog states
  const [resources, setResources] = useState<ExamResource[]>([])
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<ExamResource | null>(null)
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceUrl, setNewResourceUrl] = useState('')
  const [newResourceType, setNewResourceType] = useState<'file' | 'link'>('file')

  // Info Tab states (FAQs, Requirements, Outcomes)
  const [faqs, setFaqs] = useState<Array<{ id?: number; question: string; answer: string; sort?: number }>>([])
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')

  const [requirements, setRequirements] = useState<Array<{ id?: number; requirement: string; sort?: number }>>([])
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false)
  const [newRequirementText, setNewRequirementText] = useState('')

  const [outcomes, setOutcomes] = useState<Array<{ id?: number; outcome: string; sort?: number }>>([])
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false)
  const [newOutcomeText, setNewOutcomeText] = useState('')

  // Thumbnail upload state
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  // Fetch exam
  const fetchExam = async (id: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/exams/${id}`)
      const json = await res.json()
      if (json.success && json.exam) {
        setExam({
          ...json.exam,
          discount: Boolean(json.exam.discount),
          pricing_type: json.exam.pricing_type || 'paid',
          questions: json.exam.questions || [],
        })
        setSelectedStatus(json.exam.status || 'published')
        if (json.exam.resources) setResources(json.exam.resources)
        if (json.exam.faqs) setFaqs(json.exam.faqs)
        if (json.exam.requirements) setRequirements(json.exam.requirements)
        if (json.exam.outcomes) setOutcomes(json.exam.outcomes)
      } else {
        toast.error('Could not load exam data.')
      }
    } catch {
      toast.error('Network error loading exam.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setCurrentUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/exam-categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/instructors?perPage=200')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? data?.instructors ?? [])
        setInstructors(list.map((i: any) => ({ id: i.id, name: i.name || i.user?.name || `Instructor #${i.id}` })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (initialExamId) {
      fetchExam(initialExamId)
    } else {
      setLoading(false)
    }
  }, [initialExamId])

  // Submit exam for review (Instructor)
  const handleSubmitForReview = async () => {
    if (!exam?.id) return
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      if (res.ok) {
        setExam((prev) => (prev ? { ...prev, status: 'published' } : null))
        toast.success('Exam submitted for review!')
      } else {
        toast.error('Failed to submit exam for review.')
      }
    } catch {
      toast.error('Network error submitting exam for review.')
    }
  }

  // Save exam updates
  const handleSaveExam = async (tabName: string) => {
    if (!exam?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...exam,
          resources,
          faqs,
          requirements,
          outcomes,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`Exam ${tabName} updated successfully`)
        if (json.exam) {
          setExam((prev) => ({ ...prev, ...json.exam }))
        }
      } else {
        toast.error(json.message || 'Failed to update exam.')
      }
    } catch {
      toast.error('Error saving exam changes.')
    } finally {
      setSaving(false)
    }
  }

  // Status update
  const handleUpdateStatus = async () => {
    if (!exam?.id) return
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, feedback: statusFeedback }),
      })
      if (res.ok) {
        setExam((prev) => (prev ? { ...prev, status: selectedStatus } : null))
        toast.success(`Exam status updated to ${selectedStatus}`)
        setStatusDialogOpen(false)
      } else {
        toast.error('Failed to change status')
      }
    } catch {
      toast.error('Error changing status')
    }
  }

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !exam?.id) return
    setUploadingThumbnail(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model_id', String(exam.id))
      formData.append('collection_name', 'thumbnail')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok && json.success) {
        setExam((prev) => (prev ? { ...prev, thumbnail: json.url } : null))
        await fetch(`/api/exams/${exam.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnail: json.url }),
        })
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

  // Question modal open for new
  const handleOpenNewQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({
      title: '',
      description: '',
      question_type: 'multiple_choice',
      marks: 10,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
      matches: [
        { question: '', answer: '' },
        { question: '', answer: '' },
      ],
      answers: [''],
      items: ['', '', ''],
      sample_answer: '',
      audio_url: '',
      audio_instructions: '',
    })
    setQuestionDialogOpen(true)
  }

  // Question modal open for edit
  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q)
    const opts = q.question_options || q.options || []
    const rawOpts = q.options || {}
    setQuestionForm({
      title: q.title,
      description: q.description || '',
      question_type: (q.question_type as ExamQuestionType) || 'multiple_choice',
      marks: q.marks || 10,
      options: Array.isArray(opts) && opts.length > 0
        ? opts.map((o: any) => ({ option_text: o.option_text || '', is_correct: Boolean(o.is_correct) }))
        : [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
          ],
      matches: rawOpts.matches || [
        { question: '', answer: '' },
        { question: '', answer: '' },
      ],
      answers: rawOpts.answers || [''],
      items: rawOpts.items || ['', '', ''],
      sample_answer: rawOpts.sample_answer || '',
      audio_url: rawOpts.audio_url || '',
      audio_instructions: rawOpts.instructions || '',
    })
    setQuestionDialogOpen(true)
  }

  // Question submit
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exam?.id || !questionForm.title.trim()) return

    const validOptions = questionForm.options.filter((o) => o.option_text.trim().length > 0)
    const isOptionsType =
      questionForm.question_type === 'multiple_choice' ||
      questionForm.question_type === 'multiple_select'

    if (isOptionsType && validOptions.length < 2) {
      toast.error('Please provide at least 2 option choices.')
      return
    }

    // Build options payload for non-choice types
    let payloadOptions: any = validOptions.map((o) => ({
      option_text: o.option_text,
      is_correct: o.is_correct ? 1 : 0,
    }))

    if (questionForm.question_type === 'matching') {
      payloadOptions = { matches: questionForm.matches.filter((m) => m.question && m.answer) }
    } else if (questionForm.question_type === 'fill_blank') {
      payloadOptions = { answers: questionForm.answers.filter((a) => a.trim()) }
    } else if (questionForm.question_type === 'ordering') {
      payloadOptions = { items: questionForm.items.filter((i) => i.trim()) }
    } else if (questionForm.question_type === 'short_answer') {
      payloadOptions = { sample_answer: questionForm.sample_answer }
    } else if (questionForm.question_type === 'listening') {
      payloadOptions = { audio_url: questionForm.audio_url, instructions: questionForm.audio_instructions }
    }

    try {
      if (editingQuestion) {
        // Edit existing question
        const res = await fetch(`/api/instructor/exams/${exam.id}/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: questionForm.title,
            description: questionForm.description,
            question_type: questionForm.question_type,
            marks: Number(questionForm.marks),
            options: payloadOptions,
          }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          toast.success('Question updated successfully')
          setQuestionDialogOpen(false)
          fetchExam(exam.id)
        } else {
          const errorMsg = json.message || (json.errors ? Object.values(json.errors).flat()[0] : null) || 'Failed to update question.'
          toast.error(String(errorMsg))
        }
      } else {
        // Create new question
        const res = await fetch(`/api/instructor/exams/${exam.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: questionForm.title,
            description: questionForm.description,
            question_type: questionForm.question_type,
            marks: Number(questionForm.marks),
            options: payloadOptions,
          }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          toast.success('Question added successfully')
          setQuestionDialogOpen(false)
          fetchExam(exam.id)
        } else {
          toast.error(json.message || 'Failed to add question.')
        }
      }
    } catch {
      toast.error('Error saving question.')
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: number) => {
    if (!exam?.id || !confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch(`/api/instructor/exams/${exam.id}/questions/${questionId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Question deleted successfully')
        fetchExam(exam.id)
      } else {
        toast.error('Failed to delete question.')
      }
    } catch {
      toast.error('Error deleting question.')
    }
  }

  // Duplicate question
  const handleDuplicateQuestion = async (questionId: number) => {
    if (!exam?.id) return
    const q = exam.questions?.find((item) => item.id === questionId)
    if (!q) return
    try {
      const opts = q.question_options || q.options || []
      const res = await fetch(`/api/instructor/exams/${exam.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${q.title} (Copy)`,
          description: q.description,
          question_type: q.question_type,
          marks: q.marks,
          options: Array.isArray(opts)
            ? opts.map((o: any) => ({
                option_text: o.option_text,
                is_correct: o.is_correct ? 1 : 0,
              }))
            : opts,
        }),
      })
      if (res.ok) {
        toast.success('Question duplicated successfully')
        fetchExam(exam.id)
      }
    } catch {
      toast.error('Error duplicating question.')
    }
  }

  // Resources
  const handleOpenNewResource = () => {
    setEditingResource(null)
    setNewResourceTitle('')
    setNewResourceUrl('')
    setNewResourceType('file')
    setResourceDialogOpen(true)
  }

  const handleOpenEditResource = (resItem: ExamResource) => {
    setEditingResource(resItem)
    setNewResourceTitle(resItem.title)
    setNewResourceUrl(resItem.resource)
    setNewResourceType((resItem.type as 'file' | 'link') || 'file')
    setResourceDialogOpen(true)
  }

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return

    if (editingResource) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingResource.id
            ? { ...r, title: newResourceTitle, resource: newResourceUrl, type: newResourceType }
            : r
        )
      )
      toast.success('Resource updated. Click Save Changes to persist.')
    } else {
      const newRes: ExamResource = {
        id: Date.now(),
        title: newResourceTitle,
        resource: newResourceUrl,
        type: newResourceType,
      }
      setResources((prev) => [...prev, newRes])
      toast.success('Resource added. Click Save Changes to persist.')
    }

    setNewResourceTitle('')
    setNewResourceUrl('')
    setResourceDialogOpen(false)
  }

  const handleDeleteResource = (resId: number) => {
    setResources((prev) => prev.filter((r) => r.id !== resId))
    toast.success('Resource deleted successfully.')
  }

  // Info Tab Handlers (FAQs, Requirements, Outcomes)
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFaqQ.trim() || !newFaqA.trim()) return
    setFaqs((prev) => [...prev, { id: Date.now(), question: newFaqQ.trim(), answer: newFaqA.trim(), sort: prev.length }])
    setNewFaqQ('')
    setNewFaqA('')
    setFaqDialogOpen(false)
    toast.success('FAQ added. Click Save Changes to persist.')
  }

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRequirementText.trim()) return
    setRequirements((prev) => [...prev, { id: Date.now(), requirement: newRequirementText.trim(), sort: prev.length }])
    setNewRequirementText('')
    setRequirementDialogOpen(false)
    toast.success('Requirement added. Click Save Changes to persist.')
  }

  const handleAddOutcome = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOutcomeText.trim()) return
    setOutcomes((prev) => [...prev, { id: Date.now(), outcome: newOutcomeText.trim(), sort: prev.length }])
    setNewOutcomeText('')
    setOutcomeDialogOpen(false)
    toast.success('Learning outcome added. Click Save Changes to persist.')
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading Exam Manager...</span>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Exam Not Found</h2>
        <p className="mt-2 text-muted-foreground">The requested exam could not be retrieved.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/exams">Back to Exams</Link>
        </Button>
      </div>
    )
  }

  // Exact 8 tabs matching Laravel update.tsx
  const tabs = [
    { name: 'Questions', slug: 'questions', Icon: HelpCircle },
    { name: 'Resources', slug: 'resources', Icon: ListTodo },
    { name: 'Basic', slug: 'basic', Icon: Settings },
    { name: 'Pricing', slug: 'pricing', Icon: CircleDollarSign },
    { name: 'Settings', slug: 'settings', Icon: BookText },
    { name: 'Info', slug: 'info', Icon: FileText },
    { name: 'Media', slug: 'media', Icon: FolderInput },
    { name: 'SEO', slug: 'seo', Icon: FlaskConical },
  ]

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'multiple_select', label: 'Multiple Select' },
    { value: 'matching', label: 'Matching' },
    { value: 'fill_blank', label: 'Fill in the Blank' },
    { value: 'ordering', label: 'Ordering' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'listening', label: 'Listening' },
  ]

  const questionsList = exam.questions || []
  const totalQuestions = questionsList.length
  const totalMarks = questionsList.reduce((acc, q) => acc + (Number(q.marks) || 0), 0) || exam.total_marks || 0

  return (
    <section className="space-y-6">
      {/* Breadcrumbs with Action Header matching Laravel exam-update-header */}
      <Breadcrumbs
        title="Manage Exam Contents"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Exams', href: '/dashboard/exams' },
          { title: exam.title || 'Questions' },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* View Exam Button */}
            <Button asChild className="bg-black text-white hover:bg-neutral-800 h-9 px-4">
              <Link href={`/exams/${exam.slug || exam.id}`} target="_blank">
                View Exam
              </Link>
            </Button>

            {/* Status Button (Approved / Published / Draft) */}
            <Button
              className={cn(
                'capitalize h-9 px-4',
                exam.status === 'published' || exam.status === 'approved'
                  ? 'bg-emerald-700/80 hover:bg-emerald-700 text-white'
                  : exam.status === 'archived'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
              )}
              disabled
            >
              {exam.status === 'approved' ? 'Approved' : exam.status || 'Draft'}
            </Button>

            {/* Instructor Submit for Review */}
            {currentUser?.role === 'instructor' && exam.status !== 'published' && (
              <Button
                type="button"
                onClick={handleSubmitForReview}
                className="bg-black text-white hover:bg-neutral-800 h-9 px-4"
              >
                Submit for Review
              </Button>
            )}

            {/* Admin Change Status Button & Dialog */}
            {currentUser?.role === 'admin' && (
              <>
                <Button
                  type="button"
                  onClick={() => setStatusDialogOpen(true)}
                  className="bg-black text-white hover:bg-neutral-800 capitalize h-9 px-4"
                >
                  Change Status
                </Button>

                <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Change Exam Status
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-3">
                      <div>
                        <Label className="text-sm font-semibold">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-full capitalize mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published" className="capitalize">Published</SelectItem>
                            <SelectItem value="approved" className="capitalize">Approved</SelectItem>
                            <SelectItem value="draft" className="capitalize">Draft</SelectItem>
                            <SelectItem value="archived" className="capitalize">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Feedback (Optional)</Label>
                        <Textarea
                          rows={3}
                          placeholder="Enter feedback for instructor..."
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
              </>
            )}
          </div>
        }
        className="mb-4"
      />

      {/* Main Grid: Left Nav Sidebar (1 col) + Right Content (3 cols) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val)
        }}
        className="grid grid-rows-1 gap-5 md:grid-cols-4"
      >
        {/* Left Navigation: Exactly matching Laravel horizontal-tabs-list */}
        <div className="col-span-full md:col-span-1">
          <TabsList className="horizontal-tabs-list space-y-1 w-full grid! h-auto!">
            {tabs.map(({ name, slug, Icon }) => (
              <TabsTrigger
                key={slug}
                value={slug}
                className="horizontal-tabs-trigger w-full"
                onClick={() => setActiveTab(slug)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right Content Panel */}
        <div className="col-span-full md:col-span-3">
          {/* TAB 1: QUESTIONS (1:1 with Laravel questions.tsx & Screenshot 3) */}
          <TabsContent value="questions" className="m-0 space-y-4">
            {/* Questions Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exam Questions</h3>
                <p className="text-sm text-muted-foreground">
                  {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'} • Total: {Number(totalMarks).toFixed(2)} marks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-9"
                  onClick={() => toast.info('Questions are sorted by order index.')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Reorder
                </Button>
                <Button
                  onClick={handleOpenNewQuestion}
                  className="bg-black text-white hover:bg-neutral-800 flex items-center gap-2 h-9"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* Questions List */}
            {totalQuestions === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 dark:bg-muted p-6">
                    <HelpCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">No Questions Yet</h3>
                  <p className="mb-6 max-w-md text-sm text-muted-foreground">
                    Start building your exam by adding questions. You can create multiple choice, short answer, and many other question types.
                  </p>
                  <Button onClick={handleOpenNewQuestion} className="bg-black text-white hover:bg-neutral-800 gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {questionsList.map((question, index) => {
                  const opts = question.question_options || (Array.isArray(question.options) ? question.options : [])

                  return (
                    <Card key={question.id} className="transition-shadow hover:shadow-md border border-border">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              Q{index + 1}
                            </span>
                            <QuestionTypeBadge type={question.question_type} />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {Number(question.marks).toFixed(2)} marks
                            </span>
                          </div>

                          {/* Action Popover */}
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
                                onClick={() => handleDuplicateQuestion(question.id)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Duplicate</span>
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-8 w-full justify-start text-xs gap-2 font-normal"
                                onClick={() => handleOpenEditQuestion(question)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-8 w-full justify-start text-xs gap-2 font-normal text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <h4 className="mt-4 mb-1 font-medium text-foreground">{question.title}</h4>
                        {question.description ? (
                          <div
                            className="text-sm text-muted-foreground mb-2 prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: question.description }}
                          />
                        ) : null}

                        {/* Show options for multiple choice / multiple select matching Screenshot 3 */}
                        {(question.question_type === 'multiple_choice' || question.question_type === 'multiple_select') &&
                          opts.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                              {opts.map((option: any, oIdx: number) => {
                                const isCorrect = Boolean(option.is_correct)
                                return (
                                  <div key={option.id || oIdx} className="flex items-center gap-2 text-sm">
                                    {isCorrect ? (
                                      <CircleCheck strokeWidth={3} className="h-4 w-4 text-green-500 shrink-0" />
                                    ) : (
                                      <Circle strokeWidth={3} className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                                    )}
                                    <span
                                      className={
                                        isCorrect
                                          ? 'font-medium text-green-700 dark:text-green-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }
                                    >
                                      {option.option_text}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                        {/* Show matching pairs */}
                        {question.question_type === 'matching' && question.options?.matches && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-500">Matching Pairs:</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {question.options.matches.map((match: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 rounded-md bg-gray-50 dark:bg-muted p-2 text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">{match.question}</span>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium text-green-600 dark:text-green-400">{match.answer}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show fill blank answers */}
                        {question.question_type === 'fill_blank' && question.options?.answers && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-gray-500">Accepted Answers:</p>
                            <div className="flex flex-wrap gap-2">
                              {question.options.answers.map((answer: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-md bg-green-50 dark:bg-green-950/40 px-2 py-1 text-sm font-medium text-green-700 dark:text-green-400"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {answer}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show ordering items */}
                        {question.question_type === 'ordering' && question.options?.items && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-gray-500">Correct Order:</p>
                            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {question.options.items.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Show short answer sample */}
                        {question.question_type === 'short_answer' && question.options?.sample_answer && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-gray-500">Guidelines:</p>
                            <p className="rounded-md bg-gray-50 dark:bg-muted p-2 text-sm text-gray-700 dark:text-gray-300">
                              {question.options.sample_answer}
                            </p>
                          </div>
                        )}

                        {/* Show listening info */}
                        {question.question_type === 'listening' && (
                          <div className="mt-3 space-y-2">
                            {question.options?.audio_url && (
                              <audio controls className="h-11 w-full">
                                <source src={question.options.audio_url} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                            {question.options?.instructions && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-gray-500">Instructions:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{question.options.instructions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Question Dialog (Create / Edit) - 1:1 Matching Screenshot 2 & Laravel question-dialog.tsx */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create Question'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveQuestion} className="space-y-6 pt-2">
                  {/* Row 1: Question Type & Marks */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label>Question Type *</Label>
                      <Select
                        value={questionForm.question_type}
                        onValueChange={(value: ExamQuestionType) =>
                          setQuestionForm((p) => ({ ...p, question_type: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="q-marks">Marks *</Label>
                      <Input
                        id="q-marks"
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={questionForm.marks}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, marks: Number(e.target.value) }))}
                        placeholder="Enter marks"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Question Title */}
                  <div>
                    <Label htmlFor="q-title">Question Title *</Label>
                    <Input
                      id="q-title"
                      placeholder="Enter question title"
                      value={questionForm.title}
                      onChange={(e) => setQuestionForm((p) => ({ ...p, title: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>

                  {/* Row 3: Description (Optional) with TipTap RichEditor */}
                  <div>
                    <Label>Description (Optional)</Label>
                    <div className="mt-1">
                      <RichEditor
                        value={questionForm.description}
                        onChange={(html) => setQuestionForm((p) => ({ ...p, description: html }))}
                        placeholder="Add additional context or instructions..."
                        minHeight={150}
                      />
                    </div>
                  </div>

                  {/* Row 4: Question Type specific form (Multiple Choice & Multiple Select matching Screenshot 2) */}
                  {(questionForm.question_type === 'multiple_choice' || questionForm.question_type === 'multiple_select') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Answer Options *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              options: [...p.options, { option_text: '', is_correct: false }],
                            }))
                          }
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Option
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {questionForm.question_type === 'multiple_select'
                          ? 'Check all correct answers (students can select multiple options)'
                          : 'Select the correct answer (students can select only one)'}
                      </p>

                      <div className="space-y-3">
                        {questionForm.options.map((option, index) => {
                          const isMultiple = questionForm.question_type === 'multiple_select'

                          return (
                            <div key={index} className="flex items-start gap-3">
                              {isMultiple ? (
                                <Checkbox
                                  checked={Boolean(option.is_correct)}
                                  onCheckedChange={(checked) => {
                                    setQuestionForm((p) => ({
                                      ...p,
                                      options: p.options.map((opt, i) =>
                                        i === index ? { ...opt, is_correct: checked === true } : opt
                                      ),
                                    }))
                                  }}
                                  className="mt-3"
                                />
                              ) : (
                                <RadioGroup
                                  value={questionForm.options.findIndex((opt) => opt.is_correct).toString()}
                                  onValueChange={(val) => {
                                    const selectedIdx = parseInt(val, 10)
                                    setQuestionForm((p) => ({
                                      ...p,
                                      options: p.options.map((opt, i) => ({
                                        ...opt,
                                        is_correct: i === selectedIdx,
                                      })),
                                    }))
                                  }}
                                >
                                  <RadioGroupItem value={index.toString()} className="mt-3" />
                                </RadioGroup>
                              )}

                              <div className="flex-1">
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={option.option_text}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setQuestionForm((p) => ({
                                      ...p,
                                      options: p.options.map((opt, i) =>
                                        i === index ? { ...opt, option_text: val } : opt
                                      ),
                                    }))
                                  }}
                                  className={option.is_correct ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : ''}
                                />
                              </div>

                              {questionForm.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setQuestionForm((p) => ({
                                      ...p,
                                      options: p.options.filter((_, i) => i !== index),
                                    }))
                                  }
                                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {questionForm.options.length > 0 && !questionForm.options.some((opt) => opt.is_correct) && (
                        <p className="text-sm text-amber-600">
                          ⚠️ Please mark at least one option as correct
                        </p>
                      )}
                    </div>
                  )}

                  {/* Matching Form */}
                  {questionForm.question_type === 'matching' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Matching Pairs *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              matches: [...p.matches, { question: '', answer: '' }],
                            }))
                          }
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Pair
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {questionForm.matches.map((match, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-3">
                            <Input
                              placeholder={`Question ${mIdx + 1}`}
                              value={match.question}
                              onChange={(e) => {
                                const val = e.target.value
                                setQuestionForm((p) => ({
                                  ...p,
                                  matches: p.matches.map((m, i) => (i === mIdx ? { ...m, question: val } : m)),
                                }))
                              }}
                              className="flex-1"
                            />
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                              placeholder={`Answer ${mIdx + 1}`}
                              value={match.answer}
                              onChange={(e) => {
                                const val = e.target.value
                                setQuestionForm((p) => ({
                                  ...p,
                                  matches: p.matches.map((m, i) => (i === mIdx ? { ...m, answer: val } : m)),
                                }))
                              }}
                              className="flex-1 border-green-500 bg-green-50/40 dark:bg-green-950/20"
                            />
                            {questionForm.matches.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setQuestionForm((p) => ({
                                    ...p,
                                    matches: p.matches.filter((_, i) => i !== mIdx),
                                  }))
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fill in Blank Form */}
                  {questionForm.question_type === 'fill_blank' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Accepted Answers *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              answers: [...p.answers, ''],
                            }))
                          }
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Answer
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {questionForm.answers.map((ans, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-3">
                            <Input
                              placeholder={`Accepted answer ${aIdx + 1}`}
                              value={ans}
                              onChange={(e) => {
                                const val = e.target.value
                                setQuestionForm((p) => ({
                                  ...p,
                                  answers: p.answers.map((a, i) => (i === aIdx ? val : a)),
                                }))
                              }}
                              className="flex-1 border-green-500 bg-green-50/40 dark:bg-green-950/20"
                            />
                            {questionForm.answers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setQuestionForm((p) => ({
                                    ...p,
                                    answers: p.answers.filter((_, i) => i !== aIdx),
                                  }))
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ordering Form */}
                  {questionForm.question_type === 'ordering' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Ordering Items (In Correct Sequence) *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuestionForm((p) => ({
                              ...p,
                              items: [...p.items, ''],
                            }))
                          }
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {questionForm.items.map((item, itIdx) => (
                          <div key={itIdx} className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-500 w-6">{itIdx + 1}.</span>
                            <Input
                              placeholder={`Step ${itIdx + 1}`}
                              value={item}
                              onChange={(e) => {
                                const val = e.target.value
                                setQuestionForm((p) => ({
                                  ...p,
                                  items: p.items.map((it, i) => (i === itIdx ? val : it)),
                                }))
                              }}
                              className="flex-1"
                            />
                            {questionForm.items.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setQuestionForm((p) => ({
                                    ...p,
                                    items: p.items.filter((_, i) => i !== itIdx),
                                  }))
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer Form */}
                  {questionForm.question_type === 'short_answer' && (
                    <div className="space-y-3">
                      <Label>Evaluation Guidelines / Sample Answer</Label>
                      <Textarea
                        rows={3}
                        placeholder="Provide criteria or acceptable responses for grading..."
                        value={questionForm.sample_answer}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, sample_answer: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Listening Form */}
                  {questionForm.question_type === 'listening' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Audio URL</Label>
                        <Input
                          placeholder="https://... audio file URL"
                          value={questionForm.audio_url}
                          onChange={(e) => setQuestionForm((p) => ({ ...p, audio_url: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Listening Instructions</Label>
                        <Textarea
                          rows={2}
                          placeholder="Instructions for candidate before playing audio..."
                          value={questionForm.audio_instructions}
                          onChange={(e) => setQuestionForm((p) => ({ ...p, audio_instructions: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer buttons matching Laravel */}
                  <div className="flex justify-end gap-3 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black text-white hover:bg-neutral-800">
                      {editingQuestion ? 'Update Question' : 'Create Question'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB 2: RESOURCES (1:1 with Laravel resources.tsx & Screenshot 4) */}
          <TabsContent value="resources" className="m-0 space-y-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exam Resources</h3>
                <p className="text-sm text-muted-foreground">Exam Resources List</p>
              </div>

              <Button onClick={handleOpenNewResource} className="bg-black text-white hover:bg-neutral-800 gap-2">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </div>

            <Card className="space-y-4 p-5 shadow-none border border-border">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div key={resource.id} className="rounded-md border border-border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-full px-1">
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={resource.resource}
                          className="cursor-pointer text-sm font-medium hover:underline text-foreground"
                        >
                          {resource.title.slice(0, 50) + (resource.title.length > 50 ? '...' : '')}
                        </a>
                      </div>

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
                            onClick={() => handleOpenEditResource(resource)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                          <Button asChild variant="ghost" className="h-8 w-full justify-start text-xs gap-2 font-normal">
                            <a target="_blank" rel="noreferrer" href={resource.resource}>
                              {resource.type === 'link' ? (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </>
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </>
                              )}
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-full justify-start text-xs gap-2 font-normal text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md p-1.5">
                  <div className="w-full px-1 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No resources available</p>
                  </div>
                </div>
              )}
            </Card>

            <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingResource ? 'Update Exam Resource' : 'Add New Exam Resource'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveResource} className="space-y-4 pt-2">
                  <div>
                    <Label>Resource Type</Label>
                    <Select
                      value={newResourceType}
                      onValueChange={(val: 'file' | 'link') => setNewResourceType(val)}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file">File (PDF / Document)</SelectItem>
                        <SelectItem value="link">Web Link / URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="res-title">Resource Title *</Label>
                    <Input
                      id="res-title"
                      placeholder="Enter resource title"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="res-url">Resource Link / URL *</Label>
                    <Input
                      id="res-url"
                      placeholder="https://... or file url"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setResourceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black text-white hover:bg-neutral-800">
                      {editingResource ? 'Update Resource' : 'Add Resource'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSaveExam('Resources')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: BASIC (1:1 with Laravel basic.tsx & Screenshot 5) */}
          <TabsContent value="basic" className="m-0 space-y-4">
            <Card className="container p-4 sm:p-6 space-y-4 border border-border">
              <div>
                <Label htmlFor="exam-title">Exam Title *</Label>
                <Input
                  id="exam-title"
                  value={exam.title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, title: e.target.value } : null))}
                  placeholder="Enter exam title"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="exam-sdesc">Short Description</Label>
                <Textarea
                  id="exam-sdesc"
                  rows={4}
                  value={exam.short_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, short_description: e.target.value } : null))}
                  placeholder="Brief description for exam cards"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <div className="mt-1">
                  <RichEditor
                    value={exam.description || ''}
                    onChange={(html) => setExam((p) => (p ? { ...p, description: html } : null))}
                    placeholder="Enter detailed exam description..."
                    minHeight={256}
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <Label>Exam Instructor *</Label>
                <Select
                  value={(exam as any).instructor_id ? String((exam as any).instructor_id) : ''}
                  onValueChange={(val) => setExam((p) => (p ? { ...p, instructor_id: val } as any : null))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((inst) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={exam.exam_category_id ? String(exam.exam_category_id) : '1'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, exam_category_id: val } : null))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty Level *</Label>
                  <Select
                    value={exam.level || 'intermediate'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, level: val } : null))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner" className="capitalize">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="capitalize">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="capitalize">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status *</Label>
                  <Select
                    value={exam.status || 'draft'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, status: val } : null))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" className="capitalize">Draft</SelectItem>
                      <SelectItem value="published" className="capitalize">Published</SelectItem>
                      <SelectItem value="approved" className="capitalize">Approved</SelectItem>
                      <SelectItem value="archived" className="capitalize">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Basic')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PRICING (1:1 with Laravel pricing.tsx) */}
          <TabsContent value="pricing" className="m-0 space-y-4">
            <Card className="container p-4 sm:p-6 space-y-4 border border-border">
              <div>
                <Label>Pricing Type *</Label>
                <RadioGroup
                  value={exam.pricing_type || 'paid'}
                  onValueChange={(val) => setExam((p) => (p ? { ...p, pricing_type: val as 'free' | 'paid' } : null))}
                  className="flex items-center space-x-4 pt-2 pb-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="pricing-paid" />
                    <Label htmlFor="pricing-paid" className="cursor-pointer mb-0 capitalize">Paid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="pricing-free" />
                    <Label htmlFor="pricing-free" className="cursor-pointer mb-0 capitalize">Free</Label>
                  </div>
                </RadioGroup>
              </div>

              {exam.pricing_type === 'paid' && (
                <div className="space-y-4 pt-2 border-t">
                  <div>
                    <Label htmlFor="exam-price">Price *</Label>
                    <Input
                      id="exam-price"
                      type="number"
                      value={exam.price || ''}
                      onChange={(e) => setExam((p) => (p ? { ...p, price: e.target.value } : null))}
                      placeholder="Enter your exam price ($0)"
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exam-discount-check"
                        checked={Boolean(exam.discount)}
                        onCheckedChange={(checked) =>
                          setExam((p) => (p ? { ...p, discount: Boolean(checked) } : null))
                        }
                      />
                      <Label htmlFor="exam-discount-check" className="cursor-pointer mb-0">
                        Discounted Price
                      </Label>
                    </div>

                    {exam.discount && (
                      <Input
                        type="number"
                        placeholder="Enter discount price"
                        value={exam.discount_price || ''}
                        onChange={(e) =>
                          setExam((p) => (p ? { ...p, discount_price: e.target.value } : null))
                        }
                        className="mt-1"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>Expiry period type</Label>
                  <RadioGroup
                    value={exam.expiry_type || 'lifetime'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, expiry_type: val } : null))}
                    className="flex items-center space-x-4 pt-2 pb-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lifetime" id="exp-lifetime" />
                      <Label htmlFor="exp-lifetime" className="cursor-pointer mb-0">Lifetime</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited_time" id="exp-limited" />
                      <Label htmlFor="exp-limited" className="cursor-pointer mb-0">Limited Time</Label>
                    </div>
                  </RadioGroup>
                </div>

                {exam.expiry_type === 'limited_time' && (
                  <div>
                    <Label htmlFor="exp-duration">Expiry Duration</Label>
                    <Select
                      value={exam.expiry_duration || '3 months'}
                      onValueChange={(val) => setExam((p) => (p ? { ...p, expiry_duration: val } : null))}
                    >
                      <SelectTrigger id="exp-duration" className="w-full mt-1">
                        <SelectValue placeholder="Select expiry duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 month">1 Month</SelectItem>
                        <SelectItem value="2 months">2 Months</SelectItem>
                        <SelectItem value="3 months">3 Months</SelectItem>
                        <SelectItem value="6 months">6 Months</SelectItem>
                        <SelectItem value="1 year">1 Year</SelectItem>
                        <SelectItem value="2 years">2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Pricing')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: SETTINGS (1:1 with Laravel settings.tsx) */}
          <TabsContent value="settings" className="m-0 space-y-4">
            <Card className="container p-4 sm:p-6 space-y-4 border border-border">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="dur-hours">Duration (Hours) *</Label>
                  <Input
                    id="dur-hours"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={exam.duration_hours || 1}
                    onChange={(e) => setExam((p) => (p ? { ...p, duration_hours: Number(e.target.value) } : null))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dur-mins">Duration (Minutes) *</Label>
                  <Input
                    id="dur-mins"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={exam.duration_minutes || 0}
                    onChange={(e) => setExam((p) => (p ? { ...p, duration_minutes: Number(e.target.value) } : null))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="pass-mark">Pass Mark *</Label>
                  <Input
                    id="pass-mark"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={exam.pass_mark || 50}
                    onChange={(e) => setExam((p) => (p ? { ...p, pass_mark: Number(e.target.value) } : null))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">Students must score this percentage to pass</p>
                </div>

                <div>
                  <Label htmlFor="max-attempts">Max Attempts *</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={exam.max_attempts || 3}
                    onChange={(e) => setExam((p) => (p ? { ...p, max_attempts: Number(e.target.value) } : null))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum number of attempts allowed per student</p>
                </div>

                <div>
                  <Label htmlFor="total-marks">Total Marks *</Label>
                  <Input
                    id="total-marks"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={exam.total_marks || 100}
                    onChange={(e) => setExam((p) => (p ? { ...p, total_marks: Number(e.target.value) } : null))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">Total marks for the entire exam</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Settings')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 6: INFO (1:1 with Laravel info.tsx) */}
          <TabsContent value="info" className="m-0 space-y-4">
            <Card className="space-y-7 p-4 sm:p-6 border border-border">
              {/* FAQs Section */}
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <h6 className="w-[200px] font-medium text-foreground">Exam FAQs</h6>
                <div className="w-full space-y-6">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setFaqDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </Button>
                  {faqs.map((faq, fIdx) => (
                    <div key={faq.id || fIdx} className="rounded-lg border p-4 bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">FAQ #{fIdx + 1}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== fIdx))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const val = e.target.value
                          setFaqs((prev) => prev.map((item, i) => (i === fIdx ? { ...item, question: val } : item)))
                        }}
                        placeholder="Enter FAQ question..."
                      />
                      <Textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const val = e.target.value
                          setFaqs((prev) => prev.map((item, i) => (i === fIdx ? { ...item, answer: val } : item)))
                        }}
                        placeholder="Enter FAQ answer..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Requirements Section */}
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <h6 className="w-[200px] font-medium text-foreground">Requirements</h6>
                <div className="w-full space-y-6">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setRequirementDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </Button>
                  {requirements.map((req, rIdx) => (
                    <div key={req.id || rIdx} className="flex items-center gap-2">
                      <Input
                        value={req.requirement}
                        onChange={(e) => {
                          const val = e.target.value
                          setRequirements((prev) => prev.map((item, i) => (i === rIdx ? { ...item, requirement: val } : item)))
                        }}
                        placeholder="e.g. Basic knowledge of cloud computing"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== rIdx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Learning Outcomes Section */}
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <h6 className="w-[200px] font-medium text-foreground">Learning Outcomes</h6>
                <div className="w-full space-y-6">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setOutcomeDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Outcome
                  </Button>
                  {outcomes.map((out, oIdx) => (
                    <div key={out.id || oIdx} className="flex items-center gap-2">
                      <Input
                        value={out.outcome}
                        onChange={(e) => {
                          const val = e.target.value
                          setOutcomes((prev) => prev.map((item, i) => (i === oIdx ? { ...item, outcome: val } : item)))
                        }}
                        placeholder="e.g. Design fault-tolerant cloud architecture"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => setOutcomes((prev) => prev.filter((_, i) => i !== oIdx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add FAQ Dialog */}
              <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Exam FAQ</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddFaq} className="space-y-4 pt-2">
                    <div>
                      <Label>Question *</Label>
                      <Input
                        placeholder="e.g. Can I retake this exam if I fail?"
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Answer *</Label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Yes, you can retake the exam up to the maximum attempts allowed."
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Add FAQ</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Requirement Dialog */}
              <Dialog open={requirementDialogOpen} onOpenChange={setRequirementDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Requirement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddRequirement} className="space-y-4 pt-2">
                    <div>
                      <Label>Requirement *</Label>
                      <Input
                        placeholder="e.g. Completion of foundational web coursework"
                        value={newRequirementText}
                        onChange={(e) => setNewRequirementText(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setRequirementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Add Requirement</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Outcome Dialog */}
              <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Learning Outcome</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddOutcome} className="space-y-4 pt-2">
                    <div>
                      <Label>Learning Outcome *</Label>
                      <Input
                        placeholder="e.g. Mastery of modern full-stack development"
                        value={newOutcomeText}
                        onChange={(e) => setNewOutcomeText(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setOutcomeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-black text-white hover:bg-neutral-800">Add Outcome</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Info')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 7: MEDIA (1:1 with Laravel media.tsx) */}
          <TabsContent value="media" className="m-0 space-y-4">
            <Card className="container p-4 sm:p-6 space-y-4 border border-border">
              <div>
                <Label>Thumbnail</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingThumbnail}
                  onChange={handleThumbnailUpload}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 400x300px. Max size: 2MB
                </p>

                {exam.thumbnail && (
                  <div className="mt-4">
                    <Label className="mb-2 block font-medium">Preview:</Label>
                    <img
                      src={exam.thumbnail || '/assets/images/blank-image.jpg'}
                      alt="Thumbnail preview"
                      className="w-full max-w-sm rounded-md border object-cover aspect-video"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Media')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 8: SEO (1:1 with Laravel seo.tsx) */}
          <TabsContent value="seo" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4 border border-border">
              <div>
                <Label htmlFor="seo-meta-title">Meta Title</Label>
                <Input
                  id="seo-meta-title"
                  name="meta_title"
                  placeholder="Enter meta title for SEO"
                  value={exam.meta_title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_title: e.target.value } : null))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="seo-meta-kw">Meta Keywords</Label>
                <Textarea
                  id="seo-meta-kw"
                  rows={3}
                  name="meta_keywords"
                  placeholder="Enter meta keywords separated by commas"
                  value={exam.meta_keywords || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_keywords: e.target.value } : null))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="seo-meta-desc">Meta Description</Label>
                <Textarea
                  id="seo-meta-desc"
                  rows={3}
                  name="meta_description"
                  placeholder="Enter meta description for search engines"
                  value={exam.meta_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_description: e.target.value } : null))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="seo-og-title">OG Title</Label>
                <Input
                  id="seo-og-title"
                  name="og_title"
                  placeholder="Enter Open Graph title"
                  value={exam.og_title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, og_title: e.target.value } : null))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="seo-og-desc">OG Description</Label>
                <Textarea
                  id="seo-og-desc"
                  rows={3}
                  name="og_description"
                  placeholder="Enter Open Graph description for social media"
                  value={exam.og_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, og_description: e.target.value } : null))}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('SEO')} disabled={saving} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
