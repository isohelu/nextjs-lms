'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Course, Module, Lesson } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Code
} from 'lucide-react'

interface LearnPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CourseLearnPage({ params }: LearnPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMarking, setIsMarking] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourseAndProgress() {
      setLoading(true)

      // Get authenticated user if any
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Fetch course with modules and lessons
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:modules(
            *,
            lessons:lessons(*)
          )
        `)
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setLoading(false)
        return
      }

      // Sort modules and lessons
      const sortedModules = (data.modules || []).sort(
        (a: Module, b: Module) => a.order_index - b.order_index
      )
      sortedModules.forEach((m: Module) => {
        if (m.lessons) {
          m.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        }
      })

      data.modules = sortedModules
      setCourse(data)

      // Set initial lesson
      const firstLesson = sortedModules[0]?.lessons?.[0]
      if (firstLesson) {
        setCurrentLesson(firstLesson)
      }

      // Fetch user's completed lessons if authenticated
      if (user) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('course_id', data.id)
          .eq('completed', true)

        if (progressData) {
          setCompletedLessonIds(new Set(progressData.map((p) => p.lesson_id)))
        }
      }

      setLoading(false)
    }

    loadCourseAndProgress()
  }, [slug, supabase])

  // Collect all lessons in sequence
  const allLessons: Lesson[] = []
  course?.modules?.forEach((m) => {
    m.lessons?.forEach((l) => allLessons.push(l))
  })

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const progressPercentage =
    allLessons.length > 0
      ? Math.round((completedLessonIds.size / allLessons.length) * 100)
      : 0

  const toggleLessonCompletion = async (lessonId: string) => {
    setIsMarking(true)
    const isCompleted = completedLessonIds.has(lessonId)
    const newCompleted = new Set(completedLessonIds)

    if (isCompleted) {
      newCompleted.delete(lessonId)
    } else {
      newCompleted.add(lessonId)
    }
    setCompletedLessonIds(newCompleted)

    if (userId && course) {
      if (!isCompleted) {
        await supabase.from('lesson_progress').upsert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: course.id,
          completed: true,
          completed_at: new Date().toISOString(),
        })

        // Also update enrollment progress
        const newPct = Math.round((newCompleted.size / allLessons.length) * 100)
        await supabase.from('enrollments').upsert({
          user_id: userId,
          course_id: course.id,
          progress_percent: newPct,
          completed_at: newPct === 100 ? new Date().toISOString() : null,
        })
      } else {
        await supabase
          .from('lesson_progress')
          .delete()
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
      }
    }

    setIsMarking(false)
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="size-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-xs text-muted-foreground">Loading interactive classroom...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-indigo-400 text-sm">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Top Classroom Bar */}
      <div className="h-14 border-b border-border/40 bg-card/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to course</span>
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[240px] sm:max-w-md">
            {course.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {progressPercentage}% Completed
            </span>
            <Progress value={progressPercentage} className="w-28 h-2 bg-muted" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xs h-8"
          >
            <Menu className="size-3.5 mr-1" />
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Show'} Syllabus</span>
          </Button>
        </div>
      </div>

      {/* Main Classroom Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video / Lesson Player Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Media Player Container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border/60 shadow-2xl">
                {currentLesson.video_url?.includes('youtube.com') ? (
                  <iframe
                    src={currentLesson.video_url}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-zinc-950 to-background p-6 text-center space-y-4">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Code className="size-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentLesson.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md">
                        Interactive guided lecture with full source examples and architecture blueprint.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-border/40">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground">
                    {currentLesson.title}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Estimated duration: {currentLesson.duration_minutes} minutes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleLessonCompletion(currentLesson.id)}
                    disabled={isMarking}
                    variant={completedLessonIds.has(currentLesson.id) ? 'outline' : 'default'}
                    className={
                      completedLessonIds.has(currentLesson.id)
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
                    }
                    size="sm"
                  >
                    <Check className="size-4 mr-1.5" />
                    {completedLessonIds.has(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
                  </Button>
                </div>
              </div>

              {/* Lesson Body Content */}
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                <div className="p-4 rounded-xl bg-card/60 border border-border/60">
                  <h4 className="text-xs uppercase font-bold text-indigo-400 mb-2 tracking-wider">
                    Lesson Overview & Notes
                  </h4>
                  <p className="text-xs leading-relaxed text-foreground/90">
                    {currentLesson.content ||
                      'Review the core architectural concepts covered in this module. Apply the patterns directly in your local development environment and verify with unit tests.'}
                  </p>
                </div>
              </div>

              {/* Navigation buttons: Prev / Next */}
              <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                  className="text-xs font-semibold"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous Lesson
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Next Lesson
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Select a lesson from the syllabus to begin.
            </div>
          )}
        </div>

        {/* Right: Collapsible Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-border/40 bg-card/40 backdrop-blur-md overflow-y-auto flex flex-col shrink-0">
            <div className="p-4 border-b border-border/40 bg-card/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Course Syllabus
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {completedLessonIds.size} of {allLessons.length} lessons completed
              </p>
            </div>

            <div className="p-3 space-y-4 flex-1">
              {course.modules?.map((module, mIdx) => (
                <div key={module.id} className="space-y-1.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                    Section {mIdx + 1}: {module.title}
                  </p>
                  <div className="space-y-1">
                    {module.lessons?.map((lesson) => {
                      const isActive = currentLesson?.id === lesson.id
                      const isCompleted = completedLessonIds.has(lesson.id)

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300 font-semibold'
                              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            {isCompleted ? (
                              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
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
