'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home4Hero() {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-190 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            ★ Next-Generation Learning Experience
          </div>

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight md:text-5xl md:leading-tight lg:text-6xl text-foreground">
            Master High-Demand Tech Skills with Proven Curriculum
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:px-6">
            Practical, project-based courses designed by industry specialists. Fast-track your path into high-growth software and AI engineering careers.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row sm:gap-5">
            <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/25 font-semibold text-base">
              <Link href="/courses">
                Get Started Now
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="rounded-xl px-8 font-semibold text-base">
              <Link href="/about-us">
                Browse Masterclasses
              </Link>
            </Button>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-col items-center justify-center gap-1.5 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-foreground text-sm">4.9 / 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on 12,500+ verified student reviews from 80+ countries
            </p>
          </div>
        </div>

        {/* Video Thumbnail Card with Play Modal */}
        <div className="relative mx-auto max-w-220 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card-hover md:rounded-4xl group">
          <img
            src="/assets/images/intro/home-1/hero-image.png"
            alt="Platform preview"
            className="mx-auto w-full max-h-125 object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <button
            onClick={() => setShowVideo(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-primary/90 focus:outline-none"
            aria-label="Play video overview"
          >
            <Play className="h-8 w-8 fill-current ml-1" />
          </button>
        </div>

        {/* Lightbox modal */}
        {showVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black aspect-video shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Course Overview Video"
                className="h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
