'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Play,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Users,
  Star,
} from 'lucide-react'
import { AboutSectionData, DEFAULT_ABOUT_SECTION_DATA } from '@/lib/data/about-section'

interface AboutPlatformProps {
  initialData?: AboutSectionData
}

function parseStatValue(raw: string): {
  target: number
  prefix: string
  suffix: string
  decimals: number
  isNumeric: boolean
} {
  const match = raw.match(/^([^\d.]*)([\d,.]+)(.*)$/)
  if (!match) {
    return { target: 0, prefix: '', suffix: raw, decimals: 0, isNumeric: false }
  }
  const prefix = match[1] || ''
  const numStrRaw = match[2] || '0'
  const suffix = match[3] || ''
  const cleanNumStr = numStrRaw.replace(/,/g, '')
  const target = parseFloat(cleanNumStr)
  if (isNaN(target)) {
    return { target: 0, prefix: '', suffix: raw, decimals: 0, isNumeric: false }
  }
  const decimals = cleanNumStr.includes('.') ? cleanNumStr.split('.')[1].length : 0
  return { target, prefix, suffix, decimals, isNumeric: true }
}

function AnimatedStatItem({
  value,
  label,
  inView,
  cycle,
}: {
  value: string
  label: string
  inView: boolean
  cycle: number
}) {
  const parsed = useMemo(() => parseStatValue(value), [value])
  const initialZero = useMemo(() => {
    return parsed.isNumeric
      ? `${parsed.prefix}0${parsed.decimals > 0 ? '.' + '0'.repeat(parsed.decimals) : ''}${parsed.suffix}`
      : value
  }, [parsed, value])

  const [displayValue, setDisplayValue] = useState(initialZero)

  useEffect(() => {
    if (!inView) {
      setDisplayValue(initialZero)
      return
    }

    if (!parsed.isNumeric) {
      setDisplayValue(value)
      return
    }

    let animId: number
    const duration = 850 // Silky smooth 850ms duration
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Silky smooth quartic ease-out for a decelerating roll into the number
      const ease = 1 - Math.pow(1 - progress, 4)
      const current = ease * parsed.target

      if (progress < 1) {
        setDisplayValue(`${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`)
        animId = requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [inView, cycle, value, parsed, initialZero])

  return (
    <div className="group pt-4 sm:pt-0 sm:px-6 first:sm:pl-0 last:sm:pr-0 text-left transition-all duration-300">
      <div className="flex items-baseline gap-1">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white tabular-nums">
          {displayValue}
        </p>
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-[#D8FC38] inline-block shrink-0 animate-pulse" />
        <span>{label}</span>
      </p>
      {/* Animated charging accent progress bar */}
      <div className="h-[2.5px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3 max-w-[140px]">
        <div
          className="h-full bg-[#D8FC38] rounded-full transition-all duration-850 ease-out"
          style={{ width: inView ? '100%' : '0%' }}
        />
      </div>
    </div>
  )
}

export default function AboutPlatform({ initialData }: AboutPlatformProps) {
  const data = initialData || DEFAULT_ABOUT_SECTION_DATA
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsInView, setStatsInView] = useState(false)
  const [cycle, setCycle] = useState(0)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return

    // 1. Immediate mount check for instant counting on page reload / direct landing
    const checkInitialVisibility = () => {
      const rect = el.getBoundingClientRect()
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (inViewport && !isVisibleRef.current) {
        isVisibleRef.current = true
        setStatsInView(true)
        setCycle((c) => (c === 0 ? 1 : c + 1))
      }
    }

    checkInitialVisibility()

    // 2. Continuous bidirectional IntersectionObserver (triggers both on scroll down and scroll up)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          if (!isVisibleRef.current) {
            isVisibleRef.current = true
            setStatsInView(true)
            setCycle((c) => c + 1)
          }
        } else {
          // When scrolled out of view in either direction, reset primed for re-entry
          if (isVisibleRef.current) {
            isVisibleRef.current = false
            setStatsInView(false)
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px 0px 20px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Icon mapping helper with minimal, refined styling
  const getBenefitIcon = (iconName: string) => {
    const iconClass = "size-4 text-current transition-colors duration-300"
    switch (iconName) {
      case 'play':
        return <Play className={`${iconClass} fill-current`} />
      case 'shield':
        return <ShieldCheck className={iconClass} />
      case 'career':
        return <Briefcase className={iconClass} />
      case 'book':
      default:
        return <BookOpen className={iconClass} />
    }
  }

  const benefits = [
    {
      icon: data.card1Icon,
      title: data.card1Title,
      desc: data.card1Desc,
      url: data.card1Url || '/courses',
    },
    {
      icon: data.card2Icon,
      title: data.card2Title,
      desc: data.card2Desc,
      url: data.card2Url || '/courses',
    },
    {
      icon: data.card3Icon,
      title: data.card3Title,
      desc: data.card3Desc,
      url: data.card3Url || '/verify-certificate',
    },
    {
      icon: data.card4Icon,
      title: data.card4Title,
      desc: data.card4Desc,
      url: data.card4Url || '/job-circulars',
    },
  ]

  const stats = [
    { value: data.stat1Value, label: data.stat1Label },
    { value: data.stat2Value, label: data.stat2Label },
    { value: data.stat3Value, label: data.stat3Label },
    { value: data.stat4Value, label: data.stat4Label },
  ]

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* MAIN 3-PART EDITORIAL COMPOSITION                                         */}
        {/* Area 1: Content | Area 2: Main Visual | Area 3: Platform Benefits          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* AREA 1: Content (lg:col-span-4 xl:col-span-5)                         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-5 space-y-6 text-left">
            {/* Large, Confident Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-bold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              {data.titleLine1}{' '}
              <br className="hidden sm:inline" />
              {data.titleLine2}{' '}
              <span className="relative inline-block text-slate-950 dark:text-white">
                {data.highlightWord}
                {/* Intentional, quiet Electric Lime underline accent */}
                <span 
                  className="absolute left-0 -bottom-1 w-full h-[5px] rounded-full bg-[#D8FC38]"
                  aria-hidden="true"
                />
              </span>
            </h2>

            {/* Short, Readable Paragraph */}
            <p className="text-base sm:text-[17px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              {data.description}
            </p>

            {/* Actions: Primary CTA in Electric Lime + Quiet Secondary Action */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary CTA (Disciplined placement of Electric Lime) */}
              <Link
                href={data.primaryBtnUrl || '/courses'}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-semibold px-6 sm:px-7 py-3.5 text-sm transition-all active:scale-[0.98] group"
              >
                <span>{data.primaryBtnText}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Quiet Secondary Action */}
              {data.secondaryBtnUrl && (
                <a
                  href={data.secondaryBtnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-2 transition-colors group"
                >
                  <span className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                    <Play className="size-3 fill-current ml-0.5" />
                  </span>
                  <span>{data.secondaryBtnText}</span>
                </a>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* AREA 2: Main Visual - Center Card with Custom BG & Floating Overlays  */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-4 flex justify-center py-4 lg:py-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
              
              {/* Layer 1: Secondary Ghost Card Peeking Out to the Left */}
              <div 
                className="absolute top-4 -left-3 sm:-left-4 w-full h-[94%] rounded-[38px] sm:rounded-[42px] bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] pointer-events-none"
                aria-hidden="true"
              />

              {/* Layer 2: Main Rounded Center Card with Warm Ivory & Tilted Lime Polygon */}
              <div
                className="relative w-full h-[460px] sm:h-[490px] rounded-[38px] sm:rounded-[42px] overflow-hidden flex items-end justify-center shadow-[0_14px_45px_rgba(0,0,0,0.06)] border border-[#E2E6D0]/80 dark:border-white/10 transition-colors bg-[#F5F6EC] dark:bg-slate-900"
              >
                {/* Tilted Electric Lime Rounded Pill/Polygon behind Model */}
                <div
                  className="absolute top-[28%] -left-3 sm:-left-4 w-[330px] sm:w-[360px] h-[380px] sm:h-[410px] rounded-[56px] rotate-[-13deg] pointer-events-none transition-transform bg-[#E3F69D] dark:bg-[#D8FC38]/15"
                  aria-hidden="true"
                />

                {/* Hand-drawn Green Spiral Doodle at Top Right */}
                <div className="absolute top-4 sm:top-5 right-5 sm:right-7 w-[68px] sm:w-[76px] h-auto pointer-events-none z-10 select-none">
                  <Image
                    src="/assets/images/about-doodle.png"
                    alt="Decorative Doodle"
                    width={88}
                    height={81}
                    priority
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Cutout Transparent Student Model Image */}
                <div className="relative z-10 w-full h-[94%] flex items-end justify-center pointer-events-none">
                  <Image
                    src={data.modelImageUrl || '/assets/images/about-platform-model.png'}
                    alt={data.modelImageAlt || 'Student'}
                    width={1145}
                    height={1374}
                    priority
                    className="w-auto h-full max-h-[460px] object-contain object-bottom select-none pointer-events-none drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Layer 3: Floating Widget 1 - Top-Left "Learn from Experts" & Avatars Stack */}
              <div className="absolute top-10 sm:top-12 -left-3 sm:-left-6 z-20 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-[#EBF5D4] dark:bg-lime-950/60 text-lime-700 dark:text-lime-300 flex items-center justify-center">
                    <Users className="size-3.5 sm:size-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                    {data.floating1Title}
                  </span>
                </div>

                {/* Avatar Stack */}
                <div className="flex items-center -space-x-1.5 pl-0.5">
                  {[
                    data.floating1Avatar1,
                    data.floating1Avatar2,
                    data.floating1Avatar3,
                    data.floating1Avatar4,
                  ].map((av, avIdx) => (
                    <div
                      key={avIdx}
                      className="relative size-6 sm:size-6.5 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100"
                    >
                      <Image
                        src={av}
                        alt="Avatar"
                        width={26}
                        height={26}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  <span className="rounded-full bg-[#EBF5D4] text-slate-900 dark:bg-lime-900/80 dark:text-lime-200 text-[10px] font-bold px-2 py-0.5 border-2 border-white dark:border-slate-900 shadow-2xs">
                    {data.floating1Badge}
                  </span>
                </div>
              </div>

              {/* Layer 4: Floating Widget 2 - Bottom-Right "4.9 / 5.0 Student Rating" */}
              <div className="absolute bottom-6 sm:bottom-7 -right-3 sm:-right-5 z-20 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="size-8 sm:size-8.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight">
                    {data.floating2Rating}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                    {data.floating2Label}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* AREA 3: Platform Benefits - Interactive Rows with Kinetic Icon (Idea 3) */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {benefits.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url || '/courses'}
                  className="group relative block py-4 first:pt-2 last:pb-2 px-3.5 -mx-3.5 rounded-2xl transition-all duration-300 hover:bg-slate-50/90 dark:hover:bg-slate-900/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D8FC38]"
                >
                  <div className="flex items-start gap-3.5 transition-transform duration-300 group-hover:translate-x-1.5">
                    {/* Kinetic Icon Container: Brand Lime on hover + micro-bounce rotation + soft neon glow */}
                    <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-[#D8FC38] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(216,252,56,0.4)]">
                      {getBenefitIcon(item.icon)}
                    </div>

                    {/* Clean text hierarchy with dynamic sliding arrow */}
                    <div className="space-y-1 text-left min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        <ArrowRight className="size-3.5 text-slate-400 dark:text-slate-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-950 dark:group-hover:text-[#D8FC38] shrink-0" />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* STATS: Quiet Horizontal Information Row Below Main Composition            */}
        {/* 120+ Courses  |  40K+ Learners  |  99.8% Completion  |  Global Recognition */}
        {/* ========================================================================= */}
        <div
          ref={statsRef}
          className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-slate-200/70 dark:border-slate-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60 dark:divide-slate-800/80">
            {stats.map((stat, sIdx) => (
              <AnimatedStatItem
                key={sIdx}
                value={stat.value}
                label={stat.label}
                inView={statsInView}
                cycle={cycle}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
