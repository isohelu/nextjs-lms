'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Star, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TestimonialsSectionData,
  DEFAULT_TESTIMONIALS_DATA,
} from '@/lib/data/testimonials-section'

/**
 * Typographic Double Quote Icon matching the reference image's cheerful lime quotation mark.
 */
function DoubleQuoteIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.5 8C6.5 8 4 10.5 4 13.5c0 1.9 1 3.6 2.5 4.6-.3 2-1.3 3.9-3 5.4l2 2c2.8-2.3 4.5-5.5 4.5-9.5V8h-.5zm14 0c-3 0-5.5 2.5-5.5 5.5 0 1.9 1 3.6 2.5 4.6-.3 2-1.3 3.9-3 5.4l2 2c2.8-2.3 4.5-5.5 4.5-9.5V8H23.5z" />
    </svg>
  )
}

interface TestimonialsProps {
  initialData?: Partial<TestimonialsSectionData>
}

export default function Testimonials({ initialData }: TestimonialsProps) {
  const data: TestimonialsSectionData = {
    ...DEFAULT_TESTIMONIALS_DATA,
    ...initialData,
  }

  const [slideOffset, setSlideOffset] = useState(0)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  const cards = data.cards && data.cards.length > 0 ? data.cards : DEFAULT_TESTIMONIALS_DATA.cards
  const maxOffset = Math.max(0, cards.length - 4)

  const handlePrev = () => {
    setSlideOffset((prev) => (prev > 0 ? prev - 1 : maxOffset))
  }

  const handleNext = () => {
    setSlideOffset((prev) => (prev < maxOffset ? prev + 1 : 0))
  }

  const currentCards = cards.slice(slideOffset, slideOffset + 4)

  const ratingAvatars =
    data.ratingAvatars && data.ratingAvatars.length >= 3
      ? data.ratingAvatars
      : DEFAULT_TESTIMONIALS_DATA.ratingAvatars

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. SECTION HEADER: Admin Configurable & 1:1 Reference Match               */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {data.title}
          </h2>

          {/* Subtitle */}
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. CARDS GRID: Hover Rating System Works on ALL Cards                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {currentCards.map((review) => {
            const isHovered = data.hoverRatingEnabled && hoveredCardId === review.id

            return (
              <div
                key={review.id}
                onMouseEnter={() => setHoveredCardId(review.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() =>
                  setHoveredCardId((prev) => (prev === review.id ? null : review.id))
                }
                className="group relative cursor-pointer min-h-[350px] h-full"
                title="Hover to view average rating"
              >
                {/* ------------------------------------------------------------- */}
                {/* STATE A: LIME RATING CARD (Revealed when card is hovered)     */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#E2FD70] via-[#D8FC38] to-[#B6EE12] text-slate-950 p-7 shadow-xs flex flex-col justify-between transition-all duration-300 select-none overflow-hidden',
                    isHovered
                      ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                      : 'opacity-0 scale-[0.98] z-0 pointer-events-none'
                  )}
                >
                  {/* Organic contour waves in bottom-right corner */}
                  <svg
                    className="absolute -right-4 -bottom-4 w-48 h-48 pointer-events-none opacity-40 text-[#C4FA10]"
                    viewBox="0 0 200 200"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M200,40 C140,50 110,100 70,130 C30,160 0,175 0,200 L200,200 Z"
                      fill="currentColor"
                    />
                    <path
                      d="M200,90 C155,95 125,135 90,160 C60,180 30,190 20,200 L200,200 Z"
                      fill="#E8FE7B"
                    />
                  </svg>

                  {/* Top: 5 Solid Black Stars & Rating */}
                  <div className="relative z-10 space-y-3.5">
                    <div className="flex items-center gap-1.5">
                      {[...Array(data.ratingStars || 5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-slate-950 text-slate-950 stroke-none"
                        />
                      ))}
                    </div>

                    {/* Big Rating Number */}
                    <div className="pt-1">
                      <div className="flex items-baseline">
                        <span className="text-[48px] sm:text-[52px] font-black tracking-tight text-slate-950 leading-none">
                          {data.ratingScore}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-slate-900 ml-1.5">
                          {data.ratingMax}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {data.ratingLabel}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Overlapping Avatars + Trusted Students */}
                  <div className="relative z-10 pt-6">
                    <div className="flex items-center -space-x-2.5 mb-3.5">
                      {ratingAvatars.slice(0, 3).map((avatarUrl, idx) => (
                        <div
                          key={idx}
                          className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-xs"
                        >
                          <Image
                            src={avatarUrl}
                            alt="Student"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ))}
                      <div className="h-8 w-8 rounded-full bg-white text-slate-950 font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none">
                      {data.studentsCount}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-1 leading-none">
                      {data.studentsLabel}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STATE B: STANDARD TESTIMONIAL CARD (Default / not hovered)   */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={cn(
                    'h-full rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
                    isHovered ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
                  )}
                >
                  <div>
                    {/* Top Row: Brand Lime Quote Icon + Golden Stars */}
                    <div className="flex items-center justify-between">
                      <DoubleQuoteIcon className="h-7 w-7 text-[#D8FC38]" />
                      <div className="flex items-center gap-1 text-[#FBBF24]">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current stroke-none" />
                        ))}
                      </div>
                    </div>

                    {/* Body Quote */}
                    <p className="text-slate-700 dark:text-slate-300 text-[14.5px] leading-relaxed my-5 font-normal">
                      {review.quote}
                    </p>
                  </div>

                  {/* Bottom Author Row */}
                  <div className="flex items-center pt-2">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 mr-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {review.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {review.role}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{review.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. NAVIGATION CONTROLS: Below Rating Cards                                 */}
        {/* ========================================================================= */}
        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-2xs transition-colors hover:border-[#D8FC38] hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 cursor-pointer"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </section>
  )
}
