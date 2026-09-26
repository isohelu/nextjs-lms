'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  Code
} from 'lucide-react'

interface LearnPageProps {
  params: Promise<{
    slug: string
  }>
}

interface LessonItem {
  id: string | number
  title: string
  duration_minutes: number
  video_url?: string
  content?: string
  is_free_preview?: boolean
}

interface ModuleItem {
  id: string | number
  title: string
  lessons: LessonItem[]
}

// Fallback curriculum structure for demo / offline
const DEFAULT_SYLLABUS: ModuleItem[] = [
  {
    id: 1,
    title: 'Module 1: Foundations & Architecture Setup',
    lessons: [
      {
        id: '1-1',
        title: '1.1 System Architecture & Technical Stack',
        duration_minutes: 14,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: 'In this introductory lesson, we dissect the end-to-end full-stack architecture, database models, Edge SSR routing, and state hydration mechanics.',
        is_free_preview: true
      },
      {
        id: '1-2',
        title: '1.2 Workspace Initialization & Dependency Setup',
        duration_minutes: 18,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        content: 'Configuring Node.js runtime, strict TypeScript compiler options, Tailwind CSS design tokens, and git pre-commit hooks.',
        is_free_preview: true
      },
      {
        id: '1-3',
        title: '1.3 Database Schema Modeling with Supabase',
        duration_minutes: 25,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        content: 'Creating normalized relational tables for courses, modules, lessons, user enrollments, and progress tracking.',
        is_free_preview: false
      }
    ]
  },
  {
    id: 2,
    title: 'Module 2: Core Implementation & Security',
    lessons: [
      {
        id: '2-1',
        title: '2.1 Next.js 15 App Router & Server Components',
        duration_minutes: 22,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        content: 'Deep dive into async React Server Components, server actions, and optimistic UI transitions.',
        is_free_preview: false
      },
      {
        id: '2-2',
        title: '2.2 Dynamic Nonce-based CSP & OWASP Hardening',
        duration_minutes: 30,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        content: 'Implementing Next.js middleware with cryptographically secure random nonces, strict CSP, and rate limiting.',
        is_free_preview: false
      },
      {
        id: '2-3',
        title: '2.3 Video Streaming Player & Progress Synchronization',
        duration_minutes: 28,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        content: 'Building the interactive video player canvas, tracking watch duration, and persisting progress to database.',
        is_free_preview: false
      }
    ]
  },
  {
    id: 3,
    title: 'Module 3: Capstone Deployment & Certification',
    lessons: [
      {
        id: '3-1',
        title: '3.1 Automated Testing & CI/CD Pipelines',
        duration_minutes: 26,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        content: 'Writing end-to-end Playwright tests, unit validation, and GitHub Actions continuous integration.',
        is_free_preview: false
      },
      {
        id: '3-2',
        title: '3.2 Production Deployment & Edge Caching',
        duration_minutes: 20,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        content: 'Configuring edge networks, image optimization, dynamic sitemaps, and Schema.org structured data.',
        is_free_preview: false
      }
    ]
  }
]

export default function CourseLearnPage({ params }: LearnPageProps) {
  const { slug } = use(params)
  const router = useRouter()

  const [courseId, setCourseId] = useState<number | null>(null)
  const [courseTitle, setCourseTitle] = useState('Full-Stack Web Development Masterclass')
  const [modules, setModules] = useState<ModuleItem[]>(DEFAULT_SYLLABUS)
  const [currentLesson, setCurrentLesson] = useState<LessonItem>(DEFAULT_SYLLABUS[0].lessons[0])
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string | number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [userId, setUserId] = useState<number | string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notes, setNotes] = useState<string>('')
  const [savedNotes, setSavedNotes] = useState<{ id: number; time: string; text: string }[]>([
    { id: 1, time: '02:45', text: 'Remember to configure strict TypeScript flags and paths in tsconfig.json.' },
    { id: 2, time: '08:15', text: 'Dynamic nonces must be generated per request in middleware.ts.' }
  ])
  const [newQuestion, setNewQuestion] = useState('')
  const [discussions, setDiscussions] = useState<{ id: number; author: string; avatar: string; time: string; question: string; replies: number }[]>([
    {
      id: 1,
      author: 'Marcus Chen',
      avatar: '/assets/avatars/avatar-2.png',
      time: '2 hours ago',
      question: 'How does Next.js 15 handle streaming SSR when dynamic nonces are used in the CSP header?',
      replies: 3
    },
    {
      id: 2,
      author: 'Elena Rostova',
      avatar: '/assets/avatars/avatar-3.png',
      time: '1 day ago',
      question: 'Is it recommended to wrap client components in React.Suspense when fetching Supabase session data?',
      replies: 5
    }
  ])

  useEffect(() => {
    async function loadData() {
      // 1. Get authenticated user
      let currentUser: any = null
      try {
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.user) {
            currentUser = userData.user
            setUserId(userData.user.id)
          }
        }
      } catch {}

      // 2. Fetch course by slug from API
      try {
        const cRes = await fetch(`/api/courses?limit=100`)
        if (cRes.ok) {
          const cData = await cRes.json()
          const matchedCourse = (cData.courses || []).find((c: any) => c.slug === slug)
          if (matchedCourse) {
            setCourseId(matchedCourse.id)
            setCourseTitle(matchedCourse.title)

            // 3. Initialize player session
            const initRes = await fetch(`/api/student/courses/${matchedCourse.id}/play/init`, {
              method: 'POST',
            })

            if (initRes.ok) {
              const initData = await initRes.json()
              if (initData.curriculum && initData.curriculum.length > 0) {
                const formatted: ModuleItem[] = initData.curriculum.map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  lessons: (m.lessons || []).map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    duration_minutes: parseInt(l.duration || '15', 10) || 15,
                    video_url: l.lesson_src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    content: l.description || 'Guided lecture video with live codebase demonstrations.',
                    is_free_preview: Boolean(l.is_free),
                  }))
                }))
                setModules(formatted)
                if (formatted[0]?.lessons?.[0]) {
                  setCurrentLesson(formatted[0].lessons[0])
                }
              }

              if (initData.watchHistory?.completed_watching) {
                try {
                  const completedArr = JSON.parse(initData.watchHistory.completed_watching)
                  if (Array.isArray(completedArr)) {
                    setCompletedLessonIds(new Set(completedArr))
                  }
                } catch {}
              }
            } else if (initRes.status === 403) {
              // Auto-enroll student if not enrolled yet for smooth demo
              await fetch('/api/student/enrollments/course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: matchedCourse.id }),
              })
              // Retry init
              const retryRes = await fetch(`/api/student/courses/${matchedCourse.id}/play/init`, { method: 'POST' })
              if (retryRes.ok) {
                const retryData = await retryRes.json()
                if (retryData.curriculum && retryData.curriculum.length > 0) {
                  const formatted: ModuleItem[] = retryData.curriculum.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    lessons: (m.lessons || []).map((l: any) => ({
                      id: l.id,
                      title: l.title,
                      duration_minutes: parseInt(l.duration || '15', 10) || 15,
                      video_url: l.lesson_src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                      content: l.description || 'Guided lecture video.',
                      is_free_preview: Boolean(l.is_free),
                    }))
                  }))
                  setModules(formatted)
                  if (formatted[0]?.lessons?.[0]) {
                    setCurrentLesson(formatted[0].lessons[0])
                  }
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

  // Collect all lessons in sequential order
  const allLessons: LessonItem[] = []
  modules.forEach((m) => {
    m.lessons.forEach((l) => allLessons.push(l))
  })

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const progressPercentage =
    allLessons.length > 0
      ? Math.round((completedLessonIds.size / allLessons.length) * 100)
      : 0

  const toggleLessonCompletion = async (lessonId: string | number) => {
    setIsMarking(true)
    const isCurrentlyCompleted = completedLessonIds.has(lessonId)
    const newCompleted = new Set(completedLessonIds)
    if (isCurrentlyCompleted) {
      newCompleted.delete(lessonId)
    } else {
      newCompleted.add(lessonId)
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }
    }
    setCompletedLessonIds(newCompleted)

    // Persist to backend progress API
    if (courseId) {
      const numLessonId = typeof lessonId === 'number' ? lessonId : parseInt(String(lessonId), 10)
      if (!isNaN(numLessonId)) {
        try {
          await fetch(`/api/student/courses/${courseId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lesson_id: numLessonId,
              completed: !isCurrentlyCompleted,
            }),
          })
        } catch {}
      }
    }
    setIsMarking(false)
  }

  const handleAddNote = () => {
    if (!notes.trim()) return
    setSavedNotes([
      ...savedNotes,
      { id: Date.now(), time: '04:12', text: notes.trim() }
    ])
    setNotes('')
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
        replies: 0
      },
      ...discussions
    ])
    setNewQuestion('')
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
            <Dialog>
              <DialogTrigger
                render={
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Claim Certificate
                  </Button>
                }
              />
              <DialogContent className="max-w-lg p-6 text-center space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-amber-500">
                    <Award className="h-7 w-7" />
                    Congratulations! Course Completed
                  </DialogTitle>
                </DialogHeader>
                <div className="rounded-xl border-4 border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Certificate of Accomplishment</p>
                  <h3 className="text-xl font-bold text-foreground">Verified Student</h3>
                  <p className="text-xs text-muted-foreground">has successfully completed all requirements for</p>
                  <p className="text-base font-semibold text-primary">{courseTitle}</p>
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-4 border-t border-border">
                    <span>Issued: {new Date().toLocaleDateString()}</span>
                    <span>Credential ID: MLMS-{((courseId ?? 1) * 10007).toString().padStart(6, '0')}</span>
                  </div>
                </div>
                <Button className="w-full font-bold">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Certificate
                </Button>
              </DialogContent>
            </Dialog>
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
        {/* Left: Video Player & Learning Tabs Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* 16:9 Video Canvas */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-2xl">
              <video
                key={currentLesson.id}
                controls
                autoPlay
                className="h-full w-full object-contain"
                src={currentLesson.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              />
            </div>

            {/* Lesson Bar: Title & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-border">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {currentLesson.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated duration: {currentLesson.duration_minutes} minutes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => toggleLessonCompletion(currentLesson.id)}
                  disabled={isMarking}
                  variant={completedLessonIds.has(currentLesson.id) ? 'outline' : 'default'}
                  className={
                    completedLessonIds.has(currentLesson.id)
                      ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
                  }
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  {completedLessonIds.has(currentLesson.id) ? 'Completed' : 'Mark as Complete & Next'}
                </Button>
              </div>
            </div>

            {/* Prev / Next Lesson Navigation */}
            <div className="flex items-center justify-between py-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && setCurrentLesson(prevLesson)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Lesson
              </Button>

              <Button
                variant="default"
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && setCurrentLesson(nextLesson)}
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Learning Tabs Under Video Canvas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
              <TabsList className="h-10 border-b border-border bg-transparent gap-2 p-0 w-full justify-start rounded-none">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Lesson Overview
                </TabsTrigger>
                <TabsTrigger
                  value="discussions"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Q&A Discussions ({discussions.length})
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Resources (3)
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                  Personal Notes ({savedNotes.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Lesson Overview */}
              <TabsContent value="overview" className="p-4 rounded-xl border border-border bg-card/60 mt-4 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Lecture Notes & Key Takeaways</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {currentLesson.content ||
                    'Review the core architectural concepts covered in this module. Apply the patterns directly in your local development environment and verify with unit tests.'}
                </p>
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Recommended Next Steps:</p>
                  <p>• Clone the sample repository and run local tests.</p>
                  <p>• Verify CSP nonce headers in your browser network tab.</p>
                  <p>• Take the knowledge check quiz at the end of this module.</p>
                </div>
              </TabsContent>

              {/* Tab 2: Q&A Discussions */}
              <TabsContent value="discussions" className="p-4 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
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
                        <span className="text-muted-foreground text-[11px]">{d.replies} replies</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-7">{d.question}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3: Downloadable Resources */}
              <TabsContent value="resources" className="p-4 rounded-xl border border-border bg-card/60 mt-4 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Lecture Attachments & Code</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs">
                    <div className="flex items-center gap-3">
                      <Code className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">starter-code-repository.zip</p>
                        <p className="text-[11px] text-muted-foreground">Source code & sample configs (4.2 MB)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-foreground">architecture-cheatsheet.pdf</p>
                        <p className="text-[11px] text-muted-foreground">Visual diagrams and OWASP security rules (1.8 MB)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Personal Notes */}
              <TabsContent value="notes" className="p-4 rounded-xl border border-border bg-card/60 mt-4 space-y-4">
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
                    <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background text-xs">
                      <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Course Syllabus
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {completedLessonIds.size} of {allLessons.length} lessons completed
              </p>
            </div>

            <div className="p-3 space-y-4 flex-1">
              {modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-1.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                    Section {mIdx + 1}: {module.title}
                  </p>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isActive = currentLesson.id === lesson.id
                      const isCompleted = completedLessonIds.has(lesson.id)

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-primary/10 border border-primary/30 text-primary font-semibold'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                            {lesson.duration_minutes}m
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
