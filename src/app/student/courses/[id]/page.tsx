'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Award,
  HelpCircle,
  Download,
  CheckCircle2,
  Clock,
  PlayCircle,
  Calendar,
  ExternalLink,
  Upload,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Loader2,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function StudentCourseDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string
  const tabParam = params?.tab as string
  const validTabs = ['modules', 'live_classes', 'assignments', 'quizzes', 'resources', 'certificate']
  const initialTab = (tabParam && validTabs.includes(tabParam)) ? tabParam : 'modules'

  const [activeTab, setActiveTab] = useState<'modules' | 'live_classes' | 'assignments' | 'quizzes' | 'resources' | 'certificate'>(initialTab as any)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  // Sync state if URL route tab param changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  // Assignment submission dialog state
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null)
  const [attachmentPath, setAttachmentPath] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/student/courses/${courseId}`)
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (res.status === 403) {
          setError('You are not enrolled in this course.')
          return
        }
        throw new Error('Failed to load course details.')
      }
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        setError(json.message || 'Error loading course.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittingAssignment || !attachmentPath.trim()) return

    setIsSubmitting(true)
    setSubmitSuccess('')
    try {
      const res = await fetch(`/api/student/courses/${courseId}/assignments/${submittingAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachment_path: attachmentPath,
          comment
        })
      })
      const resJson = await res.json()
      if (resJson.success) {
        setSubmitSuccess('Assignment submitted successfully!')
        setTimeout(() => {
          setSubmittingAssignment(null)
          setAttachmentPath('')
          setComment('')
          setSubmitSuccess('')
          loadCourseData()
        }, 1500)
      } else {
        alert(resJson.message || 'Failed to submit.')
      }
    } catch (err) {
      alert('Error submitting assignment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading enrolled course dashboard...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          {error || 'Unable to access this course. Please verify enrollment or contact platform support.'}
        </p>
        <Button asChild>
          <Link href="/student">Return to Student Portal</Link>
        </Button>
      </div>
    )
  }

  const { course, completion, sections, live_classes, assignments, quizzes, resources, student_marks } = data

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      {/* Header Banner */}
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/student" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
              Enrolled Course
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
              {course.level}
            </Badge>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl line-clamp-2">
                {course.short_description || course.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <span>Instructor: <strong className="text-foreground">{course.instructor?.name}</strong></span>
                <span>•</span>
                <span>{completion?.total_lessons} Lessons</span>
                <span>•</span>
                <span>{assignments?.length || 0} Assignments</span>
                <span>•</span>
                <span>{live_classes?.length || 0} Live Sessions</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
              <div className="space-y-1.5 w-full sm:w-44 text-right sm:text-left">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="text-primary">{completion?.percent}%</span>
                </div>
                <Progress value={completion?.percent} className="h-2" />
                <p className="text-[11px] text-muted-foreground">
                  {completion?.completed_lessons} of {completion?.total_lessons} completed
                </p>
              </div>

              <Button asChild size="lg" className="w-full sm:w-auto shadow-sm">
                <Link href={`/courses/${course.slug}/learn`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Learning
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-border bg-background sticky top-0 z-20 shadow-xs">
        <div className="container mx-auto max-w-6xl px-4 flex gap-2 overflow-x-auto py-2">
          {[
            { id: 'modules', label: 'Curriculum & Lessons', count: completion?.total_lessons, icon: BookOpen },
            { id: 'live_classes', label: 'Live Classes', count: live_classes?.length, icon: Video },
            { id: 'assignments', label: 'Assignments', count: assignments?.length, icon: FileText },
            { id: 'quizzes', label: 'Quizzes', count: quizzes?.length, icon: HelpCircle },
            { id: 'resources', label: 'Downloadable Resources', count: resources?.length, icon: Download },
            { id: 'certificate', label: 'Certificate & Grade', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  router.push(`/student/courses/${courseId}/${tab.id}`)
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

      {/* Tab Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Tab 1: Curriculum & Modules */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Course Sections & Lessons</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Explore syllabus, watch video lessons, and complete section quizzes.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${course.slug}/learn`}>
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Launch Video Player
                </Link>
              </Button>
            </div>

            {sections?.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">Curriculum in preparation</p>
                <p className="text-xs text-muted-foreground mt-1">The instructor will publish lesson materials soon.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {sections.map((sec: any, idx: number) => (
                  <Card key={sec.id} className="border-border overflow-hidden bg-card">
                    <div className="bg-muted/30 px-5 py-3.5 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{sec.title}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {sec.lessons?.length || 0} Lessons • {sec.quizzes?.length || 0} Quizzes
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {sec.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            {lesson.is_completed ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="capitalize">{lesson.lesson_type || 'Video'}</span>
                                {lesson.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{lesson.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button asChild size="sm" variant={lesson.is_completed ? 'outline' : 'default'} className="text-xs">
                            <Link href={`/courses/${course.slug}/learn`}>
                              <PlayCircle className="mr-1 h-3.5 w-3.5" />
                              {lesson.is_completed ? 'Review' : 'Play'}
                            </Link>
                          </Button>
                        </div>
                      ))}

                      {sec.quizzes?.map((quiz: any) => (
                        <div key={quiz.id} className="p-4 bg-muted/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{quiz.title}</p>
                                {quiz.is_passed && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                                    Passed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Pass Mark: {quiz.pass_mark}% • Best Score: {quiz.submission ? `${quiz.submission.total_marks} marks` : 'Not attempted'}
                              </p>
                            </div>
                          </div>

                          <Button asChild size="sm" variant="outline" className="text-xs">
                            <Link href={`/courses/${course.slug}/learn`}>
                              {quiz.submission ? 'Retake Quiz' : 'Start Quiz'}
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Classes */}
        {activeTab === 'live_classes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Live Webinars & Zoom Sessions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Participate in live interactive mentoring, Q&A, and technical workshops.</p>
            </div>

            {live_classes?.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No Live Classes Scheduled</p>
                <p className="text-xs text-muted-foreground mt-1">Your instructor has not scheduled any live webinars for this course yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {live_classes.map((item: any) => (
                  <Card key={item.id} className="p-6 border-border flex flex-col justify-between gap-4 bg-card">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary capitalize text-xs">
                          {item.provider || 'Zoom'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{item.class_date_and_time ? new Date(item.class_date_and_time).toLocaleDateString() : 'Upcoming'}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{item.class_topic}</h3>
                      {item.class_note && (
                        <p className="text-xs text-muted-foreground line-clamp-3">{item.class_note}</p>
                      )}
                    </div>

                    <Button className="w-full" asChild>
                      <a href={item.additional_info || '#'} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Live Broadcast
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Course Homework & Lab Projects</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Submit homework deliverables for instructor grading and review.</p>
            </div>

            {assignments?.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No Assignments Assigned</p>
                <p className="text-xs text-muted-foreground mt-1">This course currently has no homework deliverables.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => {
                  const submission = assignment.submission
                  return (
                    <Card key={assignment.id} className="p-6 border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">{assignment.title}</h3>
                          {submission?.status === 'graded' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                              Graded: {submission.marks_obtained} / {assignment.total_mark}
                            </Badge>
                          ) : submission ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                              Under Review (Attempt #{submission.attempt_number})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Pending Submission
                            </Badge>
                          )}
                        </div>

                        {assignment.summary && (
                          <p className="text-xs text-muted-foreground">{assignment.summary}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span>Total Marks: <strong className="text-foreground">{assignment.total_mark}</strong></span>
                          <span>•</span>
                          <span>Pass Mark: <strong className="text-foreground">{assignment.pass_mark}</strong></span>
                          <span>•</span>
                          <span>Deadline: <strong className="text-foreground">{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Open'}</strong></span>
                        </div>

                        {submission?.instructor_feedback && (
                          <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs mt-2">
                            <strong className="text-foreground block mb-0.5">Instructor Feedback:</strong>
                            <p className="text-muted-foreground">{submission.instructor_feedback}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Dialog open={submittingAssignment?.id === assignment.id} onOpenChange={(open) => {
                          if (!open) setSubmittingAssignment(null)
                          else setSubmittingAssignment(assignment)
                        }}>
                          <DialogTrigger
                            render={
                              <Button size="sm" variant={submission ? 'outline' : 'default'} className="w-full sm:w-auto">
                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                {submission ? 'Resubmit Deliverable' : 'Submit Assignment'}
                              </Button>
                            }
                          />
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold">
                                Submit: {assignment.title}
                              </DialogTitle>
                            </DialogHeader>

                            {submitSuccess ? (
                              <div className="py-6 text-center space-y-2">
                                <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                                <p className="text-sm font-semibold text-foreground">{submitSuccess}</p>
                              </div>
                            ) : (
                              <form onSubmit={handleAssignmentSubmit} className="space-y-4 mt-2">
                                <div>
                                  <label className="text-xs font-semibold text-foreground block mb-1">
                                    Deliverable URL / Cloud Attachment Link *
                                  </label>
                                  <Input
                                    required
                                    placeholder="https://github.com/... or https://drive.google.com/..."
                                    value={attachmentPath}
                                    onChange={(e) => setAttachmentPath(e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-semibold text-foreground block mb-1">
                                    Notes for Instructor
                                  </label>
                                  <Textarea
                                    rows={3}
                                    placeholder="Describe your implementation, architecture decisions, or test steps..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                  <Button type="button" variant="outline" onClick={() => setSubmittingAssignment(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Confirm Submission
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Section Quizzes & Assessments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Test your comprehension across course modules.</p>
            </div>

            {quizzes?.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No Quizzes Available</p>
                <p className="text-xs text-muted-foreground mt-1">This course does not currently include section quizzes.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((q: any) => (
                  <Card key={q.id} className="p-6 border-border flex flex-col justify-between gap-4 bg-card">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-semibold">
                          Total Marks: {q.total_mark}
                        </Badge>
                        {q.best_submission ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                            Score: {q.best_submission.total_marks} / {q.total_mark}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                            Unattempted
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground">{q.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Pass Mark: {q.pass_mark}% • Duration: {q.duration || `${q.minutes || 20} mins`}
                      </p>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.slug}/learn`}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        {q.best_submission ? 'Retake Quiz' : 'Take Quiz'}
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Downloadable Resources */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Downloadable Lesson Assets</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Source code repositories, slide decks, and cheat sheets.</p>
            </div>

            {resources?.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Download className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No Resources Attached</p>
                <p className="text-xs text-muted-foreground mt-1">This course does not include extra downloadable files.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {resources.map((resItem: any) => (
                  <Card key={resItem.id} className="p-4 border-border flex items-center justify-between gap-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{resItem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          From: {resItem.lesson_title || 'Course Lesson'} • Type: {resItem.type || 'File'}
                        </p>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline">
                      <a href={resItem.resource || '#'} download target="_blank" rel="noopener noreferrer">
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Certificate & Grade Summary */}
        {activeTab === 'certificate' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-foreground">Academic Performance & Certificate</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Evaluation breakdown based on quizzes, assignments, and lesson milestones.</p>
            </div>

            {/* Marks Breakdown Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Assignments</span>
                <p className="text-2xl font-bold text-foreground">
                  {student_marks?.assignment?.obtained} / {student_marks?.assignment?.total}
                </p>
                <p className="text-xs text-muted-foreground">{student_marks?.assignment?.percentage}% average</p>
              </Card>

              <Card className="p-5 border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Quizzes</span>
                <p className="text-2xl font-bold text-foreground">
                  {student_marks?.quiz?.obtained} / {student_marks?.quiz?.total}
                </p>
                <p className="text-xs text-muted-foreground">{student_marks?.quiz?.percentage}% average</p>
              </Card>

              <Card className="p-5 border-border bg-primary/5 text-center space-y-1">
                <span className="text-xs text-primary font-bold uppercase">Overall Grade</span>
                <p className="text-3xl font-black text-primary">
                  {student_marks?.overall?.grade}
                </p>
                <p className="text-xs text-muted-foreground">{student_marks?.overall?.percentage}% final score</p>
              </Card>
            </div>

            {/* Certificate Status */}
            <Card className="p-8 border-border text-center space-y-4 bg-card">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Official Course Completion Certificate</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {completion?.percent >= 100
                    ? 'Congratulations! You have successfully satisfied all curriculum requirements for this course.'
                    : `Complete remaining lessons (${completion?.percent}% finished) to unlock your verified credential.`}
                </p>
              </div>

              {completion?.percent >= 100 ? (
                <div className="flex justify-center gap-3 pt-2">
                  <Button asChild>
                    <Link href={`/certificates/CERT-MLMS-2026-9901`}>
                      <Award className="mr-2 h-4 w-4" />
                      View & Download Certificate
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/courses/${course.slug}/learn`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Complete Course Lessons
                  </Link>
                </Button>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
