import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Sparkles, GraduationCap } from 'lucide-react'

interface AuthLayoutProps {
  title: string
  description: string
  headline?: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthLayout({
  children,
  title,
  description,
  headline = 'Master In-Demand Skills',
  subtitle = 'Join over 68,000+ professionals learning cutting-edge engineering and modern technologies.',
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side brand banner (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-muted/20 p-12 relative overflow-hidden">
        {/* Glow blur backgrounds */}
        <div className="pointer-events-none absolute top-10 left-10 h-72 w-72 rounded-full bg-[rgba(97,95,255,0.08)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[rgba(0,167,111,0.08)] blur-3xl" />

        {/* Brand Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Mentor<span className="text-primary">LMS</span>
            </span>
          </Link>
        </div>

        {/* Illustration & Headline */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Accredited Global Curriculum</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
              {headline}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Social Proof Card */}
          <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img
                  className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Student"
                />
                <img
                  className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Student"
                />
                <img
                  className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Student"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Verified Student Community</p>
                <p className="text-xs text-muted-foreground">4.9/5 stars from 45,000+ course reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Enterprise-grade end-to-end security & data protection</span>
        </div>
      </div>

      {/* Right side form view */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Mentor<span className="text-primary">LMS</span>
              </span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Form Children */}
          {children}
        </div>
      </div>
    </div>
  )
}
