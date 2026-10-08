'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from '@/components/common/SocialIcons'
import { toast } from 'sonner'

function AppleIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.49 2.65-1.24z" />
    </svg>
  )
}

function GooglePlayIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.609 1.814L13.792 12 3.61 22.186A2.29 2.29 0 0 1 3 20.617V3.383c0-.622.226-1.196.609-1.569z"
        fill="#00D2FF"
      />
      <path
        d="M17.186 8.607L13.792 12l3.394 3.393 3.834-2.18c1.096-.623 1.096-1.983 0-2.606l-3.834-2.0z"
        fill="#FFCE00"
      />
      <path
        d="M3.609 1.814l10.183 10.186 3.394-3.393L6.082.529C5.109-.024 4.093.078 3.609 1.814z"
        fill="#00F076"
      />
      <path
        d="M17.186 15.393L13.792 12 3.609 22.186c.484 1.736 1.5 1.838 2.473 1.285l11.104-8.078z"
        fill="#FF3A44"
      />
    </svg>
  )
}

interface FooterProps {
  showBanner?: boolean
}

export default function Footer({ showBanner = true }: FooterProps) {
  const router = useRouter()
  const [certificateCode, setCertificateCode] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false)

  const handleCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = certificateCode.trim().toUpperCase()
    if (clean) {
      router.push(`/verify-certificate?code=${encodeURIComponent(clean)}`)
    }
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setIsNewsletterSubscribed(true)
      setIsNewsletterOpen(false)
      toast.success('Thank you for subscribing to our newsletter!')
      setNewsletterEmail('')
    }
  }

  return (
    <footer className="relative bg-black text-white pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-12 border-t border-slate-900 select-none overflow-hidden">
      
      {/* Background ambient dark emerald glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[140px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. TOP PROMOTIONAL CARD: Modern Slate Card with Electric Lime Accents     */}
        {/* ========================================================================= */}
        {showBanner && (
          <div className="mb-14 sm:mb-18 lg:mb-20">
            <div className="relative overflow-hidden rounded-[26px] sm:rounded-[36px] lg:rounded-[44px] bg-gradient-to-r from-slate-900 via-[#0d1522] to-slate-900 border border-slate-800 px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 text-center text-white shadow-2xl">
              
              {/* Inner ambient soft lights */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D8FC38]/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#D8FC38]/5 blur-3xl" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
                
                {/* Headline with horizontal extension line matching reference UI */}
                <div className="inline-flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight text-white leading-tight">
                    Verify your certificate
                  </h2>
                  <span className="hidden sm:inline-block h-[2px] w-20 md:w-32 lg:w-44 bg-[#D8FC38] self-center mt-1" />
                </div>

                {/* Subtitle text for certificate verification */}
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
                  Enter your unique credential ID or certificate code to instantly validate authentic accreditation, completion records, and academic standing with tamper-proof cryptographic verification.
                </p>

                {/* Certificate Verification Code Input Pill */}
                <div className="pt-2 sm:pt-4 max-w-lg mx-auto">
                  <form
                    onSubmit={handleCertificateSubmit}
                    className="relative flex items-center rounded-full bg-white p-1 sm:p-1.5 shadow-xl"
                  >
                    <input
                      type="text"
                      required
                      value={certificateCode}
                      onChange={(e) => setCertificateCode(e.target.value)}
                      placeholder="Enter certificate code (e.g. CERT-MLMS-2026)"
                      className="w-full bg-transparent px-4 sm:px-6 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none uppercase tracking-wider font-semibold"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-sm px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                    >
                      Verify now
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MAIN FOOTER CONTENT: 4-Column Layout matching reference               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16 items-start">
          
          {/* Left Column: Sign up for our newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Sign up for our newsletter
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Don&apos;t worry, we reserve our newsletter for important news so we only send a few updates a year.
            </p>

            <div className="pt-1">
              {isNewsletterSubscribed ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-[#D8FC38]/40 px-5 py-2 text-sm font-semibold text-[#D8FC38]">
                  <span>✓ You&apos;re subscribed to our newsletter!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsNewsletterOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 hover:border-white text-white text-sm font-semibold px-8 py-2.5 transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                >
                  Subscribe
                </button>
              )}

              {/* Collapsible inline newsletter form */}
              {isNewsletterOpen && !isNewsletterSubscribed && (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="mt-3.5 flex items-center max-w-xs rounded-full border border-slate-700 bg-slate-900/90 p-1"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-3.5 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-xs px-4 py-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Area: 3 Navigation Columns + App Store Badges */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              
              {/* Column 1: Help and services */}
              <div className="space-y-3.5">
                <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">
                  Help and services
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li>
                    <Link href="/about-us" className="hover:text-white transition-colors duration-150">
                      How does it work
                    </Link>
                  </li>
                  <li>
                    <Link href="/#faqs" className="hover:text-white transition-colors duration-150">
                      FAQS
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact-us" className="hover:text-white transition-colors duration-150">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/verify-certificate" className="hover:text-white transition-colors duration-150">
                      Verify Certificate
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: To explore */}
              <div className="space-y-3.5">
                <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">
                  To explore
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li>
                    <Link href="/courses/all" className="hover:text-white transition-colors duration-150">
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link href="/exams/all" className="hover:text-white transition-colors duration-150">
                      Live Exams
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="hover:text-white transition-colors duration-150">
                      Learning Store
                    </Link>
                  </li>
                  <li>
                    <Link href="/blogs/all" className="hover:text-white transition-colors duration-150">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Other possibilities */}
              <div className="space-y-3.5 col-span-2 sm:col-span-1">
                <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">
                  Other possibilities
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li>
                    <Link href="/instructor/register" className="hover:text-white transition-colors duration-150">
                      Become an Instructor
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:text-white transition-colors duration-150">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/our-team" className="hover:text-white transition-colors duration-150">
                      Our Team
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-and-conditions" className="hover:text-white transition-colors duration-150">
                      Terms & Privacy
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* App Store & Google Play Badges placed under right columns matching reference */}
            <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3.5 pt-8 lg:pt-10">
              
              {/* Apple App Store */}
              <a
                href="https://apple.com/app-store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black border border-white/25 hover:border-white/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-sm"
                aria-label="Download on the App Store"
              >
                <AppleIcon className="h-6 w-6 text-white shrink-0" />
                <div className="text-left leading-tight">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Download on the</div>
                  <div className="text-sm font-bold text-white tracking-tight -mt-0.5">App Store</div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black border border-white/25 hover:border-white/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-sm"
                aria-label="Get it on Google Play"
              >
                <GooglePlayIcon className="h-6 w-6 shrink-0" />
                <div className="text-left leading-tight">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">ANDROID APP ON</div>
                  <div className="text-sm font-bold text-white tracking-tight -mt-0.5">Google play</div>
                </div>
              </a>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM BAR: Divider line, Copyright, and Social Icons                  */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          
          {/* Copyright text */}
          <p>© {new Date().getFullYear()} Mentor LMS. All rights reserved.</p>

          {/* Social Icons with #D8FC38 hover */}
          <div className="flex items-center gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#D8FC38] transition-colors p-1"
              aria-label="Facebook"
            >
              <FacebookIcon className="size-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#D8FC38] transition-colors p-1"
              aria-label="Twitter"
            >
              <TwitterIcon className="size-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#D8FC38] transition-colors p-1"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-5" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}
