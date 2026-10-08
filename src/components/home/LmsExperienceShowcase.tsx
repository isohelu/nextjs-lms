'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Video,
  CheckSquare,
  Award,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  Code2,
  FileCheck2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LmsShowcaseData,
  DEFAULT_LMS_SHOWCASE_DATA,
} from '@/lib/data/lms-showcase-section'

interface ExamQuestion {
  number: string
  total: string
  module: string
  marks: string
  question: string
  options: { id: string; text: string }[]
  nextLabel: string
}

const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    number: '03',
    total: '10',
    module: 'App Router & Server Components',
    marks: '10 Marks',
    question:
      'Which configuration export in Next.js 15 forces a Route Segment to dynamically render on every incoming request without static caching?',
    options: [
      { id: 'A', text: 'export const revalidate = 0' },
      { id: 'B', text: "export const dynamic = 'force-dynamic'" },
      { id: 'C', text: "export const fetchCache = 'default-no-store'" },
      { id: 'D', text: "export const runtime = 'edge'" },
    ],
    nextLabel: 'Proceed to Question 04',
  },
  {
    number: '04',
    total: '10',
    module: 'Data Mutations & Server Actions',
    marks: '10 Marks',
    question:
      'When executing asynchronous Server Actions in React 19 / Next.js 15, which React hook manages optimistic state transitions with automatic rollback on rejection?',
    options: [
      { id: 'A', text: 'useOptimistic combined with useTransition' },
      { id: 'B', text: 'useActionState with polling intervals' },
      { id: 'C', text: 'useEffect with AbortController signals' },
      { id: 'D', text: 'useSyncExternalStore subscription' },
    ],
    nextLabel: 'Back to Question 03',
  },
]

interface LmsExperienceShowcaseProps {
  initialData?: LmsShowcaseData
}

export default function LmsExperienceShowcase({ initialData }: LmsExperienceShowcaseProps) {
  const data = initialData || DEFAULT_LMS_SHOWCASE_DATA

  const [activeTab, setActiveTab] = useState<'video' | 'exam' | 'certificate'>('video')

  // Video Mode State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeLessonId, setActiveLessonId] = useState(1)

  // Exam Mode State
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({
    0: 'B',
    1: 'A',
  })

  const currentQuestion = EXAM_QUESTIONS[questionIdx]
  const currentSelectedAnswer = selectedAnswers[questionIdx] || ''

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionId,
    }))
  }

  const handleToggleQuestion = () => {
    setQuestionIdx((prev) => (prev === 0 ? 1 : 0))
  }

  const renderFeatureIcon = (
    icon: 'video' | 'code' | 'check' | 'award',
    fallback: React.ReactNode
  ) => {
    switch (icon) {
      case 'video':
        return <Play className="h-5 w-5 fill-current" />
      case 'code':
        return <Code2 className="h-5 w-5" />
      case 'check':
        return <FileCheck2 className="h-5 w-5" />
      case 'award':
        return <Award className="h-5 w-5" />
      default:
        return fallback
    }
  }

  return (
    <section className="relative py-14 sm:py-18 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. Section Header: 1:1 Reference Match                                     */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {data.title || 'Designed for Focused, Practical Study'}
          </h2>

          {/* Subtitle */}
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {data.description ||
              'A direct look into the actual learning environment — lecture streaming, proctored assessments, and official credential verification.'}
          </p>

          {/* Mode Selector Tabs */}
          <div className="mt-8 inline-flex items-center gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-0 overflow-x-auto max-w-full scrollbar-none">
            {/* Tab 1: Video Learning */}
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={cn(
                'relative flex items-center gap-2 pb-3 text-sm sm:text-[15px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'video'
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
              aria-pressed={activeTab === 'video'}
            >
              <Video className="h-4 w-4 shrink-0" />
              <span>{data.tab1Label || 'Video Learning'}</span>
              {activeTab === 'video' && (
                <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#D8FC38] rounded-full" />
              )}
            </button>

            {/* Tab 2: Examinations */}
            <button
              type="button"
              onClick={() => setActiveTab('exam')}
              className={cn(
                'relative flex items-center gap-2 pb-3 text-sm sm:text-[15px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'exam'
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
              aria-pressed={activeTab === 'exam'}
            >
              <CheckSquare className="h-4 w-4 shrink-0" />
              <span>{data.tab2Label || 'Examinations'}</span>
              {activeTab === 'exam' && (
                <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#D8FC38] rounded-full" />
              )}
            </button>

            {/* Tab 3: Certificate Verification */}
            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={cn(
                'relative flex items-center gap-2 pb-3 text-sm sm:text-[15px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeTab === 'certificate'
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
              aria-pressed={activeTab === 'certificate'}
            >
              <Award className="h-4 w-4 shrink-0" />
              <span>{data.tab3Label || 'Certificate Verification'}</span>
              {activeTab === 'certificate' && (
                <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#D8FC38] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Main Stage: Exact 1:1 Layout with Video Viewport + Playlist Card       */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
            
            {/* Left Col (8 cols): Real Cinema Video Viewport */}
            <div className="lg:col-span-8 flex flex-col justify-center">
              <div
                onClick={() => setIsPlaying((p) => !p)}
                className="group/video relative aspect-[16/9] w-full rounded-[22px] overflow-hidden bg-slate-900 shadow-md border border-slate-200/60 dark:border-white/10 flex flex-col justify-between p-4 sm:p-5 select-none cursor-pointer"
              >
                {/* Video Poster Image (Instructor with Laptop) */}
                <Image
                  src={data.videoPosterUrl || '/assets/images/lms-showcase-instructor.png'}
                  alt="LMS Course Lecture Preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover object-center pointer-events-none"
                  priority
                />

                {/* Subtle scrim for readability: dark at bottom for controls, soft at top for pill */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />

                {/* Top-Left Lesson Tag Pill */}
                <div className="relative z-10 self-start inline-flex items-center gap-2 text-xs text-white bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 pointer-events-none">
                  <span className="font-medium">
                    {data.videoTitleOverlay || '01. Course Overview & Prerequisites'}
                  </span>
                </div>

                {/* Center Play Button: Electric Lime */}
                <div className="relative z-10 self-center my-auto pointer-events-none">
                  <div
                    className={cn(
                      'flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-slate-950 shadow-xl transition-all duration-200',
                      isPlaying
                        ? 'bg-[#CBF128] scale-95'
                        : 'bg-[#D8FC38] group-hover/video:scale-105 group-hover/video:bg-[#CBF128]'
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Bottom Cinema Controls Bar */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 space-y-2 pt-2"
                >
                  {/* Progress Line */}
                  <div className="group/scrub relative w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-[#D8FC38] rounded-full transition-all duration-150"
                      style={{ width: isPlaying ? '42%' : '35%' }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-white pt-1">
                    {/* Left: Play/Pause, Volume, Timer */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        className="p-1 hover:text-[#D8FC38] transition-colors cursor-pointer"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMuted((m) => !m)}
                        className="p-1 hover:text-[#D8FC38] transition-colors cursor-pointer"
                        aria-label="Toggle Mute"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>

                      <span className="font-mono text-xs sm:text-[13px] text-white/90 font-medium pl-1">
                        {isPlaying ? '04:18 / 12:45' : data.videoDurationText || '04:15 / 12:45'}
                      </span>
                    </div>

                    {/* Right: Speed, CC, Settings, Fullscreen */}
                    <div className="flex items-center gap-2.5 sm:gap-3 text-white/90">
                      <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
                        1.25x
                      </span>
                      <span className="border border-white/60 text-white text-[10px] font-bold px-1 py-0.5 rounded leading-none">
                        CC
                      </span>
                      <button
                        type="button"
                        className="p-1 hover:text-[#D8FC38] transition-colors cursor-pointer"
                        aria-label="Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-[#D8FC38] transition-colors cursor-pointer"
                        aria-label="Fullscreen"
                      >
                        <Maximize className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Col (4 cols): Course Playlist Card */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="h-full rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  {/* Playlist Header */}
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {data.playlistOverline || 'COURSE PLAYLIST'}
                  </div>
                  <h3 className="mt-1 text-base sm:text-[17px] font-bold text-slate-900 dark:text-white leading-tight">
                    {data.playlistTitle || 'Full-Stack Next.js 15 & Modern Architecture'}
                  </h3>

                  {/* Playlist 4 Items with Timeline Indicator */}
                  <div className="mt-5 space-y-2 relative">
                    
                    {/* Vertical connecting line */}
                    <div className="absolute left-[7px] top-4 bottom-5 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none" />

                    {/* Lesson 1: Active */}
                    <div className="relative flex items-center gap-3">
                      <div className="relative z-10 w-3.5 flex items-center justify-center shrink-0">
                        <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                      </div>
                      <div
                        onClick={() => setActiveLessonId(1)}
                        className={cn(
                          'flex-1 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 cursor-pointer transition-colors',
                          activeLessonId === 1
                            ? 'bg-[#F4FDE2] dark:bg-lime-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-lime-300/40">
                          <Image
                            src={data.lesson1Thumb || '/assets/images/lesson-thumb-1.jpg'}
                            alt={data.lesson1Title || 'Lesson 1'}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-[#D8FC38]/20 flex items-center justify-center">
                            <Play className="h-3 w-3 fill-slate-950 text-slate-950" />
                          </div>
                        </div>

                        {/* Title & Status */}
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                            {data.lesson1Title || '01. Course Overview & Prerequisites'}
                          </p>
                          <p className="text-[11px] font-semibold text-[#65A30D] mt-0.5">
                            {data.lesson1Status || 'Active Lesson'}
                          </p>
                        </div>

                        {/* Duration */}
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-medium shrink-0">
                          {data.lesson1Duration || '12:45'}
                        </span>
                      </div>
                    </div>

                    {/* Lesson 2 */}
                    <div className="relative flex items-center gap-3">
                      <div className="relative z-10 w-3.5 flex items-center justify-center shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                      <div
                        onClick={() => setActiveLessonId(2)}
                        className={cn(
                          'flex-1 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 cursor-pointer transition-colors',
                          activeLessonId === 2
                            ? 'bg-[#F4FDE2] dark:bg-lime-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        )}
                      >
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                          <Image
                            src={data.lesson2Thumb || '/assets/images/lesson-thumb-2.jpg'}
                            alt={data.lesson2Title || 'Lesson 2'}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="h-3 w-3 fill-white text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                            {data.lesson2Title || '02. Core Theoretical Foundations'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {data.lesson2Status || 'Next Lesson'}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          {data.lesson2Duration || '18:20'}
                        </span>
                      </div>
                    </div>

                    {/* Lesson 3 */}
                    <div className="relative flex items-center gap-3">
                      <div className="relative z-10 w-3.5 flex items-center justify-center shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                      <div
                        onClick={() => setActiveLessonId(3)}
                        className={cn(
                          'flex-1 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 cursor-pointer transition-colors',
                          activeLessonId === 3
                            ? 'bg-[#F4FDE2] dark:bg-lime-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        )}
                      >
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                          <Image
                            src={data.lesson3Thumb || '/assets/images/lesson-thumb-3.jpg'}
                            alt={data.lesson3Title || 'Lesson 3'}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="h-3 w-3 fill-white text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                            {data.lesson3Title || '03. Building Production Components'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {data.lesson3Status || 'Upcoming'}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          {data.lesson3Duration || '24:10'}
                        </span>
                      </div>
                    </div>

                    {/* Lesson 4 */}
                    <div className="relative flex items-center gap-3">
                      <div className="relative z-10 w-3.5 flex items-center justify-center shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                      <div
                        onClick={() => setActiveLessonId(4)}
                        className={cn(
                          'flex-1 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 cursor-pointer transition-colors',
                          activeLessonId === 4
                            ? 'bg-[#F4FDE2] dark:bg-lime-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        )}
                      >
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                          <Image
                            src={data.lesson4Thumb || '/assets/images/lesson-thumb-4.jpg'}
                            alt={data.lesson4Title || 'Lesson 4'}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="h-3 w-3 fill-white text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                            {data.lesson4Title || '04. Deployment & Best Practices'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {data.lesson4Status || 'Upcoming'}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          {data.lesson4Duration || '16:30'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Action Button */}
                <Link
                  href={data.playlistBtnUrl || '/courses'}
                  className="mt-6 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors duration-150"
                >
                  <span>{data.playlistBtnText || 'Explore All 24 Lessons'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: EXAMINATIONS                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'exam' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            <div className="lg:col-span-8 rounded-[22px] bg-slate-900 border border-white/10 p-6 sm:p-8 space-y-6 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-[#D8FC38]/20 text-[#D8FC38] font-mono text-xs font-bold px-2.5 py-1">
                    Question {currentQuestion.number} of {currentQuestion.total}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400">
                    Module: {currentQuestion.module}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-slate-400 font-mono">
                  {currentQuestion.marks}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {currentQuestion.question}
                </h3>
                <p className="text-sm text-slate-400">
                  Select one option from the choices below.
                </p>
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentSelectedAnswer === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer(opt.id)}
                      className={cn(
                        'rounded-xl p-3.5 sm:p-4 flex items-center justify-between text-sm cursor-pointer transition-colors duration-100',
                        isSelected
                          ? 'border-2 border-[#D8FC38] bg-slate-800/90 text-white'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
                      )}
                    >
                      <span
                        className={cn(
                          'font-mono text-sm font-bold mr-3',
                          isSelected ? 'text-[#D8FC38]' : 'text-slate-400'
                        )}
                      >
                        {opt.id}.
                      </span>
                      <span className={cn('flex-1 text-sm', isSelected && 'font-semibold text-white')}>
                        {opt.text}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-bold text-[#D8FC38] uppercase tracking-wider shrink-0 ml-2">
                          Selected
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs sm:text-sm text-slate-400">
                  Answers auto-saved to current attempt
                </span>
                <button
                  type="button"
                  onClick={handleToggleQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] px-5 sm:px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors duration-100 cursor-pointer"
                >
                  <span>{currentQuestion.nextLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Exam Specification
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  Full-Stack Next.js 15 & TypeScript Certification Exam
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <Clock className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">1 Hour 30 Minutes Duration</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">1h 24m remaining in active attempt</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <CheckCircle2 className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">75% Passing Threshold</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">8 out of 10 questions required</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <HelpCircle className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">100 Total Marks</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Deterministic multiple-choice</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <ShieldCheck className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Accredited Qualification</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official credential issued</p>
                  </div>
                </div>
              </div>

              <Link
                href="/exams"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition-colors"
              >
                <span>Explore All Certification Exams</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: CERTIFICATE VERIFICATION                                          */}
        {/* ========================================================================= */}
        {activeTab === 'certificate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            <div className="lg:col-span-7 rounded-[22px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-[#D8FC38]/40 p-6 sm:p-8 text-center space-y-5 shadow-xl text-white">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D8FC38]/40 bg-slate-900 text-[#D8FC38]">
                <Award className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <p className="text-xs tracking-widest text-slate-400 uppercase font-semibold">
                  Mentor Learning Management System
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Certificate of Achievement
                </h3>
              </div>

              <div className="space-y-2 py-2 max-w-md mx-auto">
                <p className="text-sm text-slate-400 italic">This document certifies that</p>
                <p className="text-xl font-bold text-white tracking-wide border-b border-white/10 pb-1.5 inline-block px-6">
                  Alex M.
                </p>
                <p className="text-sm text-slate-400 pt-1">
                  has successfully satisfied all curriculum standards for
                </p>
                <p className="text-base sm:text-lg font-bold text-[#D8FC38]">
                  Full-Stack Next.js 15 & Modern React Architecture
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-400 font-mono">
                <span>Credential ID: <strong className="text-[#D8FC38] font-bold">CERT-MLMS-2026-9901</strong></span>
                <span>Issued: October 2026</span>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5D4] dark:bg-lime-950/40 border border-[#DCEDB8] dark:border-lime-800/40 px-3.5 py-1 text-xs font-semibold text-[#365314] dark:text-[#BEF264]">
                <CheckCircle2 className="h-4 w-4 text-[#84CC16]" />
                <span>Official Record Verified</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Registered in Mentor LMS Registry
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  This credential is an active, verified qualification stored within the institutional ledger and publicly verifiable by employers.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Credential ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">CERT-MLMS-2026-9901</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span className="font-semibold text-[#65A30D]">Active & Valid</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Recipient</span>
                  <span className="font-medium text-slate-900 dark:text-white">Alex M. (Verified Graduate)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/verify-certificate?code=CERT-MLMS-2026-9901"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] px-4 py-3 text-sm font-bold text-slate-950 transition-colors shadow-xs"
                >
                  <span>Verify This Credential in Registry</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. Bottom 4 Features Row: Exact 1:1 Match to Reference Image              */}
        {/* ========================================================================= */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-200/80 lg:dark:divide-slate-800">
            
            {/* Feature 1: High-Quality Video Lessons */}
            <div className="flex items-center gap-4 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="h-12 w-12 rounded-2xl bg-[#EEFADC] dark:bg-lime-950/40 text-[#4D7C0F] dark:text-[#A3E635] flex items-center justify-center shrink-0">
                {renderFeatureIcon(data.feat1Icon, <Play className="h-5 w-5 fill-current" />)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                  {data.feat1Title || 'High-Quality Video Lessons'}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.feat1Subtitle || 'Learn at your own pace'}
                </p>
              </div>
            </div>

            {/* Feature 2: Hands-on Practice Projects */}
            <div className="flex items-center gap-4 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="h-12 w-12 rounded-2xl bg-[#F0EEFF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-[#C084FC] flex items-center justify-center shrink-0">
                {renderFeatureIcon(data.feat2Icon, <Code2 className="h-5 w-5" />)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                  {data.feat2Title || 'Hands-on Practice Projects'}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.feat2Subtitle || 'Build real-world skills'}
                </p>
              </div>
            </div>

            {/* Feature 3: Proctored Examinations */}
            <div className="flex items-center gap-4 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="h-12 w-12 rounded-2xl bg-[#F9F4EB] dark:bg-amber-950/40 text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
                {renderFeatureIcon(data.feat3Icon, <FileCheck2 className="h-5 w-5" />)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                  {data.feat3Title || 'Proctored Examinations'}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.feat3Subtitle || 'Test your knowledge'}
                </p>
              </div>
            </div>

            {/* Feature 4: Verified Certificates */}
            <div className="flex items-center gap-4 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="h-12 w-12 rounded-2xl bg-[#EBF3FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                {renderFeatureIcon(data.feat4Icon, <Award className="h-5 w-5" />)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                  {data.feat4Title || 'Verified Certificates'}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.feat4Subtitle || 'Earn industry-recognized credentials'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
