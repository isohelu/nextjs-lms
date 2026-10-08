'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Video,
  Users2,
  Award,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Star,
  Terminal,
  Code2,
  Check,
  BadgeCheck,
  Binary,
} from 'lucide-react'

export default function AboutLearningCenter() {
  const topFeatures = [
    {
      icon: Video,
      title: 'Interactive Video Cinema',
      subtitle: '500+ deep-dive modules',
      color: 'text-slate-950 dark:text-[#D8FC38] bg-[#D8FC38]/20 border border-[#D8FC38]/30',
    },
    {
      icon: Users2,
      title: 'Expert Mentorship',
      subtitle: '1-on-1 code reviews',
      color: 'text-[#FF6B2C] bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50',
    },
    {
      icon: Award,
      title: 'Accredited Credentials',
      subtitle: 'Tamper-proof QR certs',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50',
    },
  ]

  const curriculumStacks = [
    'Next.js 15',
    'TypeScript',
    'PostgreSQL',
    'Supabase',
    'Docker',
    'Redis',
  ]

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-[#EBF7F2]/60 dark:bg-[#07130F] overflow-hidden select-none transition-colors duration-500">
      {/* Soft Ambient Canvas Background Glows matching Hero */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-28 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-200/35 via-teal-100/20 to-transparent blur-[140px] dark:from-emerald-950/20" />
        <div className="absolute bottom-10 -right-28 h-[560px] w-[560px] rounded-full bg-gradient-to-tl from-teal-200/30 via-emerald-100/15 to-transparent blur-[150px] dark:from-emerald-900/15" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. TOP QUICK FEATURE CARDS (Static Continuity Row)                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-10 sm:mb-14">
          {topFeatures.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <div
                key={idx}
                className="group flex items-center gap-4 rounded-[22px] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xs p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#D8FC38]/60 transition-[border-color,box-shadow] duration-200"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feat.color}`}>
                  <Icon className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP HEADER (Static Center-Aligned Header)                              */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          {/* Badge: # ABOUT THE PLATFORM */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D8FC38]/20 border border-[#D8FC38]/40 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-slate-950 dark:text-[#D8FC38]" />
            <span># ABOUT THE PLATFORM</span>
          </div>

          {/* Title with wavy accent underline */}
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.16]">
            Welcome to the{' '}
            <span className="text-slate-950 dark:text-white underline decoration-[#D8FC38] decoration-wavy decoration-2 underline-offset-8">
              Online Learning Hub
            </span>
          </h2>

          {/* Short Subtext */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
            Empowering software engineers, product designers, and technical leaders with direct access to production-tested curricula, live interactive code environments, and verified industry credentials.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3. MIDDLE GRID: 3-Column Bento Showcase (100% Static & Stable)            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 1 (Left - lg:col-span-4): Production-First Curriculum Card       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 h-full">
            <div className="group/left relative flex flex-col justify-between h-full rounded-[28px] sm:rounded-[32px] bg-white/95 dark:bg-[#0D1E17]/95 backdrop-blur-md border border-slate-200/85 dark:border-slate-800 hover:border-[#D8FC38]/60 p-6 sm:p-7 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)] hover:shadow-xl transition-all duration-200 overflow-hidden">
              
              {/* Subtle Ambient Accent on Card */}
              <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#D8FC38]/10 blur-2xl" />
              
              <div>
                {/* Header Tag + Icon Badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    <Binary className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                    ENTERPRISE ARCHITECTURE
                  </span>

                  {/* Circular Icon Container */}
                  <div className="w-10 h-10 rounded-2xl bg-[#D8FC38]/20 text-slate-950 dark:text-[#D8FC38] flex items-center justify-center shrink-0">
                    <Code2 className="h-5 w-5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                  Production-First <br />
                  <span className="underline decoration-[#D8FC38] decoration-2 underline-offset-4">Curriculum</span>
                </h3>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Learn through complete full-stack applications built with real-world enterprise architectures, CI/CD pipelines, and cloud-native infrastructure.
                </p>

                {/* Micro Metrics Telemetry Box */}
                <div className="mt-6 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 p-4">
                  <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200 dark:divide-slate-800">
                    <div>
                      <span className="font-mono text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        120+
                      </span>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">
                        Repos
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        40k+
                      </span>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">
                        Tests
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        99.8%
                      </span>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">
                        Quality
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {curriculumStacks.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer Link */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-slate-950 dark:hover:text-[#D8FC38] transition-colors"
                >
                  <span>Explore Modules</span>
                </Link>

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white group-hover/left:bg-[#D8FC38] group-hover/left:text-slate-950 flex items-center justify-center shrink-0 transition-colors duration-200 shadow-xs">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>

            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 2 (Center - lg:col-span-4): Prominent Student Visual Frame       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 h-full">
            <div className="group/center relative flex flex-col justify-between h-full rounded-[28px] sm:rounded-[32px] bg-white/95 dark:bg-[#0D1E17]/95 backdrop-blur-md border border-slate-200/85 dark:border-slate-800 hover:border-[#D8FC38]/60 p-4 sm:p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)] hover:shadow-md transition-[border-color,box-shadow] duration-200">
              
              {/* "100% Verified" Badge (Top-Right) */}
              <div className="absolute -top-3.5 right-4 rounded-full bg-slate-950 text-white px-4 py-1.5 shadow-xl flex items-center gap-1.5 z-20 border border-[#D8FC38]/40">
                <ShieldCheck className="h-4 w-4 text-[#D8FC38]" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">100% Verified</span>
              </div>

              {/* Main Photo Frame: Stable and Clear */}
              <div className="relative h-[360px] sm:h-[420px] lg:h-full min-h-[380px] w-full overflow-hidden rounded-[24px]">
                <Image
                  src="/assets/images/bento-hero-student.jpg"
                  alt="Student learning with modern devices"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Subtle Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                {/* Inside Image Live Classroom Banner (Static Indicator) */}
                <div className="absolute bottom-4 left-3.5 right-3.5 flex items-center justify-between rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border border-white/50 dark:border-slate-700/60 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#D8FC38]" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Active Classroom</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#FF6B2C]">Live Now</span>
                </div>
              </div>

              {/* "★ 4.9 Rating" Badge (Bottom-Left) */}
              <div className="absolute -bottom-4 left-4 rounded-[20px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xl flex items-center gap-3 z-20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Star className="h-5 w-5 fill-amber-500 stroke-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">4.95 / 5.0</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">(4.8k reviews)</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-none mt-1">
                    Overall student rating
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 3 (Right - lg:col-span-4): Two Stacked Cards                     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6 justify-between h-full">
            
            {/* Top Stacked Card: Live Interactive Labs */}
            <div className="group/topcard relative flex-1 flex flex-col justify-between rounded-[26px] sm:rounded-[28px] bg-white/95 dark:bg-[#0D1E17]/95 backdrop-blur-md border border-slate-200/85 dark:border-slate-800 hover:border-[#D8FC38]/60 p-5 sm:p-6 shadow-[0_10px_25px_-12px_rgba(15,23,42,0.06)] hover:shadow-md transition-[border-color,box-shadow] duration-200 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/80 dark:border-cyan-800/50 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
                    <Terminal className="h-3.5 w-3.5 text-cyan-600" />
                    BROWSER RUNTIME
                  </span>

                  <div className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white group-hover/topcard:bg-[#D8FC38] group-hover/topcard:text-slate-950 flex items-center justify-center shrink-0 transition-colors duration-200 shadow-xs">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
                  Live Interactive Labs
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Practice directly in the browser with automated test evaluation and instant sub-second feedback.
                </p>
              </div>

              {/* Interactive Mini Telemetry Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-semibold">
                  <Check className="h-4 w-4 stroke-[3] text-emerald-600 dark:text-[#D8FC38]" />
                  <span>4/4 Tests Passing</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">24ms execution</span>
              </div>
            </div>

            {/* Bottom Stacked Card: Verifiable Credentials ↗ */}
            <div className="group/botcard relative flex-1 flex flex-col justify-between rounded-[26px] sm:rounded-[28px] bg-white/95 dark:bg-[#0D1E17]/95 backdrop-blur-md border border-slate-200/85 dark:border-slate-800 hover:border-[#D8FC38]/60 p-5 sm:p-6 shadow-[0_10px_25px_-12px_rgba(15,23,42,0.06)] hover:shadow-md transition-[border-color,box-shadow] duration-200 overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/50 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
                    GLOBAL RECOGNITION
                  </span>

                  <div className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white group-hover/botcard:bg-[#D8FC38] group-hover/botcard:text-slate-950 flex items-center justify-center shrink-0 transition-colors duration-200 shadow-xs">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
                  Verifiable Credentials
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Earn accredited certifications shareable on LinkedIn and verified by global engineering companies.
                </p>
              </div>

              {/* Interactive Credential Hash Chip */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span>#LMS-9824-CERT</span>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 border border-blue-200/60 dark:border-blue-800/50">
                  On-Chain Verified
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM ACTION BAR (Static Tactile Buttons)                             */}
        {/* ========================================================================= */}
        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4">
          {/* Primary Action Button: Electric Lime with high-contrast text */}
          <Link
            href="/courses"
            className="group/cta relative inline-flex items-center justify-between gap-3 px-7 py-3.5 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 text-sm sm:text-base font-semibold shadow-xs transition-colors duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span className="font-bold tracking-tight">Explore Curriculum</span>
            <div className="w-7 h-7 rounded-full bg-slate-950 text-[#D8FC38] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/cta:translate-x-0.5 shadow-xs">
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </div>
          </Link>

          {/* Secondary Button: Our Story */}
          <Link
            href="/about-us"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-300/90 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-sm sm:text-base font-semibold shadow-xs transition-colors duration-200 active:scale-[0.98]"
          >
            <span>Our Story</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
