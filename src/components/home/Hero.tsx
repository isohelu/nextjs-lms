'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { DEFAULT_HERO_DATA, HeroSectionData } from '@/lib/data/hero-section'

// Register GSAP plugins on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroProps {
  initialData?: HeroSectionData
}

export default function Hero({ initialData }: HeroProps) {
  const [data, setData] = useState<HeroSectionData>(initialData || DEFAULT_HERO_DATA)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  
  // Peer-focus state for bottom cards
  const [hoveredBottomCard, setHoveredBottomCard] = useState<number | null>(null)

  // Live Digital Count-Up state for "10K+" Active Learners
  const [displayCount, setDisplayCount] = useState('0K+')

  // 3D Gyro Glare state for Stats Card
  const [statsGlare, setStatsGlare] = useState({ x: 50, y: 50, opacity: 0 })

  // DOM refs for GSAP targeting and scroll orchestration
  const heroSectionRef = useRef<HTMLElement>(null)
  const heroCardContainerRef = useRef<HTMLDivElement>(null)
  const bgArcRef = useRef<SVGSVGElement>(null)
  const arcPathRef = useRef<SVGPathElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const studentModelRef = useRef<HTMLDivElement>(null)
  const statsCardRef = useRef<HTMLDivElement>(null)
  const statsCardInnerRef = useRef<HTMLDivElement>(null)
  const pillsContainerRef = useRef<HTMLDivElement>(null)
  const bottomCardsContainerRef = useRef<HTMLDivElement>(null)

  // Bottom card image window parallax refs
  const bcard1ImgRef = useRef<HTMLDivElement>(null)
  const bcard3ImgRef = useRef<HTMLDivElement>(null)

  // Sync state if initialData changes from server
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  // Also fetch freshest data on client mount to reflect any recent admin panel saves
  useEffect(() => {
    fetch('/api/admin/hero-section')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData((prev) => ({ ...prev, ...json.data }))
        }
      })
      .catch(() => {})
  }, [])

  // =========================================================================
  // LIVE DIGITAL METER COUNT-UP ANIMATION (0 to 10K+)
  // =========================================================================
  useEffect(() => {
    let animId: number
    const target = 10
    const duration = 1200
    const start = performance.now()

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const currentVal = (ease * target).toFixed(1)

      if (progress < 1) {
        setDisplayCount(`${currentVal}K+`)
        animId = requestAnimationFrame(step)
      } else {
        setDisplayCount(data.statsCount || '10K+')
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [data.statsCount])

  // =========================================================================
  // GSAP 3: INITIAL PAGE ENTRANCE + CINEMATIC BIDIRECTIONAL SCROLLTRIGGER
  // =========================================================================
  useGSAP(
    () => {
      // Respect accessibility
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // Cinematic GSAP ScrollTrigger (Smooth Bidirectional Scrubbing)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Card Deck Stacking: container scales down to 0.94, pushes upward
      scrollTl.to(
        heroCardContainerRef.current,
        {
          scale: 0.94,
          y: -30,
          borderRadius: '48px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.18)',
          ease: 'power1.inOut',
        },
        0
      )

      // Cutout Foreground Pop: Student Model floats up for 3D depth
      scrollTl.to(
        studentModelRef.current,
        {
          y: -90,
          scale: 1.04,
          ease: 'none',
        },
        0
      )

      // Progressive dispersion on Headline
      scrollTl.to(
        headlineRef.current,
        {
          y: -45,
          opacity: 0.25,
          ease: 'power1.in',
        },
        0
      )

      // Description & CTA fade upwards gently
      scrollTl.to(
        [descRef.current, ctaRef.current],
        {
          y: -30,
          opacity: 0.35,
          ease: 'power1.in',
        },
        0
      )

      // Golden Arc SVG shifts with scroll
      if (bgArcRef.current) {
        scrollTl.to(
          bgArcRef.current,
          {
            y: -30,
            opacity: 0.35,
            ease: 'none',
          },
          0
        )
      }

      // Stats Card gentle depth float
      scrollTl.to(
        statsCardRef.current,
        {
          y: -35,
          ease: 'none',
        },
        0
      )

      // Bottom 3 Cards gentle glide upward (Preserving 100% full opacity and interactivity)
      scrollTl.to(
        bottomCardsContainerRef.current,
        {
          y: -20,
          ease: 'none',
        },
        0
      )
    },
    { scope: heroSectionRef, dependencies: [] }
  )

  // =========================================================================
  // 3D GYRO TILT & SPECULAR GLARE FOR 10K+ CARD
  // =========================================================================
  const handleStatsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!statsCardInnerRef.current) return
    const rect = statsCardInnerRef.current.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1
    const glareX = ((e.clientX - rect.left) / rect.width) * 100
    const glareY = ((e.clientY - rect.top) / rect.height) * 100

    gsap.to(statsCardInnerRef.current, {
      rotateX: -relY * 11,
      rotateY: relX * 11,
      transformPerspective: 800,
      duration: 0.2,
      ease: 'power1.out',
    })

    setStatsGlare({ x: glareX, y: glareY, opacity: 0.42 })
  }

  const handleStatsMouseLeave = () => {
    if (!statsCardInnerRef.current) return
    gsap.to(statsCardInnerRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.75,
      ease: 'elastic.out(1, 0.4)',
    })
    setStatsGlare({ x: 50, y: 50, opacity: 0 })
  }

  // =========================================================================
  // WINDOW PARALLAX FOR BOTTOM EDITORIAL CARDS
  // =========================================================================
  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    imgRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!imgRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const shiftX = ((e.clientX - rect.left) / rect.width - 0.5) * -16
    const shiftY = ((e.clientY - rect.top) / rect.height - 0.5) * -12

    gsap.to(imgRef.current, {
      x: shiftX,
      y: shiftY,
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleCardMouseLeave = (imgRef: React.RefObject<HTMLDivElement | null>) => {
    setHoveredBottomCard(null)
    if (!imgRef.current) return
    gsap.to(imgRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.65,
      ease: 'power2.out',
    })
  }

  // Split title if it contains newline
  const renderMultilinedText = (text: string) => {
    return text.split('\n').map((line, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <br />}
        {line}
      </React.Fragment>
    ))
  }

  // Model positioning
  const modelLeftPosition = data.modelPositionLeft || '34.5%'

  return (
    <section
      ref={heroSectionRef}
      className="w-full bg-[#EBE7FA] dark:bg-slate-950 pt-2 pb-10 sm:pb-14 select-none transition-colors overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. TOP MAIN HERO CARD (Purple Gradient with iOS Card Deck Stacking)       */}
        {/* ========================================================================= */}
        <div
          ref={heroCardContainerRef}
          className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-gradient-to-r from-[#9F8CD7] via-[#AA97E5] to-[#BFB0F3] p-6 sm:p-10 lg:p-12 xl:p-14 min-h-[460px] sm:min-h-[490px] lg:min-h-[510px] shadow-[0_15px_40px_rgba(158,138,211,0.20)] border border-purple-300/30 flex flex-col justify-between will-change-transform"
        >
          
          {/* Layer 1: Golden Arc Curve with Live Laser Draw Animation */}
          <svg
            ref={bgArcRef}
            className="pointer-events-none absolute top-0 left-[35%] w-[420px] h-[340px] stroke-[#F2E193] fill-none z-0 opacity-75 hidden md:block will-change-transform"
            viewBox="0 0 420 340"
            aria-hidden="true"
          >
            <path
              ref={arcPathRef}
              className="hero-arc-laser"
              d="M 90 0 C 90 140 220 230 400 340"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Main Grid: Left Headline/Copy + Right Stats Card */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 h-full">
            
            {/* Left Content Column (z-20 relative ensures text is always top-layer) */}
            <div className="max-w-lg lg:max-w-[420px] xl:max-w-[450px] relative z-20">
              
              {/* Layer 2: Headline with Split-Text Masked Line Reveals */}
              <div
                ref={headlineRef}
                className="will-change-transform"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-[74px] xl:text-[78px] font-extrabold text-white tracking-tight leading-[0.98]">
                  <span className="block overflow-hidden py-1 -my-1">
                    <span className="hero-masked-line hero-line-reveal-1 block will-change-transform">
                      {data.headlineLine1}
                    </span>
                  </span>
                  <span className="block overflow-hidden py-1 -my-1">
                    <span className="hero-masked-line hero-line-reveal-2 block will-change-transform">
                      {data.headlineLine2}
                    </span>
                  </span>
                  <span className="block overflow-hidden py-1 -my-1">
                    <span
                      className="hero-masked-line hero-line-reveal-3 block will-change-transform"
                      style={{ color: data.accentColor || '#D8FC38' }}
                    >
                      {data.headlineLine3}
                    </span>
                  </span>
                </h1>
              </div>

              {/* Layer 3: Description */}
              <p
                ref={descRef}
                className="hero-anim-desc mt-5 sm:mt-6 text-white/90 text-sm sm:text-base leading-relaxed max-w-[340px] sm:max-w-[360px] font-normal will-change-transform"
              >
                {data.description}
              </p>

              {/* Layer 4: Action Buttons Row with Magnetic CTA */}
              <div
                ref={ctaRef}
                className="hero-anim-cta mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4.5 will-change-transform"
              >
                {/* Start Learning Pill with Zero-Shake Loading Progress Animated Hover */}
                <Link
                  href={data.primaryButtonUrl || '/courses'}
                  className="group relative inline-flex items-center gap-3 rounded-full bg-[#D8FC38] text-slate-950 font-bold px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base transition-shadow duration-300 shadow-sm hover:shadow-[0_10px_28px_rgba(216,252,56,0.35)] shrink-0 cursor-pointer overflow-hidden isolate select-none"
                >
                  {/* Background Progress Fill: sweeps left-to-right on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-slate-950 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out -z-10"
                  />

                  {/* Animated diagonal loading barber stripes within the fill */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out btn-loading-stripes -z-10 pointer-events-none"
                  />

                  {/* Loading shimmer beam sweep */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 pointer-events-none"
                  />

                  {/* Text: smooth high-contrast text color shift */}
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white font-bold">
                    {data.primaryButtonText || 'Start Learning'}
                  </span>

                  {/* Arrow Badge: smooth inverted colors & subtle micro-glide */}
                  <span className="relative z-10 flex size-6 sm:size-7 items-center justify-center rounded-full bg-slate-950 text-white group-hover:bg-[#D8FC38] group-hover:text-slate-950 transition-all duration-300 shrink-0">
                    <ArrowRight className="size-3 sm:size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                  </span>
                </Link>

                {/* Watch Video Button with Interactive Hover Icon */}
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="group inline-flex items-center gap-2.5 sm:gap-3 text-white font-medium text-sm sm:text-base hover:text-white/95 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <span className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-xs transition-all duration-200 group-hover:scale-108 group-hover:bg-white/35">
                    <Play className="size-3.5 sm:size-4 fill-white text-white ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <span className="transition-colors">{data.videoButtonText || 'Watch Video'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 10K+ Card & 3 Stacked Pills (z-20 relative) */}
            <div className="relative z-20 w-full max-w-[260px] sm:max-w-[275px] lg:ml-auto flex flex-col justify-start">
              
              {/* Layer 6: 10K+ Active Learners Floating Card with 3D Gyro Tilt & Avatar Cascade */}
              <div
                ref={statsCardRef}
                className="will-change-transform"
              >
                <div
                  ref={statsCardInnerRef}
                  onMouseMove={handleStatsMouseMove}
                  onMouseLeave={handleStatsMouseLeave}
                  className="group/statscard hero-anim-stats relative rounded-[24px] bg-white dark:bg-slate-900/95 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] border border-white/60 dark:border-slate-800 transition-shadow duration-300 overflow-hidden cursor-default select-none will-change-transform"
                >
                  {/* Glass Specular Glare Overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-300"
                    style={{
                      opacity: statsGlare.opacity,
                      background: `radial-gradient(circle at ${statsGlare.x}% ${statsGlare.y}%, rgba(255,255,255,0.45) 0%, transparent 60%)`,
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white tabular-nums">
                      {displayCount}
                    </span>
                    <Link
                      href={data.statsUrl || '/courses'}
                      className="flex size-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover/statscard:bg-[#D8FC38] group-hover/statscard:text-slate-950 transition-colors duration-200"
                      aria-label="View active learners courses"
                    >
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover/statscard:translate-x-0.5" />
                    </Link>
                  </div>
                  <p className="relative z-10 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {data.statsLabel || 'Active Learners'}
                  </p>
                  
                  {/* Avatars Cluster with Elastic Cascade Pop & Gentle Spread on Hover */}
                  <div className="relative z-10 mt-4 flex items-center">
                    <div className="flex -space-x-2">
                      <div className="hero-avatar-bubble hero-avatar-pop-1 relative size-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs transition-transform duration-300 ease-out group-hover/statscard:translate-x-0">
                        <Image
                          src={data.avatar1Url || '/assets/avatars/avatar-1.png'}
                          alt="Learner 1"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="hero-avatar-bubble hero-avatar-pop-2 relative size-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs transition-transform duration-300 ease-out group-hover/statscard:translate-x-1">
                        <Image
                          src={data.avatar2Url || '/assets/avatars/avatar-2.png'}
                          alt="Learner 2"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="hero-avatar-bubble hero-avatar-pop-3 relative size-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs transition-transform duration-300 ease-out group-hover/statscard:translate-x-2">
                        <Image
                          src={data.avatar3Url || '/assets/avatars/avatar-3.png'}
                          alt="Learner 3"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="hero-avatar-bubble hero-avatar-pop-4 relative size-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs transition-transform duration-300 ease-out group-hover/statscard:translate-x-3">
                        <Image
                          src={data.avatar4Url || '/assets/avatars/avatar-4.png'}
                          alt="Learner 4"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <span className="hero-avatar-bubble hero-avatar-pop-more ml-2 flex size-7 items-center justify-center rounded-full bg-[#EFEAFE] dark:bg-purple-950/60 text-xs font-bold text-[#7C3AED] dark:text-purple-300 transition-transform duration-300 ease-out group-hover/statscard:translate-x-4">
                      {data.avatarMoreCount || '+'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Layer 7: 3 Stacked Horizontal Links with Staggered Entrance and Micro-Interaction */}
              <div
                ref={pillsContainerRef}
                className="mt-3 flex flex-col gap-2.5 will-change-transform"
              >
                {/* Pill 1 */}
                <Link
                  href={data.pill1Url || '/instructors'}
                  className="hero-feature-pill hero-anim-pill-1 group relative flex items-center justify-between rounded-full bg-white/75 dark:bg-slate-900/80 hover:bg-white/95 dark:hover:bg-slate-900 backdrop-blur-xs px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-2xs hover:shadow-md hover:translate-x-1.5 border border-transparent dark:border-slate-800/80 overflow-hidden will-change-transform"
                >
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-[#D8FC38] transition-all duration-200 opacity-0 h-0 group-hover:opacity-100 group-hover:h-3.5" />
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{data.pill1Text || 'Industry Experts'}</span>
                  <ArrowRight className="size-4 text-slate-700 dark:text-slate-300 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                {/* Pill 2 */}
                <Link
                  href={data.pill2Url || '/courses'}
                  className="hero-feature-pill hero-anim-pill-2 group relative flex items-center justify-between rounded-full bg-white/75 dark:bg-slate-900/80 hover:bg-white/95 dark:hover:bg-slate-900 backdrop-blur-xs px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-2xs hover:shadow-md hover:translate-x-1.5 border border-transparent dark:border-slate-800/80 overflow-hidden will-change-transform"
                >
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-[#D8FC38] transition-all duration-200 opacity-0 h-0 group-hover:opacity-100 group-hover:h-3.5" />
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{data.pill2Text || 'Flexible Learning'}</span>
                  <ArrowRight className="size-4 text-slate-700 dark:text-slate-300 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                {/* Pill 3 */}
                <Link
                  href={data.pill3Url || '/certificates'}
                  className="hero-feature-pill hero-anim-pill-3 group relative flex items-center justify-between rounded-full bg-white/75 dark:bg-slate-900/80 hover:bg-white/95 dark:hover:bg-slate-900 backdrop-blur-xs px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-2xs hover:shadow-md hover:translate-x-1.5 border border-transparent dark:border-slate-800/80 overflow-hidden will-change-transform"
                >
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 rounded-full bg-[#D8FC38] transition-all duration-200 opacity-0 h-0 group-hover:opacity-100 group-hover:h-3.5" />
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{data.pill3Text || 'Certificate Programs'}</span>
                  <ArrowRight className="size-4 text-slate-700 dark:text-slate-300 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Layer 5: Model Student Girl with 1.5x Cutout Overflow */}
          <div
            ref={studentModelRef}
            style={{
              left: modelLeftPosition,
            }}
            className="pointer-events-none absolute bottom-0 w-[310px] sm:w-[350px] lg:w-[395px] xl:w-[420px] h-[92%] z-10 hidden md:flex items-end justify-center select-none will-change-transform"
          >
            <div className="relative w-full h-full flex items-end justify-center">
              <Image
                src={data.modelImageUrl || '/assets/images/hero-student-girl.png'}
                alt={data.modelImageAlt || 'Student Learner'}
                width={420}
                height={470}
                priority
                className="object-contain object-bottom max-h-full"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Layer 8: 2. BOTTOM 3 CARDS ROW (Live Classes / Learn Anywhere / Healthier You) */}
        {/* ========================================================================= */}
        <div
          ref={bottomCardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-4 lg:mt-5 will-change-transform"
        >
          
          {/* Card 1: For Mind, Body and Soul (Male Yoga Model with Window Parallax) */}
          <div
            onMouseEnter={() => setHoveredBottomCard(1)}
            onMouseMove={(e) => handleCardMouseMove(e, bcard1ImgRef)}
            onMouseLeave={() => handleCardMouseLeave(bcard1ImgRef)}
            className={`hero-bottom-card hero-anim-bottom-1 group/bcard1 relative flex min-h-[195px] sm:min-h-[205px] overflow-hidden rounded-[28px] lg:rounded-[32px] bg-[#FAF3ED] dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] border border-[#f0e4dc]/70 dark:border-slate-800 transition-all duration-300 ease-out hover:-translate-y-2 will-change-transform ${
              hoveredBottomCard !== null && hoveredBottomCard !== 1 ? 'opacity-85' : 'opacity-100'
            }`}
          >
            <div className="relative z-10 flex flex-1 flex-col justify-between pr-2">
              <div>
                <span className="inline-block rounded-full border border-slate-300/60 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                  {data.card1Badge || 'Live Classes'}
                </span>
                <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug transition-transform duration-300 group-hover/bcard1:translate-x-0.5">
                  {renderMultilinedText(data.card1Title || 'For Mind,\nBody and Soul')}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[200px]">
                  {data.card1Description}
                </p>
              </div>

              <Link
                href={data.card1Url || '/live-classes'}
                className="mt-4 flex size-10 items-center justify-center rounded-full bg-slate-950 dark:bg-[#D8FC38] text-white dark:text-slate-950 transition-all duration-200 group-hover/bcard1:scale-108 active:scale-95 cursor-pointer"
                aria-label="Join Live Classes"
              >
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/bcard1:translate-x-0.5" />
              </Link>
            </div>

            {/* Arched Photo Window with Tactile Interactive Parallax */}
            <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[48%] overflow-hidden rounded-l-[110px]">
              <div
                ref={bcard1ImgRef}
                className="relative w-full h-full will-change-transform"
              >
                <Image
                  src={data.card1ImageUrl || '/assets/images/hero-yoga-man.png'}
                  alt={data.card1Badge || 'For Mind, Body and Soul'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-[center_top]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Card 2: Learn Anywhere (Electric Lime, No Image) */}
          <div
            onMouseEnter={() => setHoveredBottomCard(2)}
            onMouseLeave={() => setHoveredBottomCard(null)}
            style={{ backgroundColor: data.card2BgColor || '#D8FC38' }}
            className={`hero-bottom-card hero-anim-bottom-2 group/bcard2 flex min-h-[195px] sm:min-h-[205px] flex-col justify-between rounded-[28px] lg:rounded-[32px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_40px_rgba(216,252,56,0.28)] border border-[#CBF128]/70 transition-all duration-300 ease-out hover:-translate-y-2 will-change-transform ${
              hoveredBottomCard !== null && hoveredBottomCard !== 2 ? 'opacity-85' : 'opacity-100'
            }`}
          >
            <div>
              <span className="inline-block rounded-full bg-slate-950 text-white px-3.5 py-1 text-xs font-semibold shadow-2xs">
                {data.card2Badge || 'Explore'}
              </span>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 leading-snug transition-transform duration-300 group-hover/bcard2:translate-x-0.5">
                {renderMultilinedText(data.card2Title || 'Learn\nAnywhere')}
              </h3>
              <p className="mt-2 text-sm text-slate-800 leading-relaxed max-w-[220px] font-medium">
                {data.card2Description}
              </p>
            </div>

            <Link
              href={data.card2Url || '/courses'}
              className="mt-4 flex size-10 items-center justify-center rounded-full bg-slate-950 text-white transition-all duration-200 group-hover/bcard2:scale-108 active:scale-95 cursor-pointer"
              aria-label="Explore courses anywhere"
            >
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/bcard2:translate-x-0.5" />
            </Link>
          </div>

          {/* Card 3: Build a Healthier You (Female Yoga Model with Window Parallax) */}
          <div
            onMouseEnter={() => setHoveredBottomCard(3)}
            onMouseMove={(e) => handleCardMouseMove(e, bcard3ImgRef)}
            onMouseLeave={() => handleCardMouseLeave(bcard3ImgRef)}
            className={`hero-bottom-card hero-anim-bottom-3 group/bcard3 relative flex min-h-[195px] sm:min-h-[205px] overflow-hidden rounded-[28px] lg:rounded-[32px] bg-[#ECE4FC] dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] border border-[#ded5f8]/70 dark:border-slate-800 transition-all duration-300 ease-out hover:-translate-y-2 will-change-transform ${
              hoveredBottomCard !== null && hoveredBottomCard !== 3 ? 'opacity-85' : 'opacity-100'
            }`}
          >
            <div className="relative z-10 flex flex-1 flex-col justify-between pr-2">
              <div>
                <span className="inline-block rounded-full border border-purple-200/60 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 px-3.5 py-1 text-xs font-semibold text-purple-900 dark:text-purple-300 shadow-2xs">
                  {data.card3Badge || 'For Everyone'}
                </span>
                <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug transition-transform duration-300 group-hover/bcard3:translate-x-0.5">
                  {renderMultilinedText(data.card3Title || 'Build a\nHealthier You')}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[200px]">
                  {data.card3Description}
                </p>
              </div>

              <Link
                href={data.card3Url || '/wellness'}
                className="mt-4 flex size-10 items-center justify-center rounded-full bg-slate-950 dark:bg-[#D8FC38] text-white dark:text-slate-950 transition-all duration-200 group-hover/bcard3:scale-108 active:scale-95 cursor-pointer"
                aria-label="Build a Healthier You"
              >
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/bcard3:translate-x-0.5" />
              </Link>
            </div>

            {/* Arched Photo Window with Tactile Interactive Parallax */}
            <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[48%] overflow-hidden rounded-l-[110px]">
              <div
                ref={bcard3ImgRef}
                className="relative w-full h-full will-change-transform"
              >
                <Image
                  src={data.card3ImageUrl || '/assets/images/hero-yoga-woman.png'}
                  alt={data.card3Badge || 'Build a Healthier You'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-[center_center]"
                  priority
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Video Modal Popup */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Watch Platform Tour</span>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="size-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={
                  data.videoUrl?.includes('embed')
                    ? data.videoUrl
                    : 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
                }
                title="Hero Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
