'use client'

import React from 'react'
import Image from 'next/image'
import {
  User,
  BookOpen,
  Play,
  Award,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_LEARNING_JOURNEY_DATA, LearningJourneyData } from '@/lib/data/learning-journey'

interface LearningJourneyProps {
  initialData?: Partial<LearningJourneyData> & Record<string, any>
}

export default function LearningJourney({ initialData }: LearningJourneyProps) {
  // Merge database or prop data with default fallback values
  const badgeText = initialData?.badge || initialData?.badgeText || DEFAULT_LEARNING_JOURNEY_DATA.badge
  const titleLine1 = initialData?.title || initialData?.titleLine1 || DEFAULT_LEARNING_JOURNEY_DATA.title
  const titleLine2 = initialData?.highlightText || initialData?.titleLine2 || DEFAULT_LEARNING_JOURNEY_DATA.highlightText
  const subtitle = initialData?.subtitle || DEFAULT_LEARNING_JOURNEY_DATA.subtitle

  // Normalized steps
  const getStep = (index: number) => {
    const defaultStep = DEFAULT_LEARNING_JOURNEY_DATA.steps[index]
    const stepKey = `step${index + 1}`
    const dbStep = initialData?.steps?.[index] || (initialData as any)?.[stepKey] || {}
    return {
      ...defaultStep,
      ...dbStep,
      title: dbStep.title || defaultStep.title,
      description: dbStep.description || defaultStep.description,
      studentImage: dbStep.studentImage || dbStep.imageUrl || defaultStep.studentImage,
    }
  }

  const steps = [getStep(0), getStep(1), getStep(2), getStep(3)]

  // Visual card configurations matching reference image pixel-for-pixel with bigger dimensions & exact borders
  const cardThemes = [
    {
      borderColor: 'border-2 border-[#E5DAFD] dark:border-purple-800/40',
      cardBg: 'bg-gradient-to-b from-[#F7F3FF] via-[#FAF7FF] to-white dark:from-[#130E26] dark:via-[#0F0B1E] dark:to-[#0A0714]',
      cardGlow: 'hover:shadow-[0_22px_55px_rgba(167,139,250,0.2)]',
      glowOrbColor: 'bg-[#E5D7FE]/80 dark:bg-purple-900/30',
      panelBg: 'bg-gradient-to-br from-[#EDE4FF]/80 via-[#F6F0FF]/50 to-white/40 dark:from-purple-950/30 dark:via-purple-900/10 dark:to-transparent',
      panelBorder: 'border-[#E4D5FD]/70 dark:border-purple-800/30',
      panelShadow: 'shadow-[0_4px_24px_rgba(167,139,250,0.08)]',
      arcStroke: '#C4B5FD',
      accentColor: 'bg-[#8B5CF6]/35',
      iconGradient: 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-purple-500/25',
      icon: User,
      arrowColor: 'text-[#2563EB]',
      defaultImage: '/assets/images/journey-card-1.png',
      defaultTitle: 'Create an Account',
      defaultDescription: 'Sign up in seconds and create your learning profile to get started.',
    },
    {
      borderColor: 'border-2 border-[#D0E7FC] dark:border-blue-800/40',
      cardBg: 'bg-gradient-to-b from-[#EFF6FF] via-[#F5F9FF] to-white dark:from-[#0C1729] dark:via-[#091220] dark:to-[#060D17]',
      cardGlow: 'hover:shadow-[0_22px_55px_rgba(96,165,250,0.2)]',
      glowOrbColor: 'bg-[#BAE6FD]/80 dark:bg-blue-900/30',
      panelBg: 'bg-gradient-to-br from-[#E0F2FE]/80 via-[#EDF6FF]/50 to-white/40 dark:from-blue-950/30 dark:via-blue-900/10 dark:to-transparent',
      panelBorder: 'border-[#BAE6FD]/70 dark:border-blue-800/30',
      panelShadow: 'shadow-[0_4px_24px_rgba(59,130,246,0.08)]',
      arcStroke: '#93C5FD',
      accentColor: 'bg-[#3B82F6]/35',
      iconGradient: 'bg-gradient-to-br from-[#60A5FA] to-[#2563EB] shadow-blue-500/25',
      icon: BookOpen,
      arrowColor: 'text-[#FF6B2C]',
      defaultImage: '/assets/images/journey-card-2.png',
      defaultTitle: 'Choose a Course',
      defaultDescription: 'Explore a wide range of courses and pick the one that fits your goals.',
    },
    {
      borderColor: 'border-2 border-[#FDD8BE] dark:border-orange-800/40',
      cardBg: 'bg-gradient-to-b from-[#FFF7ED] via-[#FFF9F5] to-white dark:from-[#25150D] dark:via-[#1D100A] dark:to-[#120A06]',
      cardGlow: 'hover:shadow-[0_22px_55px_rgba(251,146,60,0.2)]',
      glowOrbColor: 'bg-[#FFEDD5]/85 dark:bg-orange-900/30',
      panelBg: 'bg-gradient-to-br from-[#FFEDD5]/85 via-[#FFF7ED]/50 to-white/40 dark:from-orange-950/30 dark:via-orange-900/10 dark:to-transparent',
      panelBorder: 'border-[#FED7AA]/70 dark:border-orange-800/30',
      panelShadow: 'shadow-[0_4px_24px_rgba(249,115,22,0.08)]',
      arcStroke: '#FDBA74',
      accentColor: 'bg-[#F97316]/35',
      iconGradient: 'bg-gradient-to-br from-[#FB923C] to-[#EA580C] shadow-orange-500/25',
      icon: Play,
      arrowColor: 'text-[#FF6B2C]',
      defaultImage: '/assets/images/journey-card-3.png',
      defaultTitle: 'Learn at Your Own Pace',
      defaultDescription: 'Watch video lessons, follow real-world projects, and gain hands-on experience.',
    },
    {
      borderColor: 'border-2 border-[#C6F5DA] dark:border-emerald-800/40',
      cardBg: 'bg-gradient-to-b from-[#ECFDF5] via-[#F5FEFA] to-white dark:from-[#0B2117] dark:via-[#081A12] dark:to-[#05110B]',
      cardGlow: 'hover:shadow-[0_22px_55px_rgba(52,211,153,0.2)]',
      glowOrbColor: 'bg-[#D1FAE5]/85 dark:bg-emerald-900/30',
      panelBg: 'bg-gradient-to-br from-[#D1FAE5]/85 via-[#ECFDF5]/50 to-white/40 dark:from-emerald-950/30 dark:via-emerald-900/10 dark:to-transparent',
      panelBorder: 'border-[#A7F3D0]/70 dark:border-emerald-800/30',
      panelShadow: 'shadow-[0_4px_24px_rgba(16,185,129,0.08)]',
      arcStroke: '#86EFAC',
      accentColor: 'bg-[#10B981]/35',
      iconGradient: 'bg-gradient-to-br from-[#34D399] to-[#059669] shadow-emerald-500/25',
      icon: Award,
      arrowColor: '',
      defaultImage: '/assets/images/journey-card-4.png',
      defaultTitle: 'Get Certified',
      defaultDescription: 'Complete the course, showcase your skills, and earn a verified certificate.',
    },
  ]

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white dark:bg-[#070B14] overflow-hidden select-none">
      
      {/* Top Ambient Radiant Glow (exact soft lavender/blue from reference image) */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 -z-0 opacity-80"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(232, 225, 254, 0.75) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: 1:1 Typography & Alignment */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Title: Your Learning Journey, Made Simple. */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-[-0.03em] leading-[1.12]">
            <span className="text-[#060C1E] dark:text-white block sm:inline">{titleLine1}</span>{' '}
            <span className="bg-gradient-to-r from-[#7048E8] via-[#5B5CE6] to-[#3B82F6] bg-clip-text text-transparent block sm:inline">
              {titleLine2}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-xs sm:text-sm lg:text-[14.5px] text-[#64748B] dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 4 Cards Section with Connected Wavy Line */}
        <div className="relative">
          
          {/* Connecting Continuous Flowing Wave Ribbon on Desktop */}
          <div
            data-journey-layer="connector-wave"
            className="hidden lg:block absolute top-[28%] left-[4%] right-[4%] h-36 -z-0 pointer-events-none"
            aria-hidden="true"
          >
            <svg className="w-full h-full" viewBox="0 0 1000 120" fill="none" preserveAspectRatio="none">
              <path
                d="M 20 40 C 90 5, 160 10, 200 60 C 240 105, 260 70, 270 70 C 280 70, 320 20, 375 45 C 440 75, 480 85, 520 70 C 560 50, 610 20, 675 45 C 730 70, 755 85, 770 70 C 790 50, 850 15, 980 40"
                stroke="url(#continuous-journey-ribbon)"
                strokeWidth="2.5"
                className="opacity-75"
              />
              <defs>
                <linearGradient id="continuous-journey-ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="28%" stopColor="#3B82F6" />
                  <stop offset="55%" stopColor="#FF6B2C" />
                  <stop offset="80%" stopColor="#FF6B2C" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Cards Grid: Bigger, Prominent, Code-Designed Background with Full Unzoomed Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-stretch relative z-10">
            {steps.map((st, idx) => {
              const theme = cardThemes[idx]
              const Icon = theme.icon
              const hasNextArrow = idx < 3
              const imgSrc = st.studentImage || theme.defaultImage

              return (
                <div
                  key={st.number || idx}
                  data-journey-card={`step-${idx + 1}`}
                  data-journey-layer="card-wrapper"
                  className="relative flex flex-col group"
                >
                  {/* Circular Connector Arrow to next step (Desktop only) */}
                  {hasNextArrow && (
                    <div
                      data-journey-layer="connector-arrow"
                      className="hidden lg:flex absolute -right-3.5 lg:-right-4.5 top-[52%] -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 items-center justify-center transition-transform duration-200 group-hover:scale-110 pointer-events-none"
                    >
                      <ArrowRight className={cn('h-4 w-4 stroke-[2.5]', theme.arrowColor)} />
                    </div>
                  )}

                  {/* The Main Outer Card Container: Perfectly balanced 1:1 proportion with reference UI */}
                  <div
                    className={cn(
                      'relative flex flex-col justify-between w-full rounded-[30px] sm:rounded-[34px] overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 p-3 sm:p-3.5',
                      theme.borderColor,
                      theme.cardBg,
                      theme.cardGlow
                    )}
                  >
                    {/* CODE-DESIGNED CARD BACKGROUND LAYER (Works as the image background just like in the reference) */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
                      {/* 1. Ambient Glow Orb behind the top-left Step Number */}
                      <div className={cn('absolute -top-6 -left-6 w-32 h-32 rounded-full blur-xl', theme.glowOrbColor)} />
                      
                      {/* 2. Soft Inner Card Panel (Matching reference rounded card sheet) */}
                      <div
                        className={cn(
                          'absolute top-4 left-3 right-3 bottom-[82px] rounded-[24px] border',
                          theme.panelBg,
                          theme.panelBorder,
                          theme.panelShadow
                        )}
                      />

                      {/* 3. Subtle Curved Wave Line at the top */}
                      <svg className="absolute top-1.5 right-2 w-40 h-24 opacity-60" viewBox="0 0 200 120" fill="none">
                        <path
                          d="M 10 35 C 70 10, 140 15, 190 70"
                          stroke={theme.arcStroke}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* 4. Subtle Decorative Sparkle Rays */}
                      <span className={cn('absolute top-7 right-8 w-1.5 h-3 rounded-full rotate-45', theme.accentColor)} />
                      <span className={cn('absolute top-10 right-4 w-1.5 h-2.5 rounded-full -rotate-12', theme.accentColor)} />
                    </div>

                    {/* Visual Stage: Fully fitted without blank space or cropping */}
                    <div
                      data-journey-layer="visual-stage"
                      className="relative w-full h-[245px] sm:h-[265px] lg:h-[285px] overflow-hidden flex items-end justify-center z-10"
                    >
                      <Image
                        src={imgSrc}
                        alt={st.title}
                        fill
                        priority={idx < 2}
                        className="object-contain object-bottom select-none pointer-events-none drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>

                    {/* Clean White Bottom Info Pill: Real accessible typography, always rendered and admin-editable */}
                    <div
                      data-journey-layer="info-card"
                      className="relative z-20 w-full rounded-[20px] sm:rounded-[22px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-3.5 shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-slate-100/90 dark:border-slate-800 flex items-center gap-3 shrink-0 transition-transform duration-200"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-sm',
                          theme.iconGradient
                        )}
                      >
                        <Icon className={cn('h-5 w-5 stroke-[2.2]', idx === 2 && 'fill-current')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] sm:text-[14.5px] font-extrabold text-[#060C1E] dark:text-white leading-tight truncate">
                          {st.title}
                        </h3>
                        <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                          {st.description}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}


