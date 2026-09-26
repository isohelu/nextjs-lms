'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  HelpCircle,
  FileCheck,
  Send,
  ArrowLeft,
  X,
  Award,
  BookOpen,
  Download,
  RotateCcw,
  PlayCircle,
  FileText,
  CheckCircle,
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Question {
  id: number
  type: 'single' | 'multiple' | 'fill' | 'matching' | 'ordering' | 'audio' | 'short_answer'
  prompt: string
  audioUrl?: string
  options?: string[]
  pairs?: { left: string; right: string }[]
  orderItems?: string[]
  marks: number
}

const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'single',
    prompt: 'In Next.js 15 App Router, what is the default rendering behavior of React components inside the app/ directory?',
    options: [
      'Client Components rendered exclusively in the browser',
      'React Server Components rendered on the server with zero client JavaScript bundle impact',
      'Static Site Generation with no hydration capability',
      'Classic Single Page Application with Webpack chunking',
    ],
    marks: 5,
  },
  {
    id: 2,
    type: 'multiple',
    prompt: 'Select ALL valid HTTP response security headers recommended by OWASP for enterprise web applications:',
    options: [
      'Content-Security-Policy with nonce-based script execution',
      'Strict-Transport-Security (HSTS) with preload directive',
      'X-Frame-Options: SAMEORIGIN or DENY',
      'Access-Control-Allow-Origin: * on all authenticated endpoints',
      'X-Content-Type-Options: nosniff',
    ],
    marks: 10,
  },
  {
    id: 3,
    type: 'fill',
    prompt: 'The database optimization technique that ensures fast lookups by organizing rows into a balanced B-Tree structure is called a database ________.',
    marks: 5,
  },
  {
    id: 4,
    type: 'matching',
    prompt: 'Match each architectural concept with its primary system responsibility:',
    pairs: [
      { left: 'Distributed Tracing', right: 'Jaeger / OpenTelemetry spans across services' },
      { left: 'Rate Limiting', right: 'Guards against brute-force DDoS attacks' },
      { left: 'Schema Validation', right: 'Zod sanitization at API boundaries' },
      { left: 'Database Index', right: 'Accelerates high-throughput queries' },
    ],
    marks: 10,
  },
  {
    id: 5,
    type: 'ordering',
    prompt: 'Order the lifecycle stages of a typical production CI/CD deployment pipeline:',
    orderItems: [
      '1. Static code linting & TypeScript typecheck',
      '2. Unit tests and integration suite execution',
      '3. Docker container build and image security scan',
      '4. Blue/Green rolling deployment to production Kubernetes cluster',
    ],
    marks: 10,
  },
  {
    id: 6,
    type: 'audio',
    prompt: 'Listen to the architectural audio prompt and summarize the recommendation for cache invalidation:',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    marks: 10,
  },
  {
    id: 7,
    type: 'short_answer',
    prompt: 'Briefly explain why Next.js Server Actions automatically mitigate CSRF vulnerabilities compared to traditional REST POST handlers:',
    marks: 10,
  },
]

// =========================================================================
// 1. Question Runner Component
// =========================================================================
function ExamAttemptRunner({
  examId,
  examTitle,
  onExit
}: {
  examId: string
  examTitle: string
  onExit: () => void
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  useEffect(() => {
    async function startAttempt() {
      try {
        const res = await fetch(`/api/student/exams/${examId}/attempt/start`, {
          method: 'POST',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.attempt?.id) {
            setAttemptId(data.attempt.id)
          }
          if (data.questions && data.questions.length > 0) {
            const mapped: Question[] = data.questions.map((q: any) => ({
              id: q.id,
              type: q.question_type === 'multiple_choice' ? 'single' : (q.question_type || 'single'),
              prompt: q.title || q.question || 'Exam Question',
              options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options).map((o: any) => typeof o === 'string' ? o : o.title) : q.options) : ['Option A', 'Option B', 'Option C', 'Option D'],
              marks: q.marks || 5,
            }))
            setQuestions(mapped)
          }
        }
      } catch (err) {
        console.error('Error starting attempt:', err)
      }
    }
    startAttempt()
  }, [examId])

  const handleSubmitExam = async () => {
    setSubmitting(true)
    let finalAttemptId = attemptId
    try {
      const res = await fetch(`/api/student/exams/${examId}/attempt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpentSeconds: 1800 - timeLeft,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.attemptId) finalAttemptId = data.attemptId
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
      setShowConfirmSubmit(false)
      router.push(`/student/exams/${examId}/result${finalAttemptId ? `?attempt_id=${finalAttemptId}` : ''}`)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex] || questions[0]

  const handleSingleOptionSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))
  }

  const handleMultipleOptionToggle = (option: string) => {
    const current = (answers[currentQuestion.id] as string[]) || []
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }))
  }

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }))
  }

  const toggleMarkForReview = () => {
    setMarked((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id)
      } else {
        next.add(currentQuestion.id)
      }
      return next
    })
  }


  const answeredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] !== undefined && answers[Number(k)] !== ''
  ).length

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground antialiased font-sans pb-16">
      {/* Top sticky app header */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-6 py-3.5 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onExit} className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Exit Exam
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground truncate max-w-sm sm:max-w-md">
              {examTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold font-mono transition-colors",
              timeLeft < 300 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-primary/10 text-primary"
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              size="sm"
              onClick={() => setShowConfirmSubmit(true)}
              className="rounded-xl font-bold bg-[#007867] hover:bg-[#007867]/90 text-white shadow-xs"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Main Question & Navigation Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Question Canvas */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-border shadow-xs bg-card">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {currentQuestion.marks} Marks
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMarkForReview}
                    className={cn(
                      "text-xs gap-1.5",
                      marked.has(currentQuestion.id) ? "text-amber-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30" : "text-muted-foreground"
                    )}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {marked.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                  </Button>
                </div>
              </div>

              {/* Question Text */}
              <div className="py-6">
                <p className="text-base font-medium leading-relaxed text-foreground">
                  {currentQuestion.prompt}
                </p>
              </div>

              {/* Render Question Inputs */}
              <div className="space-y-3 pt-2">
                {currentQuestion.type === 'single' && currentQuestion.options?.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.id] === opt
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSingleOptionSelect(opt)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                        isSelected ? "border-primary bg-primary/5 shadow-xs font-medium text-primary" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                        isSelected ? "border-primary bg-primary text-primary-foreground font-bold" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-sm leading-normal">{opt}</span>
                    </div>
                  )
                })}

                {currentQuestion.type === 'multiple' && currentQuestion.options?.map((opt, idx) => {
                  const selectedArr = (answers[currentQuestion.id] as string[]) || []
                  const isChecked = selectedArr.includes(opt)
                  return (
                    <div
                      key={idx}
                      onClick={() => handleMultipleOptionToggle(opt)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                        isChecked ? "border-primary bg-primary/5 shadow-xs font-medium text-primary" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs",
                        isChecked ? "border-primary bg-primary text-primary-foreground font-bold" : "border-muted-foreground/30"
                      )}>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-sm leading-normal">{opt}</span>
                    </div>
                  )
                })}

                {currentQuestion.type === 'fill' && (
                  <Input
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="h-12 rounded-xl text-sm"
                  />
                )}

                {currentQuestion.type === 'short_answer' && (
                  <Textarea
                    placeholder="Write your explanation or answer in detail..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    rows={5}
                    className="rounded-xl text-sm leading-relaxed"
                  />
                )}

                {currentQuestion.type === 'audio' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                      <Volume2 className="h-5 w-5 text-primary" />
                      <audio controls className="w-full h-8">
                        <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    <Textarea
                      placeholder="Summarize your answer based on the audio clip..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleTextChange(e.target.value)}
                      rows={4}
                      className="rounded-xl text-sm"
                    />
                  </div>
                )}

                {currentQuestion.type === 'matching' && (
                  <div className="space-y-3">
                    {currentQuestion.pairs?.map((pair, pIdx) => (
                      <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border">
                        <div className="p-3 bg-card rounded-lg border border-border text-xs font-semibold">
                          {pair.left}
                        </div>
                        <div className="p-3 bg-primary/5 text-primary rounded-lg border border-primary/20 text-xs font-medium">
                          {pair.right}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'ordering' && (
                  <div className="space-y-2">
                    {currentQuestion.orderItems?.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs font-medium">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-between border-t border-border mt-8 pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex((prev) => prev + 1)
                    } else {
                      setShowConfirmSubmit(true)
                    }
                  }}
                  className="rounded-xl gap-1.5 bg-[#007867] hover:bg-[#007867]/90 text-white"
                >
                  {currentIndex === questions.length - 1 ? 'Review & Submit' : 'Next Question'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Palette Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-5 border-border shadow-xs bg-card space-y-4">
              <h3 className="text-sm font-bold text-foreground">Question Navigator</h3>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== ''
                  const isMarked = marked.has(q.id)

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-xl text-xs font-bold transition-all",
                        isCurrent
                          ? "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground"
                          : isMarked
                          ? "bg-amber-500 text-white"
                          : isAnswered
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-muted border border-border" />
                  <span>Unanswered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full p-6 border-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Submit Exam Confirmation</h3>
              <button onClick={() => setShowConfirmSubmit(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Are you sure you want to finalize and submit your responses?</p>
              <div className="rounded-xl bg-muted/40 p-3.5 border border-border space-y-1 text-xs">
                <p>• Total Questions: <strong className="text-foreground">{questions.length}</strong></p>
                <p>• Answered: <strong className="text-foreground">{answeredCount}</strong></p>
                <p>• Unanswered: <strong className="text-foreground">{questions.length - answeredCount}</strong></p>
                <p>• Marked for Review: <strong className="text-amber-600">{marked.size}</strong></p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)} className="rounded-xl">
                Continue Exam
              </Button>
              <Button onClick={handleSubmitExam} disabled={submitting} className="rounded-xl font-bold bg-[#007867] text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm & Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// =========================================================================
// 2. Main Enrolled Exam Dashboard Component
// =========================================================================
export default function StudentExamDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = (params?.id as string) || '1'
  const tabParam = params?.tab as string

  const validTabs = ['attempts', 'resources', 'certificate']
  const initialTab = (tabParam && validTabs.includes(tabParam)) ? tabParam : 'attempts'

  const [activeTab, setActiveTab] = useState<'attempts' | 'resources' | 'certificate'>(initialTab as any)
  const [isTaking, setIsTaking] = useState(searchParams.get('take') === 'true')
  const [loading, setLoading] = useState(true)
  const [examData, setExamData] = useState<any>(null)

  // Sync state if URL route tab param changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true)
        const res = await fetch(`/api/student/exams/${examId}`)
        if (res.ok) {
          const data = await res.json()
          setExamData(data)
        }
      } catch (err) {
        console.error('Failed to load student exam:', err)
      } finally {
        setLoading(false)
      }
    }
    loadExam()
  }, [examId])

  if (isTaking) {
    return (
      <ExamAttemptRunner
        examId={examId}
        examTitle={examData?.exam?.title || 'Certification Assessment'}
        onExit={() => setIsTaking(false)}
      />
    )
  }

  if (loading && !examData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#007867]" />
          <p className="text-sm text-muted-foreground">Loading examination portal...</p>
        </div>
      </div>
    )
  }

  const exam = examData?.exam || {
    id: examId,
    title: 'Full-Stack Next.js & Cloud Architecture Certification',
    level: 'Advanced',
    duration_minutes: 60,
    total_questions: 15,
    pass_mark: 70,
    total_marks: 60,
    instructor_name: 'Senior LMS Examiner',
    short_description: 'Official certification evaluation testing Next.js 15, REST APIs, and database performance.'
  }

  const attempts = examData?.attempts || []
  const bestAttempt = examData?.bestAttempt
  const resources = examData?.resources || []

  const completedAttempts = attempts.filter((a: any) => a.status === 'completed')
  const inProgressAttempts = attempts.filter((a: any) => a.status === 'in_progress')
  const isPassed = bestAttempt && (bestAttempt.obtained_marks / (bestAttempt.total_marks || exam.total_marks)) >= (exam.pass_mark / 100)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground antialiased font-sans pb-16">
      {/* Top Banner Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/student/exams">
                <ArrowLeft className="h-4 w-4" />
                Back to Enrolled Exams
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[#007867]/30 bg-[#007867]/10 text-[#007867] font-semibold">
                  {exam.level || 'Certification'}
                </Badge>
                {isPassed && (
                  <Badge className="bg-emerald-600 text-white font-semibold">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Passed
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {exam.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exam.short_description}
              </p>
              <p className="text-xs text-muted-foreground">
                Instructor: <strong className="text-foreground">{exam.instructor_name}</strong>
              </p>
            </div>

            {/* CTA: Start / Retake Exam */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                onClick={() => setIsTaking(true)}
                className="w-full sm:w-auto bg-[#007867] hover:bg-[#007867]/90 text-white font-bold shadow-sm"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {attempts.length > 0 ? 'Retake Exam' : 'Start Exam'}
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Questions</p>
              <p className="text-lg font-bold text-foreground">{exam.total_questions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-bold text-foreground">{exam.duration_minutes} Mins</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Passing Grade</p>
              <p className="text-lg font-bold text-foreground">{exam.pass_mark}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Marks</p>
              <p className="text-lg font-bold text-foreground">{exam.total_marks}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-border bg-background sticky top-0 z-20 shadow-xs">
        <div className="container mx-auto max-w-6xl px-4 flex gap-2 overflow-x-auto py-2">
          {[
            { id: 'attempts', label: 'Attempts & History', count: attempts.length, icon: RotateCcw },
            { id: 'resources', label: 'Study Resources', count: resources.length, icon: Download },
            { id: 'certificate', label: 'Certificate', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  router.push(`/student/exams/${examId}/${tab.id}`)
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* TAB 1: ATTEMPTS */}
        {activeTab === 'attempts' && (
          <div className="space-y-6">
            {/* Stat Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4 bg-card border-border shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">Total Attempts</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{attempts.length}</p>
              </Card>
              <Card className="p-4 bg-card border-border shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{completedAttempts.length}</p>
              </Card>
              <Card className="p-4 bg-card border-border shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">In Progress</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{inProgressAttempts.length}</p>
              </Card>
              <Card className="p-4 bg-card border-border shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">Best Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-purple-600">
                    {bestAttempt ? `${bestAttempt.obtained_marks} / ${bestAttempt.total_marks || exam.total_marks}` : 'N/A'}
                  </p>
                  {isPassed && <Award className="h-5 w-5 text-amber-500" />}
                </div>
              </Card>
            </div>

            {/* Attempts Table */}
            <Card className="border-border shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Exam Attempt Log</h3>
                  <p className="text-xs text-muted-foreground">Historical records of all your examination attempts.</p>
                </div>
                <Button size="sm" onClick={() => setIsTaking(true)} className="bg-[#007867] text-white">
                  New Attempt
                </Button>
              </div>

              {attempts.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                  <h4 className="text-base font-bold text-foreground">No attempts yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Your test attempts and performance grading will appear here once you begin the assessment.
                  </p>
                  <Button onClick={() => setIsTaking(true)} className="bg-[#007867] text-white">
                    Start Assessment Now
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3">Attempt #</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Obtained Score</th>
                        <th className="px-5 py-3">Result</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {attempts.map((attempt: any, idx: number) => {
                        const scorePercent = Math.round((attempt.obtained_marks / (attempt.total_marks || exam.total_marks)) * 100)
                        const passed = scorePercent >= exam.pass_mark

                        return (
                          <tr key={attempt.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-foreground">
                              Attempt #{attempt.attempt_number || attempts.length - idx}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {attempt.start_time ? new Date(attempt.start_time).toLocaleDateString() : 'Today'}
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge variant="outline" className={cn(
                                "capitalize text-[11px]",
                                attempt.status === 'completed' ? "border-emerald-500/30 text-emerald-600 bg-emerald-50" : "border-blue-500/30 text-blue-600 bg-blue-50"
                              )}>
                                {attempt.status || 'Completed'}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              {attempt.obtained_marks} / {attempt.total_marks || exam.total_marks} ({scorePercent}%)
                            </td>
                            <td className="px-5 py-3.5">
                              {passed ? (
                                <Badge className="bg-emerald-600 text-white text-[10px]">
                                  Passed
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">
                                  Failed
                                </Badge>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <Link href={`/student/exams/${examId}/result?attempt_id=${attempt.id}`}>
                                  Review Result
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Exam Preparation Materials</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Download syllabus blueprints, study notes, and sample problems.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((res: any) => (
                <Card key={res.id} className="p-5 border-border shadow-xs hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{res.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: <strong className="text-foreground">{res.type}</strong> • {res.file_size}
                      </p>
                      <Button asChild size="sm" variant="outline" className="mt-3 w-full gap-1.5 text-xs">
                        <a href={res.download_url} download>
                          <Download className="h-3.5 w-3.5" />
                          Download Resource
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CERTIFICATE */}
        {activeTab === 'certificate' && (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            {isPassed ? (
              <Card className="p-8 border-border shadow-md text-center space-y-6 bg-card">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <Award className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Official Examination Certificate</h2>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
                    Congratulations! You have satisfied the technical competency standards with a score of {bestAttempt?.obtained_marks} / {bestAttempt?.total_marks || exam.total_marks}.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidate:</span>
                    <span className="font-semibold text-foreground">Enrolled Student</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued Credential ID:</span>
                    <span className="font-mono font-semibold text-foreground">CERT-EX-{examId}-{bestAttempt?.id || 101}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade Achieved:</span>
                    <span className="font-semibold text-emerald-600">Passed (Distinction)</span>
                  </div>
                </div>
                <Button size="lg" className="w-full bg-[#007867] hover:bg-[#007867]/90 text-white font-bold gap-2">
                  <Download className="h-4 w-4" />
                  Download Certificate (PDF)
                </Button>
              </Card>
            ) : (
              <Card className="p-8 border-border text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-bold text-foreground">Certificate Locked</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  This official certificate requires a minimum passing grade of <strong>{exam.pass_mark}%</strong>. Review your notes and retake the exam to unlock your certificate.
                </p>
                <Button onClick={() => setIsTaking(true)} className="bg-[#007867] text-white">
                  Take Exam Now
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
