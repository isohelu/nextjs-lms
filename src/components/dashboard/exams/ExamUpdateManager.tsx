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
  Circle,
  CircleCheck,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Save,
  MoreVertical,
  Download,
  BadgeCheck,
  CheckSquare,
} from 'lucide-react'

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
  question_type: string
  marks: number
  options?: QuestionOption[]
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

export default function ExamUpdateManager({ initialExamId, initialTab = 'basic' }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exam, setExam] = useState<ExamData | null>(null)
  const [categories, setCategories] = useState<{ id: number; title: string }[]>([])
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([])

  // Status Dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('published')
  const [statusFeedback, setStatusFeedback] = useState('')

  // Question Dialog states
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    question_type: 'multiple_choice',
    marks: 2,
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  })

  // Resource Dialog states
  const [resources, setResources] = useState<ExamResource[]>([])
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
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
        toast.success(`${tabName} updated successfully!`)
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
      marks: 2,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    })
    setQuestionDialogOpen(true)
  }

  // Question modal open for edit
  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q)
    const opts = q.question_options || q.options || []
    setQuestionForm({
      title: q.title,
      description: q.description || '',
      question_type: q.question_type || 'multiple_choice',
      marks: q.marks || 2,
      options: opts.length > 0
        ? opts.map((o) => ({ option_text: o.option_text, is_correct: Boolean(o.is_correct) }))
        : [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
          ],
    })
    setQuestionDialogOpen(true)
  }

  // Question submit
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exam?.id || !questionForm.title.trim()) return

    const validOptions = questionForm.options.filter((o) => o.option_text.trim().length > 0)
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 option choices.')
      return
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
            options: validOptions.map((o) => ({
              option_text: o.option_text,
              is_correct: o.is_correct ? 1 : 0,
            })),
          }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          toast.success('Question updated!')
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
            options: validOptions.map((o) => ({
              option_text: o.option_text,
              is_correct: o.is_correct ? 1 : 0,
            })),
          }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          toast.success('Question added!')
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
        toast.success('Question removed.')
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
          options: opts.map((o) => ({
            option_text: o.option_text,
            is_correct: o.is_correct ? 1 : 0,
          })),
        }),
      })
      if (res.ok) {
        toast.success('Question duplicated!')
        fetchExam(exam.id)
      }
    } catch {
      toast.error('Error duplicating question.')
    }
  }

  // Resources
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return
    const newRes: ExamResource = {
      id: Date.now(),
      title: newResourceTitle,
      resource: newResourceUrl,
      type: newResourceType,
    }
    setResources((prev) => [...prev, newRes])
    setNewResourceTitle('')
    setNewResourceUrl('')
    setResourceDialogOpen(false)
    toast.success('Resource added. Click Save Changes to persist.')
  }

  const handleDeleteResource = (resId: number) => {
    setResources((prev) => prev.filter((r) => r.id !== resId))
    toast.success('Resource removed.')
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

  const isPublished = exam.status === 'published' || exam.status === 'approved'

  const tabs = [
    { name: 'Basic', slug: 'basic', Icon: Settings },
    { name: 'Pricing', slug: 'pricing', Icon: CircleDollarSign },
    { name: 'Settings', slug: 'settings', Icon: BookText },
    { name: 'Info', slug: 'info', Icon: FileText },
    { name: 'Media', slug: 'media', Icon: FolderInput },
    { name: 'SEO', slug: 'seo', Icon: FlaskConical },
  ]

  const questionsList = exam.questions || []
  const totalQuestions = questionsList.length
  const totalMarks = questionsList.reduce((acc, q) => acc + (Number(q.marks) || 0), 0) || exam.total_marks || 0

  return (
    <div className="space-y-6">
      {/* Breadcrumbs with Action Header matching Screenshot 2 */}
      <Breadcrumbs
        title="Manage Exam Contents"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Exams', href: '/dashboard/exams' },
          { title: exam.title || 'Exam' },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* View Exam Button (Solid Black) */}
            <Button asChild className="bg-black text-white hover:bg-neutral-800 gap-1.5 h-9 px-4">
              <Link href={`/exams/${exam.slug || exam.id}`} target="_blank">
                View Exam
              </Link>
            </Button>

            {/* Published Solid Green Badge */}
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3.5 py-1.5 text-xs capitalize rounded-md h-9 flex items-center">
              {exam.status || 'Published'}
            </Badge>

            {/* Change Status Button (Solid Black) */}
            <Button
              type="button"
              onClick={() => setStatusDialogOpen(true)}
              className="bg-black text-white hover:bg-neutral-800 capitalize h-9 px-4"
            >
              Change Status
            </Button>

            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="sm:max-w-120">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
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
          </div>
        }
        className="mb-4"
      />

      {/* Main Grid: Left Nav Sidebar Card (1 col) + Right Content (3 cols) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        {/* Left Navigation Card matching Laravel .horizontal-tabs-list */}
        <div className="col-span-full md:col-span-1 space-y-3">
          {/* Questions & Resources action links — matching Laravel's sidebar links above tabs */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 pb-1">Content</p>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-sm font-medium"
              onClick={() => setActiveTab('questions')}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              Questions
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {questionsList.length}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-sm font-medium"
              onClick={() => setActiveTab('resources')}
            >
              <ListTodo className="h-4 w-4 shrink-0" />
              Resources
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {resources.length}
              </span>
            </Button>
          </div>

          {/* Standard settings tabs */}
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
          {/* TAB 1: QUESTIONS (Screenshot 2 1:1 Parity) */}
          <TabsContent value="questions" className="m-0 space-y-4">
            {/* Questions Header matching Screenshot 2 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Exam Questions</h3>
                <p className="text-sm text-muted-foreground">
                  {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'} • Total: {Number(totalMarks).toFixed(2)} marks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 h-9"
                  onClick={() => toast.info('Questions are sorted by order index.')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Reorder
                </Button>
                <Button
                  onClick={handleOpenNewQuestion}
                  className="bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 h-9"
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
                  <div className="mb-4 rounded-full bg-muted p-6">
                    <HelpCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">No Questions Yet</h3>
                  <p className="mb-6 max-w-md text-sm text-muted-foreground">
                    Start building your exam by adding questions. You can create multiple choice, single choice, and custom mark questions.
                  </p>
                  <Button onClick={handleOpenNewQuestion} className="bg-black text-white hover:bg-neutral-800 gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questionsList.map((q, idx) => {
                  const opts = q.question_options || q.options || []
                  const isMultiSelect = q.question_type === 'multiple_select'

                  return (
                    <Card key={q.id} className="p-5 rounded-xl border border-border bg-card shadow-xs">
                      {/* Top Row: Q1, Type badge, marks, ActionsDropdown */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-gray-500">
                            Q{idx + 1}
                          </span>

                          {isMultiSelect ? (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-100 dark:bg-purple-950/40 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
                              <CheckSquare className="h-3 w-3" />
                              Multiple Select
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                              <CheckSquare className="h-3 w-3" />
                              Multiple Choice
                            </span>
                          )}

                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {Number(q.marks).toFixed(2)} marks
                          </span>
                        </div>

                        {/* ActionsDropdown */}
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
                              onClick={() => handleDuplicateQuestion(q.id)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Duplicate</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-full justify-start text-xs gap-2 font-normal"
                              onClick={() => handleOpenEditQuestion(q)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-full justify-start text-xs gap-2 font-normal text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Question Title matching Screenshot 2 */}
                      <h4 className="mt-3 mb-1 font-semibold text-foreground text-base">
                        {q.title}
                      </h4>

                      {/* Description / Instructions */}
                      {q.description ? (
                        <p className="text-sm text-muted-foreground mb-2">
                          {q.description}
                        </p>
                      ) : null}

                      {/* Inline Flex Options matching Screenshot 2 */}
                      {opts.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                          {opts.map((opt, oIdx) => {
                            const isCorrect = Boolean(opt.is_correct)

                            return (
                              <div key={opt.id || oIdx} className="flex items-center gap-2 text-sm">
                                {isCorrect ? (
                                  <CircleCheck
                                    strokeWidth={3}
                                    className="h-4 w-4 text-emerald-500 shrink-0"
                                  />
                                ) : (
                                  <Circle
                                    strokeWidth={2.5}
                                    className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0"
                                  />
                                )}
                                <span
                                  className={
                                    isCorrect
                                      ? 'font-medium text-emerald-700 dark:text-emerald-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }
                                >
                                  {opt.option_text}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Question Dialog (Create / Edit) */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Exam Question' : 'Add Exam Question'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveQuestion} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="q-title">Question Title *</Label>
                    <Input
                      id="q-title"
                      placeholder="e.g. What is the difficulty level of this exam?"
                      value={questionForm.title}
                      onChange={(e) => setQuestionForm((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="q-desc">Instructions / Subtitle (Optional)</Label>
                    <Textarea
                      id="q-desc"
                      rows={2}
                      placeholder="e.g. Select the option that best matches the published requirements."
                      value={questionForm.description}
                      onChange={(e) => setQuestionForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={questionForm.question_type}
                        onValueChange={(val) => setQuestionForm((p) => ({ ...p, question_type: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="multiple_select">Multiple Select</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="q-marks">Marks Allocated *</Label>
                      <Input
                        id="q-marks"
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={questionForm.marks}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, marks: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Answer Choices</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          setQuestionForm((p) => ({
                            ...p,
                            options: [...p.options, { option_text: '', is_correct: false }],
                          }))
                        }
                      >
                        <Plus className="h-3 w-3" /> Add Choice
                      </Button>
                    </div>

                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Checkbox
                          id={`opt-corr-${i}`}
                          checked={Boolean(opt.is_correct)}
                          onCheckedChange={(checked) => {
                            if (questionForm.question_type === 'multiple_choice') {
                              // Single correct selection
                              setQuestionForm((p) => ({
                                ...p,
                                options: p.options.map((o, idx) => ({
                                  ...o,
                                  is_correct: idx === i,
                                })),
                              }))
                            } else {
                              // Multiple select
                              setQuestionForm((p) => ({
                                ...p,
                                options: p.options.map((o, idx) =>
                                  idx === i ? { ...o, is_correct: Boolean(checked) } : o
                                ),
                              }))
                            }
                          }}
                        />
                        <Input
                          placeholder={`Choice ${i + 1}`}
                          value={opt.option_text}
                          onChange={(e) => {
                            const val = e.target.value
                            setQuestionForm((p) => ({
                              ...p,
                              options: p.options.map((o, idx) =>
                                idx === i ? { ...o, option_text: val } : o
                              ),
                            }))
                          }}
                          className="flex-1"
                        />
                        {questionForm.options.length > 2 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              setQuestionForm((p) => ({
                                ...p,
                                options: p.options.filter((_, idx) => idx !== i),
                              }))
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Check the box next to the correct answer choice(s).
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button type="button" variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Update Question' : 'Save Question'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB 2: RESOURCES */}
          <TabsContent value="resources" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Exam Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Exam Resources List
                  </p>
                </div>
                <Button onClick={() => setResourceDialogOpen(true)} size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Button>
              </div>

              <div className="space-y-2">
                {resources.length === 0 ? (
                  <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    No resources available
                  </p>
                ) : (
                  resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-card"
                    >
                      <a
                        href={res.resource}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {res.title}
                      </a>
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <a href={res.resource} target="_blank" rel="noreferrer" title={res.type === 'link' ? 'View' : 'Download'}>
                            {res.type === 'link' ? <Eye className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteResource(res.id)}
                          title="Delete resource"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Exam Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddResource} className="space-y-4 pt-2">
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
                        placeholder="e.g. Official Examination Syllabus"
                        value={newResourceTitle}
                        onChange={(e) => setNewResourceTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="res-url">Resource Link / URL *</Label>
                      <Input
                        id="res-url"
                        placeholder="https://... or /uploads/..."
                        value={newResourceUrl}
                        onChange={(e) => setNewResourceUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setResourceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Resource</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Resources')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: BASIC */}
          <TabsContent value="basic" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Basic Information</h3>
              <div>
                <Label htmlFor="exam-title">Exam Title *</Label>
                <Input
                  id="exam-title"
                  value={exam.title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, title: e.target.value } : null))}
                  placeholder="Enter exam title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="exam-sdesc">Short Description</Label>
                <Textarea
                  id="exam-sdesc"
                  rows={3}
                  value={exam.short_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, short_description: e.target.value } : null))}
                  placeholder="Brief description for exam cards"
                />
              </div>

              <div>
                <Label>Description</Label>
                <div className="mt-1">
                  <RichEditor
                    value={exam.description || ''}
                    onChange={(html) => setExam((p) => (p ? { ...p, description: html } : null))}
                    placeholder="Enter detailed exam description..."
                    minHeight={220}
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <Label>Instructor</Label>
                <Select
                  value={(exam as any).instructor_id ? String((exam as any).instructor_id) : ''}
                  onValueChange={(val) => setExam((p) => (p ? { ...p, instructor_id: val } as any : null))}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select Instructor" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={exam.exam_category_id ? String(exam.exam_category_id) : '1'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, exam_category_id: val } : null))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Category" />
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Basic Info')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PRICING */}
          <TabsContent value="pricing" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Pricing Settings</h3>
              <div>
                <Label className="mb-2 block">Pricing Type *</Label>
                <RadioGroup
                  value={exam.pricing_type || 'paid'}
                  onValueChange={(val) => setExam((p) => (p ? { ...p, pricing_type: val as 'free' | 'paid' } : null))}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="exam-paid" />
                    <Label htmlFor="exam-paid" className="cursor-pointer mb-0">Paid</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="exam-free" />
                    <Label htmlFor="exam-free" className="cursor-pointer mb-0">Free</Label>
                  </div>
                </RadioGroup>
              </div>

              {exam.pricing_type === 'paid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="exam-price">Price *</Label>
                    <Input
                      id="exam-price"
                      type="number"
                      value={exam.price || ''}
                      onChange={(e) => setExam((p) => (p ? { ...p, price: e.target.value } : null))}
                      placeholder="Enter your exam price ($0)"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="exam-disc"
                        checked={Boolean(exam.discount)}
                        onCheckedChange={(checked) =>
                          setExam((p) => (p ? { ...p, discount: Boolean(checked) } : null))
                        }
                      />
                      <Label htmlFor="exam-disc" className="cursor-pointer text-sm font-normal">
                        Discounted Price
                      </Label>
                    </div>
                    {exam.discount && (
                      <Input
                        placeholder="Discount Price ($)"
                        type="number"
                        value={exam.discount_price || ''}
                        onChange={(e) =>
                          setExam((p) => (p ? { ...p, discount_price: e.target.value } : null))
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label className="mb-2 block">Expiry Type *</Label>
                  <RadioGroup
                    value={exam.expiry_type || 'lifetime'}
                    onValueChange={(val) => setExam((p) => (p ? { ...p, expiry_type: val } : null))}
                    className="flex items-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lifetime" id="exp-life" />
                      <Label htmlFor="exp-life" className="cursor-pointer mb-0">Lifetime</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited" id="exp-limit" />
                      <Label htmlFor="exp-limit" className="cursor-pointer mb-0">Limited Time</Label>
                    </div>
                  </RadioGroup>
                </div>

                {exam.expiry_type === 'limited' && (
                  <div>
                    <Label htmlFor="exp-dur">Expiry Duration</Label>
                    <Select
                      value={exam.expiry_duration || '3 months'}
                      onValueChange={(val) => setExam((p) => (p ? { ...p, expiry_duration: val } : null))}
                    >
                      <SelectTrigger id="exp-dur" className="w-full mt-1">
                        <SelectValue placeholder="Select duration" />
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
                <Button onClick={() => handleSaveExam('Pricing')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: SETTINGS */}
          <TabsContent value="settings" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Exam Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <Label htmlFor="dur-h">Duration (Hours) *</Label>
                  <Input
                    id="dur-h"
                    type="number"
                    min="0"
                    value={exam.duration_hours || 1}
                    onChange={(e) => setExam((p) => (p ? { ...p, duration_hours: Number(e.target.value) } : null))}
                  />
                </div>
                <div>
                  <Label htmlFor="dur-m">Duration (Minutes) *</Label>
                  <Input
                    id="dur-m"
                    type="number"
                    min="0"
                    max="59"
                    value={exam.duration_minutes || 0}
                    onChange={(e) => setExam((p) => (p ? { ...p, duration_minutes: Number(e.target.value) } : null))}
                  />
                </div>
                <div>
                  <Label htmlFor="pass-m">Pass Mark (%) *</Label>
                  <Input
                    id="pass-m"
                    type="number"
                    min="0"
                    max="100"
                    value={exam.pass_mark || 70}
                    onChange={(e) => setExam((p) => (p ? { ...p, pass_mark: Number(e.target.value) } : null))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Students must score this percentage to pass</p>
                </div>
                <div>
                  <Label htmlFor="max-att">Max Attempts Allowed *</Label>
                  <Input
                    id="max-att"
                    type="number"
                    min="1"
                    value={exam.max_attempts || 3}
                    onChange={(e) => setExam((p) => (p ? { ...p, max_attempts: Number(e.target.value) } : null))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Maximum number of attempts allowed per student</p>
                </div>
                <div>
                  <Label htmlFor="tot-m">Total Marks *</Label>
                  <Input
                    id="tot-m"
                    type="number"
                    min="1"
                    value={exam.total_marks || 100}
                    onChange={(e) => setExam((p) => (p ? { ...p, total_marks: Number(e.target.value) } : null))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Total marks for the entire exam</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Settings')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 6: INFO (1:1 with Laravel info.tsx) */}
          <TabsContent value="info" className="m-0 space-y-4">
            <Card className="space-y-7 p-4 sm:p-6">
              {/* FAQs Section */}
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div className="w-full md:w-50 shrink-0">
                  <h6 className="font-medium text-foreground">Exam FAQs</h6>
                  <p className="text-xs text-muted-foreground mt-0.5">Common candidate questions</p>
                </div>
                <div className="w-full space-y-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => setFaqDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </Button>
                  {faqs.map((faq, fIdx) => (
                    <div key={faq.id || fIdx} className="rounded-lg border p-4 bg-muted/20 space-y-3">
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
                <div className="w-full md:w-50 shrink-0">
                  <h6 className="font-medium text-foreground">Requirements</h6>
                  <p className="text-xs text-muted-foreground mt-0.5">Candidate prerequisites</p>
                </div>
                <div className="w-full space-y-3">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
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
                        placeholder="e.g. Basic knowledge of cloud computing concepts"
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
                <div className="w-full md:w-50 shrink-0">
                  <h6 className="font-medium text-foreground">Learning Outcomes</h6>
                  <p className="text-xs text-muted-foreground mt-0.5">Skills and competencies tested</p>
                </div>
                <div className="w-full space-y-3">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
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
                        placeholder="e.g. Design fault-tolerant and high-availability systems"
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

              <Separator />

              {/* Instructions & Rules Section */}
              <div className="space-y-4 pt-2">
                <h6 className="font-medium text-foreground">Exam Instructions & Rules</h6>
                <div>
                  <Label htmlFor="exam-inst">Instructions for Candidates</Label>
                  <Textarea
                    id="exam-inst"
                    rows={4}
                    value={exam.instructions || ''}
                    onChange={(e) => setExam((p) => (p ? { ...p, instructions: e.target.value } : null))}
                    placeholder="Explain how candidates should approach the exam..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="exam-rules">Rules & Integrity Policy</Label>
                  <Textarea
                    id="exam-rules"
                    rows={4}
                    value={exam.rules || ''}
                    onChange={(e) => setExam((p) => (p ? { ...p, rules: e.target.value } : null))}
                    placeholder="Anti-cheating guidelines, browser restrictions..."
                    className="mt-1"
                  />
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
                      <Button type="submit">Add FAQ</Button>
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
                        placeholder="e.g. Completion of foundational web development coursework"
                        value={newRequirementText}
                        onChange={(e) => setNewRequirementText(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setRequirementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Requirement</Button>
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
                        placeholder="e.g. Mastery of modern full-stack development and APIs"
                        value={newOutcomeText}
                        onChange={(e) => setNewOutcomeText(e.target.value)}
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

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Info')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 7: MEDIA (1:1 with Laravel media.tsx) */}
          <TabsContent value="media" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Exam Media</h3>
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingThumbnail}
                  onChange={handleThumbnailUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 400x300px. Max size: 2MB.
                </p>

                <div className="mt-4">
                  <Label className="mb-2 block font-medium">Preview:</Label>
                  <img
                    src={exam.thumbnail || '/assets/images/blank-image.jpg'}
                    alt="Exam Thumbnail preview"
                    className="w-full max-w-sm rounded-md border object-cover aspect-video"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('Media')} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 8: SEO */}
          <TabsContent value="seo" className="m-0 space-y-4">
            <Card className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Search Engine Optimization (SEO)</h3>
              <div>
                <Label htmlFor="exam-seo-title">Meta Title</Label>
                <Input
                  id="exam-seo-title"
                  placeholder="Enter meta title for SEO"
                  value={exam.meta_title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_title: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="exam-seo-kw">Meta Keywords</Label>
                <Textarea
                  id="exam-seo-kw"
                  rows={3}
                  placeholder="Enter meta keywords separated by commas"
                  value={exam.meta_keywords || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_keywords: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="exam-seo-desc">Meta Description</Label>
                <Textarea
                  id="exam-seo-desc"
                  rows={3}
                  placeholder="Enter meta description for search engines"
                  value={exam.meta_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, meta_description: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="exam-og-title">OG Title</Label>
                <Input
                  id="exam-og-title"
                  placeholder="Enter Open Graph title"
                  value={exam.og_title || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, og_title: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="exam-og-desc">OG Description</Label>
                <Textarea
                  id="exam-og-desc"
                  rows={3}
                  placeholder="Enter Open Graph description for social media"
                  value={exam.og_description || ''}
                  onChange={(e) => setExam((p) => (p ? { ...p, og_description: e.target.value } : null))}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveExam('SEO')} disabled={saving} className="gap-2">
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
