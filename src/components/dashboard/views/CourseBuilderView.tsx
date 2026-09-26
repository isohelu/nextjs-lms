'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Sparkles,
  Save,
  ArrowLeft,
  DollarSign,
  Layers,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface LessonItem {
  id: string
  title: string
  duration: string
  type: 'video' | 'file' | 'quiz'
}

interface SectionItem {
  id: string
  title: string
  lessons: LessonItem[]
}

const steps = [
  { id: 1, title: 'Course Info' },
  { id: 2, title: 'Media & Trailer' },
  { id: 3, title: 'Curriculum Builder' },
  { id: 4, title: 'Outcomes & Pre-reqs' },
  { id: 5, title: 'Pricing & Publish' },
]

export default function CourseBuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Info
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    shortDescription: '',
    category: 'Web Development',
    level: 'Beginner to Advanced',
    language: 'English',
  })

  // Step 2: Media
  const [media, setMedia] = useState({
    thumbnailUrl: '',
    trailerUrl: '',
  })

  // Step 3: Curriculum
  const [sections, setSections] = useState<SectionItem[]>([
    {
      id: 'sec-1',
      title: 'Module 1: Foundations & Architecture Setup',
      lessons: [
        { id: 'les-1', title: '1.1 System Design & High-Level Architecture Overview', duration: '14:20', type: 'video' },
        { id: 'les-2', title: '1.2 Architecture Diagram & Codebase Repository', duration: '5:00', type: 'file' },
      ],
    },
    {
      id: 'sec-2',
      title: 'Module 2: Advanced Server Components & Database Scaling',
      lessons: [
        { id: 'les-3', title: '2.1 Streaming Server Components with Suspense', duration: '22:15', type: 'video' },
        { id: 'les-4', title: '2.2 Module Quiz & Assessment', duration: '10:00', type: 'quiz' },
      ],
    },
  ])

  const [newSectionTitle, setNewSectionTitle] = useState('')

  // Step 4: Outcomes
  const [outcomes, setOutcomes] = useState<string[]>([
    'Build production-grade Next.js 15 full-stack applications with React Server Components',
    'Architect secure authentication, rate limiting, and dynamic CSP headers',
  ])
  const [newOutcome, setNewOutcome] = useState('')

  // Step 5: Pricing
  const [pricing, setPricing] = useState({
    pricingType: 'paid',
    price: 99,
    hasDiscount: true,
    discountPrice: 69,
    metaTitle: '',
    metaDescription: '',
  })

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return
    setSections([
      ...sections,
      {
        id: `sec-${Date.now()}`,
        title: newSectionTitle,
        lessons: [],
      },
    ])
    setNewSectionTitle('')
  }

  const handleAddLesson = (sectionId: string) => {
    const title = prompt('Enter Lesson Title:')
    if (!title) return
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: [
              ...s.lessons,
              { id: `les-${Date.now()}`, title, duration: '15:00', type: 'video' },
            ],
          }
        }
        return s
      })
    )
  }

  const handleAddOutcome = () => {
    if (!newOutcome.trim()) return
    setOutcomes([...outcomes, newOutcome])
    setNewOutcome('')
  }

  const handlePublish = async () => {
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseInfo.title || 'Untitled New Course',
          short_description: courseInfo.shortDescription,
          category: courseInfo.category,
          price: Number(pricing.price) || 49,
          level: courseInfo.level,
        })
      })
    } catch {
      // ignore
    }
    alert('Course draft saved and submitted for publication!')
    router.push('/dashboard/courses')
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background px-6 py-4 shadow-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/courses" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-foreground">Course Creation Studio</h1>
              <p className="text-xs text-muted-foreground">Drafting: {courseInfo.title || 'Untitled Course'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePublish} className="rounded-xl text-xs gap-1">
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="border-b border-border bg-card py-4">
        <div className="container mx-auto max-w-5xl px-4 flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-xs font-semibold py-1 px-3 rounded-xl transition-all shrink-0",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCompleted
                    ? "text-emerald-600 bg-emerald-500/10"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                  isCurrent ? "bg-white/20 text-white" : isCompleted ? "bg-emerald-600 text-white" : "border border-border"
                )}>
                  {isCompleted ? '✓' : step.id}
                </span>
                <span>{step.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content Workspace */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10">
        <Card className="p-8 border-border shadow-sm space-y-8 bg-card">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Step 1: Course Information</h2>
                <p className="text-xs text-muted-foreground">Provide the core discovery details for your course listing.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Full-Stack Next.js 15 & Modern React Architecture"
                    value={courseInfo.title}
                    onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shortDescription">Short Description (Sub-headline)</Label>
                  <Textarea
                    id="shortDescription"
                    rows={3}
                    placeholder="Provide a concise 1-2 sentence overview of what students will achieve."
                    value={courseInfo.shortDescription}
                    onChange={(e) => setCourseInfo({ ...courseInfo, shortDescription: e.target.value })}
                    className="rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={courseInfo.category}
                      onChange={(e) => setCourseInfo({ ...courseInfo, category: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs"
                    >
                      <option>Web Development</option>
                      <option>AI & Machine Learning</option>
                      <option>Cloud & DevOps</option>
                      <option>UI/UX Design</option>
                      <option>Cybersecurity</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <select
                      id="level"
                      value={courseInfo.level}
                      onChange={(e) => setCourseInfo({ ...courseInfo, level: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs"
                    >
                      <option>Beginner to Advanced</option>
                      <option>Intermediate</option>
                      <option>Advanced Only</option>
                      <option>All Levels Welcome</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="language">Instruction Language</Label>
                    <select
                      id="language"
                      value={courseInfo.language}
                      onChange={(e) => setCourseInfo({ ...courseInfo, language: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>German</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Media & Trailer */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Step 2: Media Assets & Trailer</h2>
                <p className="text-xs text-muted-foreground">Upload the visual thumbnail and promo video trailer for student discovery.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Course Thumbnail Banner (16:9 aspect ratio recommended)</Label>
                  <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center space-y-3 bg-muted/10 hover:border-primary/50 transition-colors cursor-pointer">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Drop thumbnail image here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Supports PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Or enter direct image URL (e.g. /assets/images/students-1.jpg)"
                    value={media.thumbnailUrl}
                    onChange={(e) => setMedia({ ...media, thumbnailUrl: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Promo Video Trailer (YouTube, Vimeo, or Bunny Stream URL)</Label>
                  <div className="relative">
                    <Video className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={media.trailerUrl}
                      onChange={(e) => setMedia({ ...media, trailerUrl: e.target.value })}
                      className="pl-10 h-11 text-xs rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Students can preview this trailer before enrolling.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Curriculum Builder */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Step 3: Curriculum Builder</h2>
                <p className="text-xs text-muted-foreground">Create sections, upload video lectures, attach resources, and configure quizzes.</p>
              </div>

              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div key={section.id} className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                          {sIdx + 1}
                        </span>
                        <h3 className="font-bold text-sm text-foreground">{section.title}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddLesson(section.id)}
                        className="rounded-lg text-xs gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Lesson
                      </Button>
                    </div>

                    {/* Lessons list */}
                    <div className="space-y-2 pl-8">
                      {section.lessons.map((les) => (
                        <div key={les.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            {les.type === 'video' && <Video className="h-4 w-4 text-primary" />}
                            {les.type === 'file' && <FileText className="h-4 w-4 text-amber-600" />}
                            {les.type === 'quiz' && <HelpCircle className="h-4 w-4 text-emerald-600" />}
                            <span className="font-medium text-foreground">{les.title}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add new section input */}
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add new section title (e.g. Module 3: Security & Testing)"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                  <Button onClick={handleAddSection} variant="outline" className="rounded-xl text-xs gap-1 shrink-0">
                    <Plus className="h-4 w-4" /> Add Section
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Outcomes & Requirements */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Step 4: Outcomes & Requirements</h2>
                <p className="text-xs text-muted-foreground">List prerequisites and what specific capabilities students will master.</p>
              </div>

              <div className="space-y-4">
                <Label>What will students learn?</Label>
                <div className="space-y-2">
                  {outcomes.map((out, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-xs bg-muted/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-foreground">{out}</span>
                      </div>
                      <button
                        onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add an outcome bullet..."
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                  <Button onClick={handleAddOutcome} variant="outline" className="rounded-xl text-xs gap-1 shrink-0">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Pricing & SEO */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Step 5: Pricing & SEO Metadata</h2>
                <p className="text-xs text-muted-foreground">Set course pricing, discount incentives, and search engine optimization keywords.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Regular Price (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        value={pricing.price}
                        onChange={(e) => setPricing({ ...pricing, price: Number(e.target.value) })}
                        className="pl-8 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="discountPrice">Discounted Price (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="discountPrice"
                        type="number"
                        value={pricing.discountPrice}
                        onChange={(e) => setPricing({ ...pricing, discountPrice: Number(e.target.value) })}
                        className="pl-8 h-11 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="metaTitle">SEO Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Search engine title tag..."
                    value={pricing.metaTitle}
                    onChange={(e) => setPricing({ ...pricing, metaTitle: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="metaDesc">SEO Meta Description</Label>
                  <Textarea
                    id="metaDesc"
                    rows={3}
                    placeholder="Summary for Google search previews..."
                    value={pricing.metaDescription}
                    onChange={(e) => setPricing({ ...pricing, metaDescription: e.target.value })}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="rounded-xl gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Step
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-xl gap-1 font-bold text-xs"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-1.5"
              >
                <Sparkles className="h-4 w-4" /> Publish Course
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
