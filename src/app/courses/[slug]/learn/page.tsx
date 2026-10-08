'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VideoPlayer from '@/components/video-player'
import ClaimCertificateDialog from '@/components/certificate/ClaimCertificateDialog'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  Sparkles,
  ArrowLeft,
  Menu,
  Check,
  Video,
  FileText,
  Download,
  MessageSquare,
  Bookmark,
  Award,
  Send,
  HelpCircle,
  Code,
  Image as ImageIcon,
  ExternalLink,
  RotateCcw,
  Clock,
  AlertCircle,
  BookOpen,
  Loader2,
  Maximize2,
} from 'lucide-react'

interface LearnPageProps {
  params: Promise<{
    slug: string
  }>
}

interface ResourceItem {
  id: number
  title: string
  type: string
  resource: string
}

interface QuestionItem {
  id: number
  title: string
  type: string
  options: string[] | string
  answer?: string
}

interface QuizItem {
  id: number | string
  title: string
  total_marks?: number
  pass_mark?: number
  hours?: number
  minutes?: number
  seconds?: number
  duration?: string
  retake?: number
  summary?: string | null
  questions?: QuestionItem[]
  submissions?: any[]
  best_submission?: any
}

interface LessonItem {
  id: number | string
  title: string
  duration?: string | null
  duration_minutes: number
  lesson_type: string
  lesson_provider?: string | null
  lesson_src?: string | null
  video_url?: string
  summary?: string | null
  description?: string | null
  content?: string | null
  is_free?: boolean | number
  resources?: ResourceItem[]
}

interface ModuleItem {
  id: number | string
  title: string
  lessons: LessonItem[]
  quizzes: QuizItem[]
}

type ActiveItemType =
  | { type: 'lesson'; data: LessonItem; sectionTitle: string; sectionId: number | string }
  | { type: 'quiz'; data: QuizItem; sectionTitle: string; sectionId: number | string }

function parseYouTubeId(url?: string | null): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function parseVimeoId(url?: string | null): string | null {
  if (!url) return null
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/
  const match = url.match(regExp)
  return match ? match[3] : null
}

const DEFAULT_FALLBACK_MODULES: ModuleItem[] = [
  {
    id: 1,
    title: 'Foundations & Architecture Setup',
    lessons: [
      {
        id: 1,
        title: '1.1 System Architecture & Technical Stack',
        duration: '15m',
        duration_minutes: 15,
        lesson_type: 'video_url',
        lesson_provider: 'youtube',
        lesson_src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        summary: 'Explore full-stack architectural design, Edge SSR routing, and state hydration.',
        description: 'Complete walkthrough of enterprise software design patterns.',
        resources: [],
      },
      {
        id: 2,
        title: '1.2 Workspace Initialization & Dependencies',
        duration: '20m',
        duration_minutes: 20,
        lesson_type: 'video_url',
        lesson_provider: 'youtube',
        lesson_src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        summary: 'Set up strict TypeScript compiler options, Tailwind tokens, and git hooks.',
        description: 'Configuring Node.js runtime and enterprise linters.',
        resources: [],
      },
    ],
    quizzes: [
      {
        id: 101,
        title: 'Module 1 Knowledge Check Quiz',
        total_marks: 100,
        pass_mark: 60,
        minutes: 15,
        hours: 0,
        seconds: 0,
        retake: 3,
        summary: 'Evaluate understanding of architecture and design patterns.',
        questions: [
          {
            id: 1,
            title: 'Which Next.js rendering strategy executes components exclusively on the server?',
            type: 'single_choice',
            options: ['React Server Components (RSC)', 'Client Side Hydration', 'Static Web Workers', 'Local IndexedDB'],
            answer: 'React Server Components (RSC)',
          },
          {
            id: 2,
            title: 'Dynamic CSP nonces should be generated per HTTP request in middleware.',
            type: 'boolean',
            options: ['True', 'False'],
            answer: 'True',
          },
        ],
      },
    ],
  },
]

export default function CourseLearnPage({ params }: LearnPageProps) {
  const { slug } = use(params)
  const router = useRouter()

  const [courseId, setCourseId] = useState<number | null>(null)
  const [courseTitle, setCourseTitle] = useState('Course Player')
  const [modules, setModules] = useState<ModuleItem[]>(DEFAULT_FALLBACK_MODULES)
  const [activeItem, setActiveItem] = useState<ActiveItemType | null>(null)
  const [completedItemIds, setCompletedItemIds] = useState<Set<string | number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Quiz execution states
  const [quizScreen, setQuizScreen] = useState<'summary' | 'questions' | 'result'>('summary')
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<any>(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

  // Lesson resources
  const [lessonResources, setLessonResources] = useState<ResourceItem[]>([])
  const [loadingResources, setLoadingResources] = useState(false)

  // Notes & discussions state
  const [notes, setNotes] = useState<string>('')
  const [savedNotes, setSavedNotes] = useState<{ id: number; time: string; text: string }[]>([
    { id: 1, time: '02:45', text: 'Important: Follow strict 1:1 component layout tokens and spacing.' },
    { id: 2, time: '08:15', text: 'Dynamic nonces must be cryptographically generated per request.' },
  ])
  const [newQuestion, setNewQuestion] = useState('')
  const [discussions, setDiscussions] = useState<
    { id: number; author: string; avatar: string; time: string; question: string; replies: number }[]
  >([
    {
      id: 1,
      author: 'Marcus Chen',
      avatar: '/assets/avatars/avatar-2.png',
      time: '2 hours ago',
      question: 'How does Next.js 15 handle streaming SSR when dynamic nonces are used in the CSP header?',
      replies: 3,
    },
    {
      id: 2,
      author: 'Elena Rostova',
      avatar: '/assets/avatars/avatar-3.png',
      time: '1 day ago',
      question: 'Is it recommended to wrap client components in React.Suspense when fetching Supabase session data?',
      replies: 5,
    },
  ])

  // Load course data
  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await fetch('/api/courses?limit=100')
        if (cRes.ok) {
          const cData = await cRes.json()
          const matched = (cData.courses || []).find((c: any) => c.slug === slug || String(c.id) === slug)

          if (matched) {
            setCourseId(matched.id)
            setCourseTitle(matched.title)

            // Auto-enroll student if not enrolled yet for smooth demo
            await fetch('/api/student/enrollments/course', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ course_id: matched.id }),
            }).catch(() => {})

            // 2. Fetch full curriculum & player init
            const initRes = await fetch(`/api/student/courses/${matched.id}/play/init`, {
              method: 'POST',
            })

            let curriculumData: any[] = []
            if (initRes.ok) {
              const initData = await initRes.json()
              if (initData.curriculum && initData.curriculum.length > 0) {
                curriculumData = initData.curriculum
              }
              if (initData.watchHistory?.completed_watching) {
                try {
                  const completedArr = JSON.parse(initData.watchHistory.completed_watching)
                  if (Array.isArray(completedArr)) {
                    setCompletedItemIds(new Set(completedArr.map((item: any) => (typeof item === 'object' ? item.id : item))))
                  }
                } catch {}
              }
            }

            if (curriculumData.length === 0) {
              // Fallback fetch from course details API
              const fullCourseRes = await fetch(`/api/courses/${matched.id}`)
              if (fullCourseRes.ok) {
                const fullCourseJson = await fullCourseRes.json()
                if (fullCourseJson.course?.sections) {
                  curriculumData = fullCourseJson.course.sections
                }
              }
            }

            if (curriculumData && curriculumData.length > 0) {
              const parsedModules: ModuleItem[] = curriculumData.map((sec: any) => {
                const rawLessons = sec.lessons || sec.section_lessons || []
                const rawQuizzes = sec.quizzes || sec.section_quizzes || []

                const lessons: LessonItem[] = rawLessons.map((l: any) => ({
                  id: l.id,
                  title: l.title || 'Untitled Lesson',
                  duration: l.duration || '15 mins',
                  duration_minutes: parseInt(l.duration || '15', 10) || 15,
                  lesson_type: l.lesson_type || 'video_url',
                  lesson_provider: l.lesson_provider || 'youtube',
                  lesson_src: l.lesson_src || l.video_url || '',
                  summary: l.summary || '',
                  description: l.description || l.summary || '',
                  content: l.description || l.summary || '',
                  is_free: Boolean(l.is_free),
                  resources: l.resources || [],
                }))

                const quizzes: QuizItem[] = rawQuizzes.map((q: any) => ({
                  id: q.id,
                  title: q.title || 'Section Quiz',
                  total_marks: q.total_marks || q.total_mark || 100,
                  pass_mark: q.pass_mark || 50,
                  hours: q.hours || 0,
                  minutes: q.minutes || 30,
                  seconds: q.seconds || 0,
                  duration: q.duration || `${q.minutes || 30} mins`,
                  retake: q.retake || 3,
                  summary: q.summary || '',
                  questions: q.questions || q.quiz_questions || [],
                  submissions: q.submissions || q.quiz_submissions || [],
                }))

                return {
                  id: sec.id,
                  title: sec.title || 'Course Section',
                  lessons,
                  quizzes,
                }
              })

              setModules(parsedModules)

              // Set initial active item
              const firstModule = parsedModules.find((m) => m.lessons.length > 0 || m.quizzes.length > 0)
              if (firstModule) {
                if (firstModule.lessons.length > 0) {
                  setActiveItem({
                    type: 'lesson',
                    data: firstModule.lessons[0],
                    sectionTitle: firstModule.title,
                    sectionId: firstModule.id,
                  })
                } else if (firstModule.quizzes.length > 0) {
                  setActiveItem({
                    type: 'quiz',
                    data: firstModule.quizzes[0],
                    sectionTitle: firstModule.title,
                    sectionId: firstModule.id,
                  })
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Player loading error:', err)
      }
    }

    loadData()
  }, [slug])

  // Load lesson resources when lesson changes
  useEffect(() => {
    if (activeItem?.type === 'lesson' && activeItem.data.id) {
      if (activeItem.data.resources && activeItem.data.resources.length > 0) {
        setLessonResources(activeItem.data.resources)
      } else {
        setLoadingResources(true)
        fetch(`/api/lesson-resources?lessonId=${activeItem.data.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.resources)) {
              setLessonResources(data.resources)
            } else {
              setLessonResources([])
            }
          })
          .catch(() => setLessonResources([]))
          .finally(() => setLoadingResources(false))
      }
    }
  }, [activeItem])

  // Flatten all items in order for sequential navigation
  const allCurriculumItems: {
    type: 'lesson' | 'quiz'
    item: LessonItem | QuizItem
    sectionTitle: string
    sectionId: number | string
  }[] = []

  modules.forEach((mod) => {
    mod.lessons.forEach((l) =>
      allCurriculumItems.push({
        type: 'lesson',
        item: l,
        sectionTitle: mod.title,
        sectionId: mod.id,
      })
    )
    mod.quizzes.forEach((q) =>
      allCurriculumItems.push({
        type: 'quiz',
        item: q,
        sectionTitle: mod.title,
        sectionId: mod.id,
      })
    )
  })

  const currentIdx = allCurriculumItems.findIndex(
    (ci) => ci.type === activeItem?.type && ci.item.id === activeItem?.data.id
  )
  const prevItem = currentIdx > 0 ? allCurriculumItems[currentIdx - 1] : null
  const nextItem = currentIdx < allCurriculumItems.length - 1 ? allCurriculumItems[currentIdx + 1] : null

  const progressPercentage =
    allCurriculumItems.length > 0
      ? Math.round((completedItemIds.size / allCurriculumItems.length) * 100)
      : 0

  const toggleItemCompletion = async (
    itemId: string | number,
    autoAdvance: boolean = false,
    showToast: boolean = true
  ) => {
    setIsMarking(true)
    const isDone = completedItemIds.has(itemId)
    const newSet = new Set(completedItemIds)

    if (isDone) {
      newSet.delete(itemId)
      if (showToast) {
        toast.info('Lesson marked as incomplete')
      }
    } else {
      newSet.add(itemId)
      if (showToast) {
        toast.success('🎉 Lesson marked as completed!')
      }
      if (autoAdvance && nextItem) {
        handleSelectItem(nextItem.type, nextItem.item, nextItem.sectionTitle, nextItem.sectionId)
      }
    }
    setCompletedItemIds(newSet)

    if (courseId) {
      const numId = typeof itemId === 'number' ? itemId : parseInt(String(itemId), 10)
      if (!isNaN(numId)) {
        try {
          await fetch(`/api/student/courses/${courseId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lesson_id: numId,
              completed: !isDone,
            }),
          })
        } catch {}
      }
    }
    setIsMarking(false)
  }

  const handleVideoEnded = (lessonId: string | number) => {
    if (!completedItemIds.has(lessonId)) {
      toast.success('🎉 Video finished! Lesson marked as completed.', {
        duration: 3500,
      })
      toggleItemCompletion(lessonId, true, false)
    } else if (nextItem) {
      toast.info('Video finished. Continuing to next lesson...', { duration: 2500 })
      setTimeout(() => {
        handleSelectItem(nextItem.type, nextItem.item, nextItem.sectionTitle, nextItem.sectionId)
      }, 1200)
    }
  }

  const handleSelectItem = (
    type: 'lesson' | 'quiz',
    item: LessonItem | QuizItem,
    sectionTitle: string,
    sectionId: number | string
  ) => {
    if (type === 'lesson') {
      setActiveItem({ type: 'lesson', data: item as LessonItem, sectionTitle, sectionId })
      setQuizScreen('summary')
    } else {
      setActiveItem({ type: 'quiz', data: item as QuizItem, sectionTitle, sectionId })
      setQuizScreen('summary')
      setCurrentQIndex(0)
      setQuizAnswers({})
      setQuizResult(null)
    }
  }

  // Quiz submission handler
  const handleStartQuiz = () => {
    setQuizScreen('questions')
    setCurrentQIndex(0)
    setQuizAnswers({})
    setQuizResult(null)
  }

  const handleQuizAnswerChange = (questionId: number | string, answerValue: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [String(questionId)]: answerValue,
    }))
  }

  const handleQuizSubmit = async () => {
    if (!activeItem || activeItem.type !== 'quiz' || !courseId) return
    setSubmittingQuiz(true)
    try {
      const res = await fetch(`/api/student/courses/${courseId}/quizzes/${activeItem.data.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers }),
      })
      const data = await res.json()
      if (data.success && data.result) {
        setQuizResult(data.result)
        setQuizScreen('result')
        if (data.result.isPassed) {
          const newSet = new Set(completedItemIds)
          newSet.add(activeItem.data.id)
          setCompletedItemIds(newSet)
          toast.success('Congratulations! You passed the quiz!')
        } else {
          toast.error('Quiz finished. Please review the material and try again.')
        }
      } else {
        toast.error(data.message || 'Failed to submit quiz.')
      }
    } catch {
      toast.error('Network error submitting quiz.')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  const handleAddNote = () => {
    if (!notes.trim()) return
    setSavedNotes([
      ...savedNotes,
      { id: Date.now(), time: '04:12', text: notes.trim() },
    ])
    setNotes('')
    toast.success('Note saved!')
  }

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return
    setDiscussions([
      {
        id: Date.now(),
        author: 'Current Student',
        avatar: '/assets/avatars/avatar-1.png',
        time: 'Just now',
        question: newQuestion.trim(),
        replies: 0,
      },
      ...discussions,
    ])
    setNewQuestion('')
    toast.success('Question posted to instructor!')
  }

  // Active Lesson Media Renderer
  const renderLessonMedia = (lesson: LessonItem) => {
    const rawSrc = (lesson.lesson_src || lesson.video_url || '').trim()
    const ytId = parseYouTubeId(rawSrc)
    const vimeoId = parseVimeoId(rawSrc)

    // 1. Video (YouTube, Vimeo, Bunny Stream, HTML5 Video File / URL)
    if (
      lesson.lesson_type === 'video_url' ||
      lesson.lesson_type === 'video' ||
      lesson.lesson_type === 'video_file' ||
      !lesson.lesson_type
    ) {
      if (rawSrc.includes('iframe.mediadelivery.net') || lesson.lesson_provider === 'bunny') {
        const bunnyEmbed = rawSrc.startsWith('http')
          ? rawSrc
          : `https://iframe.mediadelivery.net/embed/${rawSrc}`
        return (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl">
            <iframe
              src={bunnyEmbed}
              loading="lazy"
              className="border-0 w-full h-full absolute inset-0"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          </div>
        )
      }

      const srcToUse = rawSrc || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      const provider = ytId ? 'youtube' : vimeoId ? 'vimeo' : 'html5'

      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl">
          <VideoPlayer
            key={`vp-${lesson.id}-${srcToUse}`}
            source={{
              type: 'video',
              sources: [
                {
                  src: srcToUse,
                  provider: provider as any,
                },
              ],
            }}
            onEnded={() => handleVideoEnded(lesson.id)}
          />
        </div>
      )
    }

    // 3. Document File / PDF
    if (lesson.lesson_type === 'document' || lesson.lesson_type === 'doc' || lesson.lesson_type === 'document_file') {
      const isPdf = rawSrc.toLowerCase().endsWith('.pdf')
      return (
        <Card className="min-h-[60vh] w-full flex flex-col justify-between p-6 sm:p-10 border-border bg-card shadow-2xl rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <Badge variant="outline" className="text-xs uppercase font-bold text-primary">
                  Document Lesson
                </Badge>
                <h3 className="text-xl font-bold text-foreground mt-0.5">{lesson.title}</h3>
              </div>
            </div>

            {rawSrc && isPdf && (
              <div className="w-full h-[55vh] rounded-xl overflow-hidden border border-border mt-4">
                <iframe src={rawSrc} title={lesson.title} className="w-full h-full" />
              </div>
            )}

            {lesson.description && (
              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                {lesson.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border mt-6">
            <div className="text-xs text-muted-foreground">
              <span>Attached Document Resource: </span>
              <strong className="text-foreground">{rawSrc ? rawSrc.split('/').pop() : 'course-notes.pdf'}</strong>
            </div>
            {rawSrc && (
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={rawSrc} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open in New Tab
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a href={rawSrc} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download Document
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>
      )
    }

    // 4. Image File
    if (lesson.lesson_type === 'image' || lesson.lesson_type === 'image_file') {
      return (
        <Card className="w-full p-4 sm:p-6 border-border bg-card shadow-2xl rounded-2xl text-center space-y-4">
          <div className="max-h-[70vh] overflow-hidden rounded-xl bg-muted/20 flex items-center justify-center p-2">
            <img
              src={rawSrc || '/assets/images/blank-image.jpg'}
              alt={lesson.title}
              className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/assets/images/blank-image.jpg'
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>{lesson.title}</span>
            {rawSrc && (
              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                <a href={rawSrc} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-1 h-3 w-3" />
                  Download Image
                </a>
              </Button>
            )}
          </div>
        </Card>
      )
    }

    // 5. Text / Article Content
    if (lesson.lesson_type === 'text' || lesson.lesson_type === 'text_content') {
      return (
        <Card className="min-h-[50vh] w-full p-6 sm:p-10 border-border bg-card shadow-2xl rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs uppercase font-bold text-primary">
                Lecture Article
              </Badge>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{lesson.title}</h3>
            </div>
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed pt-2"
            dangerouslySetInnerHTML={{
              __html:
                rawSrc ||
                lesson.description ||
                lesson.summary ||
                '<p>Read through the lecture content, practical examples, and implementation patterns provided by the instructor.</p>',
            }}
          />
        </Card>
      )
    }

    // 6. Embed Source / iFrame
    if (lesson.lesson_type === 'embed' || lesson.lesson_type === 'embed_source' || lesson.lesson_type === 'iframe') {
      if (rawSrc.startsWith('<iframe')) {
        return (
          <div
            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: rawSrc }}
          />
        )
      }
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl">
          <iframe src={rawSrc} title={lesson.title} className="h-full w-full border-0" allowFullScreen />
        </div>
      )
    }

    // 7. Video Fallback
    const videoSrc =
      rawSrc && (rawSrc.startsWith('http') || rawSrc.startsWith('/') || rawSrc.includes('.mp4') || rawSrc.includes('.webm'))
        ? rawSrc
        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl">
        <VideoPlayer
          key={`vp-fallback-${lesson.id}-${videoSrc}`}
          source={{
            type: 'video',
            sources: [
              {
                src: videoSrc,
                provider: 'html5',
              },
            ],
          }}
          onEnded={() => handleVideoEnded(lesson.id)}
        />
      </div>
    )
  }

  // Active Quiz View Renderer
  const renderQuizContent = (quiz: QuizItem) => {
    const rawQuestions = quiz.questions || []
    const questions: QuestionItem[] = rawQuestions.map((q: any) => {
      let parsedOptions: string[] = []
      if (typeof q.options === 'string') {
        try {
          parsedOptions = JSON.parse(q.options)
        } catch {
          parsedOptions = q.options.split(',').map((s: string) => s.trim())
        }
      } else if (Array.isArray(q.options)) {
        parsedOptions = q.options
      }
      return {
        id: q.id,
        title: q.title || 'Question prompt',
        type: q.type || 'single_choice',
        options: parsedOptions,
        answer: q.answer || '',
      }
    })

    // 1. Summary Screen
    if (quizScreen === 'summary') {
      return (
        <Card className="min-h-[55vh] w-full p-6 sm:p-10 border-border bg-card shadow-2xl rounded-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <Badge variant="outline" className="text-xs uppercase font-bold text-amber-500 border-amber-500/30">
                  Section Assessment Quiz
                </Badge>
                <h3 className="text-2xl font-bold text-foreground mt-0.5">{quiz.title}</h3>
              </div>
            </div>

            {quiz.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{quiz.summary}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Questions</p>
                <p className="text-xl font-bold text-foreground">{questions.length}</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Total Marks</p>
                <p className="text-xl font-bold text-foreground">{quiz.total_marks || 100}</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Pass Mark</p>
                <p className="text-xl font-bold text-emerald-500">{quiz.pass_mark || 50}%</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Duration</p>
                <p className="text-xl font-bold text-foreground">{quiz.duration || `${quiz.minutes || 30} mins`}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              <span>Attempts permitted: <strong>{quiz.retake || 3}</strong></span>
              {completedItemIds.has(quiz.id) && (
                <span className="ml-3 text-emerald-500 font-semibold flex-inline items-center gap-1">
                  ✓ Passed & Completed
                </span>
              )}
            </div>
            <Button size="lg" onClick={handleStartQuiz} className="font-bold text-sm px-8 w-full sm:w-auto">
              <PlayCircle className="mr-2 h-4 w-4" />
              {completedItemIds.has(quiz.id) ? 'Retake Quiz' : 'Start Assessment'}
            </Button>
          </div>
        </Card>
      )
    }

    // 2. Questions View Screen
    if (quizScreen === 'questions') {
      const currentQ = questions[currentQIndex]
      if (!currentQ) {
        return (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No questions found for this quiz.</p>
            <Button onClick={() => setQuizScreen('summary')} className="mt-4">
              Return to Summary
            </Button>
          </Card>
        )
      }

      const isLastQ = currentQIndex === questions.length - 1
      const currentSelected = quizAnswers[String(currentQ.id)] || ''
      const optionsList = Array.isArray(currentQ.options) ? currentQ.options : []

      return (
        <Card className="min-h-[60vh] w-full p-6 sm:p-10 border-border bg-card shadow-2xl rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                  Question {currentQIndex + 1} of {questions.length}
                </Badge>
                <span className="text-xs text-muted-foreground">{quiz.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Timer Active</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{currentQ.title}</h3>

            {/* Render options based on question type */}
            {currentQ.type === 'boolean' ? (
              <RadioGroup
                value={currentSelected}
                onValueChange={(val) => handleQuizAnswerChange(currentQ.id, val)}
                className="space-y-3 pt-2"
              >
                {['True', 'False'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => handleQuizAnswerChange(currentQ.id, opt)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      currentSelected === opt
                        ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                        : 'border-border bg-muted/20 hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <RadioGroupItem value={opt} id={`q-${currentQ.id}-${opt}`} />
                    <Label htmlFor={`q-${currentQ.id}-${opt}`} className="cursor-pointer text-sm font-medium">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <RadioGroup
                value={currentSelected}
                onValueChange={(val) => handleQuizAnswerChange(currentQ.id, val)}
                className="space-y-3 pt-2"
              >
                {optionsList.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    onClick={() => handleQuizAnswerChange(currentQ.id, opt)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      currentSelected === opt
                        ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                        : 'border-border bg-muted/20 hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <RadioGroupItem value={opt} id={`q-${currentQ.id}-${oIdx}`} />
                    <Label htmlFor={`q-${currentQ.id}-${oIdx}`} className="cursor-pointer text-sm font-medium flex-1">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
            <Button
              variant="outline"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {isLastQ ? (
              <Button onClick={handleQuizSubmit} disabled={submittingQuiz} className="font-bold px-8">
                {submittingQuiz ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Grading Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Assessment
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}>
                Next Question
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      )
    }

    // 3. Results Screen
    return (
      <Card className="min-h-[55vh] w-full p-6 sm:p-10 border-border bg-card shadow-2xl rounded-2xl flex flex-col justify-between text-center space-y-6">
        <div className="space-y-4 max-w-lg mx-auto">
          <div
            className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
              quizResult?.isPassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {quizResult?.isPassed ? <Award className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            {quizResult?.isPassed ? 'Assessment Passed!' : 'Assessment Incomplete'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {quizResult?.isPassed
              ? 'Great job! You demonstrated mastery of this module curriculum.'
              : 'You did not reach the minimum passing grade. Please review the lesson lectures and retake.'}
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Your Score</p>
              <p className="text-xl font-bold text-foreground">
                {quizResult?.obtainedMarks || 0} / {quizResult?.totalMarks || 100}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Correct</p>
              <p className="text-xl font-bold text-emerald-500">{quizResult?.correctCount || 0}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Incorrect</p>
              <p className="text-xl font-bold text-destructive">{quizResult?.incorrectCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" onClick={handleStartQuiz}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Retake Quiz
          </Button>
          {nextItem && (
            <Button
              onClick={() =>
                handleSelectItem(nextItem.type, nextItem.item, nextItem.sectionTitle, nextItem.sectionId)
              }
            >
              Continue to Next Lesson
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1:1 Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to course</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-50 sm:max-w-md">
            {courseTitle}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Bar & Certificate Dialog */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold">
              {progressPercentage}% Completed
            </span>
            <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Certificate Claim Modal Trigger */}
          {progressPercentage >= 100 && (
            <ClaimCertificateDialog
              courseId={courseId ?? 1}
              courseTitle={courseTitle}
              trigger={
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8 shadow-sm cursor-pointer">
                  <Award className="h-3.5 w-3.5 mr-1" />
                  Claim Certificate
                </Button>
              }
            />
          )}

          {/* Syllabus Sidebar Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xs h-8"
          >
            <Menu className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Show'} Syllabus</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video / Media / Quiz Player & Learning Tabs Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Dynamic Player Screen */}
            {activeItem?.type === 'lesson' ? (
              renderLessonMedia(activeItem.data)
            ) : activeItem?.type === 'quiz' ? (
              renderQuizContent(activeItem.data)
            ) : (
              <div className="flex h-72 items-center justify-center border border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground">Select a lesson or quiz from the syllabus to begin.</p>
              </div>
            )}

            {/* Lesson / Quiz Header Bar: Title & Controls */}
            {activeItem && (
              <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold border-transparent text-xs uppercase">
                      {activeItem.type === 'lesson' ? activeItem.data.lesson_type || 'Video Lesson' : 'Quiz'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Section: {activeItem.sectionTitle}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {activeItem.data.title}
                  </h2>
                  {activeItem.type === 'lesson' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated duration: {activeItem.data.duration || `${activeItem.data.duration_minutes || 15} minutes`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => toggleItemCompletion(activeItem.data.id, true, true)}
                    disabled={isMarking}
                    variant={completedItemIds.has(activeItem.data.id) ? 'outline' : 'default'}
                    className={
                      completedItemIds.has(activeItem.data.id)
                        ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md hover:shadow-lg transition-all'
                    }
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    {completedItemIds.has(activeItem.data.id) ? 'Completed ✓' : 'Mark as Complete & Next'}
                  </Button>
                </div>
              </div>
            )}

            {/* Prev / Next Navigation */}
            <div className="flex items-center justify-between py-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevItem}
                onClick={() =>
                  prevItem &&
                  handleSelectItem(prevItem.type, prevItem.item, prevItem.sectionTitle, prevItem.sectionId)
                }
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Item
              </Button>

              <Button
                variant="default"
                size="sm"
                disabled={!nextItem}
                onClick={() =>
                  nextItem &&
                  handleSelectItem(nextItem.type, nextItem.item, nextItem.sectionTitle, nextItem.sectionId)
                }
              >
                Next Item
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Learning Tabs Under Player */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
              <TabsList className="h-10 border-b border-border bg-transparent gap-2 p-0 w-full justify-start rounded-none">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Overview & Notes
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Resources ({lessonResources.length})
                </TabsTrigger>
                <TabsTrigger
                  value="discussions"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Q&A Discussions ({discussions.length})
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                  Personal Notes ({savedNotes.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="p-4 sm:p-6 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Lecture Notes & Key Takeaways</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {activeItem?.type === 'lesson'
                    ? activeItem.data.description ||
                      activeItem.data.summary ||
                      'Review the core architectural concepts covered in this module. Apply the patterns directly in your local development environment and verify with unit tests.'
                    : activeItem?.data.summary ||
                      'Complete this module quiz to test your comprehension of the covered materials.'}
                </p>
                <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1.5 border border-border/50">
                  <p className="font-semibold text-foreground">Recommended Next Steps:</p>
                  <p>• Follow along with the instructor code examples and tests.</p>
                  <p>• Download any attached resource cheatsheets from the Resources tab.</p>
                  <p>• Mark this lesson complete to progress towards your course certificate.</p>
                </div>
              </TabsContent>

              {/* Tab 2: Downloadable Resources */}
              <TabsContent value="resources" className="p-4 sm:p-6 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Lecture Attachments & Downloads</h4>
                {loadingResources ? (
                  <div className="py-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading lesson assets...</p>
                  </div>
                ) : lessonResources.length === 0 ? (
                  <div className="py-8 text-center border border-dashed rounded-xl">
                    <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-muted-foreground">No extra downloadable files attached to this lesson.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lessonResources.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Download className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{r.title}</p>
                            <p className="text-xs text-muted-foreground uppercase">{r.type || 'Document'}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="text-xs h-8">
                          <a href={r.resource || '#'} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Q&A Discussions */}
              <TabsContent value="discussions" className="p-4 sm:p-6 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question about this lecture..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  />
                  <Button size="sm" onClick={handleAddQuestion} className="text-xs">
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Ask Question
                  </Button>
                </div>

                <div className="space-y-3 divide-y divide-border">
                  {discussions.map((d) => (
                    <div key={d.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img src={d.avatar} alt={d.author} className="h-5 w-5 rounded-full object-cover" />
                          <span className="font-semibold text-foreground">{d.author}</span>
                          <span className="text-muted-foreground">• {d.time}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{d.replies} replies</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">{d.question}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 4: Personal Notes */}
              <TabsContent value="notes" className="p-4 sm:p-6 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take a timestamped note at current video time..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button size="sm" onClick={handleAddNote} className="text-xs">
                    Save Note
                  </Button>
                </div>

                <div className="space-y-2">
                  {savedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background text-xs"
                    >
                      <Badge variant="secondary" className="text-xs font-mono shrink-0">
                        {note.time}
                      </Badge>
                      <p className="text-foreground leading-relaxed flex-1">{note.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right: Collapsible Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-border bg-card/60 backdrop-blur-md overflow-y-auto flex flex-col shrink-0">
            <div className="p-4 border-b border-border bg-muted/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Course Syllabus</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedItemIds.size} of {allCurriculumItems.length} items completed
              </p>
            </div>

            <div className="p-3 space-y-4 flex-1">
              {modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                    Section {mIdx + 1}: {module.title}
                  </p>
                  <div className="space-y-1">
                    {/* Lessons */}
                    {module.lessons.map((lesson) => {
                      const isActive = activeItem?.type === 'lesson' && activeItem.data.id === lesson.id
                      const isCompleted = completedItemIds.has(lesson.id)

                      const getIcon = () => {
                        if (lesson.lesson_type === 'document' || lesson.lesson_type === 'doc') {
                          return <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        }
                        if (lesson.lesson_type === 'image') {
                          return <ImageIcon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        }
                        if (lesson.lesson_type === 'text') {
                          return <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        }
                        if (lesson.lesson_type === 'embed') {
                          return <Code className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        }
                        return <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                      }

                      return (
                        <div
                          key={`l-${lesson.id}`}
                          onClick={() => handleSelectItem('lesson', lesson, module.title, module.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                            isActive
                              ? 'bg-[#D8FC38]/15 border border-[#D8FC38]/60 text-foreground font-bold'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleItemCompletion(lesson.id, false, true)
                              }}
                              className="shrink-0 p-0.5 rounded-full hover:scale-125 transition-transform"
                              title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 hover:text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-emerald-500" />
                              )}
                            </button>
                            {getIcon()}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 font-medium">
                            {lesson.duration || `${lesson.duration_minutes || 15}m`}
                          </span>
                        </div>
                      )
                    })}

                    {/* Quizzes */}
                    {module.quizzes.map((quiz) => {
                      const isActive = activeItem?.type === 'quiz' && activeItem.data.id === quiz.id
                      const isCompleted = completedItemIds.has(quiz.id)

                      return (
                        <div
                          key={`q-${quiz.id}`}
                          onClick={() => handleSelectItem('quiz', quiz, module.title, module.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                            isActive
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleItemCompletion(quiz.id, false, true)
                              }}
                              className="shrink-0 p-0.5 rounded-full hover:scale-125 transition-transform"
                              title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 hover:text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-emerald-500" />
                              )}
                            </button>
                            <HelpCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate font-medium">{quiz.title}</span>
                          </div>
                          <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0 font-bold">
                            {quiz.total_marks || 100} pts
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Certificate Action in Syllabus Sidebar */}
            {progressPercentage >= 100 && (
              <div className="p-3 border-t border-border bg-muted/20">
                <ClaimCertificateDialog
                  courseId={courseId ?? 1}
                  courseTitle={courseTitle}
                  trigger={
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md cursor-pointer gap-2">
                      <Award className="h-4 w-4" />
                      Course Certificate & Marksheet
                    </Button>
                  }
                />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
