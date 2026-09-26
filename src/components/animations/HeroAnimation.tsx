'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Code2, Users, Star, Layers } from 'lucide-react'

export function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const visualCardRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          titleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          subtitleRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.4'
        )
        .from(
          buttonsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          statsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.3'
        )
        .from(
          visualCardRef.current,
          {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.4)',
          },
          '-=0.7'
        )

      // Floating gentle animation for card elements
      gsap.to('.hero-floating-element', {
        y: -8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 bg-linear-to-b from-background via-card/30 to-background"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-150 rounded-full bg-linear-to-tr from-indigo-500/20 via-violet-500/15 to-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 size-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div ref={badgeRef} className="inline-flex items-center">
              <Badge
                variant="outline"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold gap-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-400 backdrop-blur-md"
              >
                <Sparkles className="size-3.5 text-indigo-400" />
                Next.js 15 & Supabase Powered
              </Badge>
            </div>

            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]"
            >
              Master High-Impact <br />
              <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Full-Stack & AI Skills
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Step into senior-level engineering. Build real-world cloud architectures, multi-agent AI systems, and scalable full-stack applications with guided modules, hands-on labs, and real-time progress syncing.
            </p>

            {/* CTAs */}
            <div ref={buttonsRef} className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="#catalog">
                <Button
                  size="lg"
                  className="rounded-xl px-7 bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
                >
                  Explore Catalog
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth?tab=signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-7 border-border/80 hover:bg-accent hover:border-indigo-500/40 font-semibold"
                >
                  Join for Free
                </Button>
              </Link>
            </div>

            {/* Stats bar */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-border/40 max-w-lg"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black text-foreground">12,500+</p>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                  <Users className="size-3 text-indigo-400" /> Active Students
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-foreground">4.9 / 5.0</p>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                  <Star className="size-3 text-amber-400 fill-amber-400" /> Course Rating
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-foreground">98%</p>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                  <Code2 className="size-3 text-emerald-400" /> Completion Rate
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative" ref={visualCardRef}>
            <div className="relative rounded-2xl border border-border/60 bg-linear-to-b from-card/80 via-card/50 to-background/80 p-6 shadow-2xl backdrop-blur-xl">
              {/* Card top banner */}
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-rose-500/80" />
                  <div className="size-3 rounded-full bg-amber-500/80" />
                  <div className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-muted-foreground ml-2">
                    classroom.stream.tsx
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                  Live Lab
                </Badge>
              </div>

              {/* Mock Player / Lab Preview */}
              <div className="mt-4 rounded-xl overflow-hidden border border-border/40 bg-zinc-950 p-4 space-y-3 font-mono text-xs text-indigo-300">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>{`// Supabase Realtime Stream`}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                </div>
                <div className="bg-zinc-900/90 rounded-lg p-3 text-[12px] space-y-1 text-zinc-300">
                  <p><span className="text-purple-400">const</span> supabase = <span className="text-blue-400">createClient</span>()</p>
                  <p><span className="text-purple-400">const</span> &#123; data: session &#125; = <span className="text-purple-400">await</span> supabase.auth.<span className="text-amber-300">getUser</span>()</p>
                  <p className="text-emerald-400">{`// Row Level Security Verified ✓`}</p>
                </div>
              </div>

              {/* Floating badges around card */}
              <div className="hero-floating-element absolute -top-4 -right-4 rounded-xl border border-indigo-500/30 bg-card/95 p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Layers className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">App Router</p>
                  <p className="text-[10px] text-muted-foreground">Next.js 15 Ready</p>
                </div>
              </div>

              <div className="hero-floating-element absolute -bottom-5 -left-4 rounded-xl border border-emerald-500/30 bg-card/95 p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">PostgreSQL RLS</p>
                  <p className="text-[10px] text-muted-foreground">Supabase Live DB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
