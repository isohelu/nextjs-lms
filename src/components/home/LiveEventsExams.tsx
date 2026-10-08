'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Star,
  Users,
  Heart,
  TrendingUp,
  ChevronDown,
  ShieldCheck,
  Video,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import LearningJourney from '@/components/home/LearningJourney'
import SeatReservationModal, {
  ReserveSessionTarget,
} from '@/components/home/SeatReservationModal'
import {
  DEFAULT_LIVE_SCHEDULES_DATA,
  LiveEventItem,
  MasterclassScheduleCardItem,
  LiveSchedulesSectionData,
} from '@/lib/data/live-schedules-section'

// Functional Real-Time Countdown Timer
function CountdownTimerBox({
  initialHours,
  initialMinutes,
  initialSeconds,
  isLive,
}: {
  initialHours: number
  initialMinutes: number
  initialSeconds: number
  isLive?: boolean
}) {
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  })

  useEffect(() => {
    setTimeLeft({
      hours: initialHours,
      minutes: initialMinutes,
      seconds: initialSeconds,
    })
  }, [initialHours, initialMinutes, initialSeconds])

  useEffect(() => {
    if (isLive) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive])

  const pad = (num: number) => String(num).padStart(2, '0')

  if (isLive) {
    return (
      <div className="rounded-[18px] border border-red-500/40 dark:border-red-500/40 bg-red-50/80 dark:bg-red-950/40 p-3.5 backdrop-blur-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            Classroom Active
          </span>
          <span className="text-[11px] font-semibold">Broadcasting Now</span>
        </div>
        <div className="mt-2 text-center py-1">
          <span className="font-mono text-base font-black text-red-600 dark:text-red-400">
            SESSION IN PROGRESS
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-3.5 backdrop-blur-xs">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#FF6B2C]" />
          Remaining Time
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 py-1.5 px-1">
          <span className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {pad(timeLeft.hours)}
          </span>
          <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">
            Hours
          </span>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 py-1.5 px-1">
          <span className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {pad(timeLeft.minutes)}
          </span>
          <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">
            Minutes
          </span>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 py-1.5 px-1">
          <span className="font-mono text-base sm:text-lg font-black text-[#FF6B2C]">
            {pad(timeLeft.seconds)}
          </span>
          <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">
            Seconds
          </span>
        </div>
      </div>
    </div>
  )
}

interface LiveEventsExamsProps {
  journeyData?: any
  initialData?: Partial<LiveSchedulesSectionData>
}

export default function LiveEventsExams({
  journeyData,
  initialData,
}: LiveEventsExamsProps) {
  // Merge initial database data with fallback defaults
  const [data, setData] = useState<LiveSchedulesSectionData>(() => ({
    ...DEFAULT_LIVE_SCHEDULES_DATA,
    ...initialData,
    liveEvents:
      initialData?.liveEvents && initialData.liveEvents.length > 0
        ? initialData.liveEvents
        : DEFAULT_LIVE_SCHEDULES_DATA.liveEvents,
    schedules:
      initialData?.schedules && initialData.schedules.length > 0
        ? initialData.schedules
        : DEFAULT_LIVE_SCHEDULES_DATA.schedules,
  }))

  const [activeFilter, setActiveFilter] = useState<'all' | 'masterclass' | 'exam' | 'workshop'>('all')
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'masterclass' | 'certification' | 'workshop' | 'exam'>('all')
  const [wishlistedScheduleIds, setWishlistedScheduleIds] = useState<string[]>([])
  
  // Seat Reservation Modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ReserveSessionTarget | null>(null)

  const cardsContainerRef = useRef<HTMLDivElement>(null)

  // Initialize wishlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lms_wishlist_schedules')
      if (stored) {
        setWishlistedScheduleIds(JSON.parse(stored))
      }
    } catch (e) {
      // LocalStorage access fallback
    }
  }, [])

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        liveEvents:
          initialData.liveEvents && initialData.liveEvents.length > 0
            ? initialData.liveEvents
            : prev.liveEvents,
        schedules:
          initialData.schedules && initialData.schedules.length > 0
            ? initialData.schedules
            : prev.schedules,
      }))
    }
  }, [initialData])

  const toggleScheduleWishlist = (id: string) => {
    setWishlistedScheduleIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem('lms_wishlist_schedules', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }

  const handleScrollLeft = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const handleScrollRight = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  // Open reservation modal for Section 1 Live Event
  const handleOpenEventModal = (evt: LiveEventItem) => {
    setSelectedSession({
      id: evt.id,
      title: evt.title,
      categoryLabel: evt.categoryLabel,
      dateStr: `${evt.day}, ${evt.month} ${evt.date}`,
      timeStr: evt.time,
      instructor: evt.instructor,
      instructorRole: evt.instructorRole,
      instructorAvatar: evt.avatar,
      thumbnail: evt.thumbnail,
      seatsLeft: evt.seatsLeft,
      isLiveNow: evt.isLiveNow,
      liveRoomUrl: evt.liveRoomUrl,
      type: 'event',
    })
    setReserveModalOpen(true)
  }

  // Open reservation modal for Section 2 Schedule Card
  const handleOpenScheduleModal = (sch: MasterclassScheduleCardItem) => {
    setSelectedSession({
      id: sch.id,
      title: sch.title,
      categoryLabel: sch.categoryLabel,
      dateStr: `${sch.dateWeekday}, ${sch.dateMonth} ${sch.dateDay}`,
      timeStr: sch.time,
      instructor: sch.instructorName,
      instructorAvatar: sch.instructorAvatar,
      thumbnail: sch.thumbnail,
      seatsLeft: sch.seatsLeft,
      price: sch.price,
      liveRoomUrl: sch.liveRoomUrl,
      type: 'schedule',
    })
    setReserveModalOpen(true)
  }

  // Automatically reopen session modal if returning from login or register
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const openSessionId = params.get('openSession') || params.get('openEvent') || params.get('openSchedule')
    if (!openSessionId) return

    const evt = data.liveEvents.find((e) => e.id === openSessionId)
    if (evt) {
      handleOpenEventModal(evt)
      return
    }

    const sch = data.schedules.find((s) => s.id === openSessionId)
    if (sch) {
      handleOpenScheduleModal(sch)
      return
    }
  }, [data.liveEvents, data.schedules])

  // Decrement seat count in local state after successful booking
  const handleSuccessReserve = (sessionId: string, newSeatsLeft: number) => {
    setData((prev) => ({
      ...prev,
      liveEvents: prev.liveEvents.map((evt) =>
        evt.id === sessionId ? { ...evt, seatsLeft: newSeatsLeft } : evt
      ),
      schedules: prev.schedules.map((sch) =>
        sch.id === sessionId ? { ...sch, seatsLeft: newSeatsLeft } : sch
      ),
    }))
  }

  const filteredSchedule =
    scheduleFilter === 'all'
      ? data.schedules
      : data.schedules.filter((item) => item.category === scheduleFilter)

  const filteredEvents =
    activeFilter === 'all'
      ? data.liveEvents
      : data.liveEvents.filter((e) => e.category === activeFilter)

  return (
    <>
      {/* SECTION 1: Live Sessions & Exams Cards */}
      <section className="relative py-8 sm:py-10 lg:py-12 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header: Centered & Clean (Pill Removed) */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
              {data.sec1Title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {data.sec1Description}
            </p>
          </div>

          {/* Filter Pills: Centered Cleanly */}
          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <div className="flex flex-wrap items-center justify-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'rounded-full px-4.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
                  activeFilter === 'all'
                    ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                )}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('masterclass')}
                className={cn(
                  'rounded-full px-4.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
                  activeFilter === 'masterclass'
                    ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                )}
              >
                Masterclasses
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('exam')}
                className={cn(
                  'rounded-full px-4.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
                  activeFilter === 'exam'
                    ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                )}
              >
                Accredited Exams
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('workshop')}
                className={cn(
                  'rounded-full px-4.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
                  activeFilter === 'workshop'
                    ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                )}
              >
                Workshops
              </button>
            </div>
          </div>

          {/* 3 Live Event Cards Grid: 100% Static & Stable */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="group relative flex flex-col justify-between h-full rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:shadow-lg hover:border-[#D8FC38]/60"
              >
                <div>
                  {/* Card Media Header - Expanded & Properly Framed */}
                  <div className="relative h-64 sm:h-72 lg:h-[280px] w-full overflow-hidden rounded-[22px] mb-5 shadow-2xs">
                    <Image
                      src={evt.thumbnail}
                      alt={evt.title}
                      fill
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />

                    {/* Top Status Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="rounded-full bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1 text-xs font-semibold shadow-xs">
                        {evt.categoryLabel}
                      </span>
                      {evt.isLiveNow && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#D8FC38] px-2.5 py-0.5 text-xs font-bold text-slate-950 shadow-xs animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-red-600" />
                          LIVE NOW
                        </span>
                      )}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 shadow-md border border-white/20 dark:border-slate-800/60">
                      <div className="text-center pr-2.5 border-r border-slate-200 dark:border-slate-700">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {evt.month}
                        </span>
                        <span className="block text-lg font-black text-slate-900 dark:text-white leading-none">
                          {evt.date}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {evt.day}
                        </span>
                        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {evt.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Functional Countdown Timer Box */}
                  <CountdownTimerBox
                    initialHours={evt.targetHours}
                    initialMinutes={evt.targetMinutes}
                    initialSeconds={evt.targetSeconds}
                    isLive={evt.isLiveNow}
                  />

                  {/* Event Title */}
                  <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-2 leading-snug group-hover:text-slate-700 dark:group-hover:text-[#D8FC38] transition-colors">
                    {evt.title}
                  </h3>

                  {/* Speaker Info */}
                  <div className="mt-3.5 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                        <Image
                          src={evt.avatar}
                          alt={evt.instructor}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight text-xs sm:text-sm">
                          {evt.instructor}
                        </p>
                        <p className="text-[11px] text-slate-500">{evt.instructorRole}</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {evt.seatsLeft} seats left
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button: Interactive Modal Trigger */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEventModal(evt)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer',
                      evt.isLiveNow
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950'
                    )}
                  >
                    <span>
                      {evt.isLiveNow
                        ? 'Join Live Classroom Now'
                        : evt.category === 'exam'
                        ? 'Register For Exam'
                        : 'Reserve Free Seat'}
                    </span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MIDDLE SECTION: Learning Journey (exact position marked by user) */}
      <LearningJourney initialData={journeyData} />

      {/* SECTION 2: Upcoming Masterclasses & Exam Schedules */}
      <section className="relative py-10 sm:py-12 lg:py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Filter & Navigation Header Row */}
          <div className="flex items-center justify-end gap-4 mb-8 sm:mb-10 pb-2">
            {/* Controls: Category Filters + Month Selector + Navigation Arrows */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { key: 'all', label: 'All Events' },
                  { key: 'masterclass', label: 'Masterclass' },
                  { key: 'certification', label: 'Certification' },
                  { key: 'workshop', label: 'Workshop' },
                  { key: 'exam', label: 'Exam' },
                ].map((pill) => {
                  const isActive = scheduleFilter === pill.key
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => setScheduleFilter(pill.key as any)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer',
                        isActive
                          ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                      )}
                    >
                      {pill.label}
                    </button>
                  )
                })}
              </div>

              {/* Time Selector Dropdown & Slider Navigation */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>This Month</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleScrollLeft}
                    aria-label="Previous events"
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollRight}
                    aria-label="Next events"
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: Info Panel (4 cols on lg, 3.5 on xl) */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between h-full pr-0 lg:pr-2">
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {data.sec2TitleLine1} <br />
                  <span className="text-slate-950 dark:text-white">{data.sec2TitleLine2}</span>{' '}
                  <br />
                  {data.sec2TitleLine3}
                </h3>

                <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm font-normal">
                  {data.sec2Description}
                </p>

                <div className="mt-5">
                  <Link
                    href={data.sec2ButtonUrl || '/schedules'}
                    className="inline-flex items-center gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 text-sm font-semibold px-5 py-2.5 shadow-xs transition-colors"
                  >
                    <span>{data.sec2ButtonText || 'View All Schedules'}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>
                </div>

                {/* Overlapping Instructor Avatars Stack */}
                <div className="mt-6 pt-1">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-2xs">
                        <Image
                          src="/assets/avatars/avatar-1.png"
                          alt="Instructor 1"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-2xs">
                        <Image
                          src="/assets/avatars/avatar-2.png"
                          alt="Instructor 2"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-2xs">
                        <Image
                          src="/assets/avatars/avatar-3.png"
                          alt="Instructor 3"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-2xs">
                        <Image
                          src="/assets/avatars/avatar-4.png"
                          alt="Instructor 4"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                        12+
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                    Learn from industry experts
                  </p>
                </div>
              </div>

              {/* Bottom 3 Feature Boxes in Row */}
              <div className="mt-7 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-1">
                  <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-[#D8FC38]/20 text-slate-950 dark:text-[#D8FC38]">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    <span>Live</span>
                    <span className="block text-slate-500 dark:text-slate-400 font-normal">
                      Sessions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1 border-l border-slate-100 dark:border-slate-800">
                  <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    <span>Expert</span>
                    <span className="block text-slate-500 dark:text-slate-400 font-normal">
                      Mentors
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1 border-l border-slate-100 dark:border-slate-800">
                  <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    <span>Certified</span>
                    <span className="block text-slate-500 dark:text-slate-400 font-normal">
                      Accredited
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Course Cards Grid */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div
                ref={cardsContainerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 items-stretch"
              >
                {filteredSchedule.map((item) => {
                  const isHearted = wishlistedScheduleIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-card-foreground shadow-2xs overflow-hidden select-none transition-[border-color,box-shadow] duration-200 hover:border-[#D8FC38]/70 hover:shadow-md"
                    >
                      <div>
                        {/* Top Thumbnail Image with Date Badge & Wishlist Heart */}
                        <div className="relative overflow-hidden rounded-t-2xl">
                          <div
                            onClick={() => handleOpenScheduleModal(item)}
                            className="block relative h-[220px] sm:h-[240px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                          >
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>

                          {/* Date Badge: Top Left */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950 text-white px-3 py-1.5 shadow-xs text-center pointer-events-none">
                            <span className="text-base font-bold leading-tight">
                              {item.dateDay}
                            </span>
                            <span className="text-xs font-semibold text-[#D8FC38] leading-tight">
                              {item.dateMonth}
                            </span>
                            <span className="text-xs font-normal text-slate-300 leading-tight">
                              {item.dateWeekday}
                            </span>
                          </div>

                          {/* Wishlist Heart Button: Top Right */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleScheduleWishlist(item.id)
                            }}
                            aria-label="Add to wishlist"
                            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:bg-white dark:hover:bg-slate-900 active:scale-95 cursor-pointer transition-all"
                          >
                            <Heart
                              className={cn(
                                'h-3.5 w-3.5 transition-colors',
                                isHearted
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                              )}
                            />
                          </button>
                        </div>

                        {/* Card Content Body */}
                        <div className="p-4 sm:p-5 pb-3">
                          {/* Meta: Category Badge + Price Badge + Clock Time */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  'px-2.5 py-0.5 text-xs font-semibold rounded-full',
                                  item.badgeVariant === 'emerald' &&
                                    'bg-[#D8FC38]/20 text-slate-900 dark:text-slate-100 border border-[#D8FC38]/40',
                                  item.badgeVariant === 'blue' &&
                                    'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50',
                                  item.badgeVariant === 'orange' &&
                                    'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50',
                                  item.badgeVariant === 'purple' &&
                                    'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50'
                                )}
                              >
                                {item.categoryLabel}
                              </span>

                              {item.price > 0 ? (
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                                  ${item.price}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                                  FREE
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{item.time}</span>
                            </div>
                          </div>

                          {/* Title */}
                          <h4
                            onClick={() => handleOpenScheduleModal(item)}
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-slate-950 dark:group-hover:text-white transition-colors cursor-pointer"
                          >
                            {item.title}
                          </h4>

                          {/* Short Description */}
                          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                            {item.description}
                          </p>

                          {/* Rating & Students Count */}
                          <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 font-normal">
                            <div className="flex items-center gap-1.5">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {item.rating.toFixed(1)}
                              </span>
                              <span className="text-slate-500">({item.reviewsCount})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {item.studentsCount}
                              </span>
                              <span>Students</span>
                            </div>
                          </div>

                          {/* Instructor Profile */}
                          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                              <div className="relative h-6.5 w-6.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700/80">
                                <Image
                                  src={item.instructorAvatar}
                                  alt={item.instructorName}
                                  fill
                                  sizes="26px"
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                {item.instructorName}
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-slate-500">
                              {item.seatsLeft} seats left
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Duration, Level & Reserve Seat Button */}
                      <div className="relative z-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 pt-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-normal shrink-0">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.level}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(item)}
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                            item.badgeVariant === 'emerald'
                              ? 'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 shadow-2xs'
                              : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#D8FC38] hover:border-[#D8FC38] hover:text-slate-950'
                          )}
                        >
                          <span>{item.price > 0 ? `Enroll • $${item.price}` : 'Reserve Free Seat'}</span>
                          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Carousel Pagination Dots */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-6 rounded-full bg-[#D8FC38]" />
                <span className="h-1.5 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="h-1.5 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive LMS Seat Reservation / Live Room Modal */}
      <SeatReservationModal
        session={selectedSession}
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        onSuccessReserve={handleSuccessReserve}
      />
    </>
  )
}
