'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

export default function CallToAction() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const avatars = [
    { name: 'Student 1', image: '/assets/avatars/avatar-1.png' },
    { name: 'Student 2', image: '/assets/avatars/avatar-2.png' },
    { name: 'Student 3', image: '/assets/avatars/avatar-3.png' },
    { name: 'Student 4', image: '/assets/avatars/avatar-4.png' },
  ]

  return (
    <section className="relative py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Card: Clean Institutional Dark Slate with Electric Lime */}
        <div className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] bg-slate-950 border border-slate-800/90 px-6 py-10 sm:px-10 sm:py-14 text-center text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-tight">
              Ready to Advance Your Technical Career?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Join over 108,000 students and gain access to comprehensive courses, hands-on projects, and verified certificates.
            </p>

            {/* Newsletter / Action Form */}
            <div className="mx-auto w-full max-w-md pt-2">
              {subscribed ? (
                <div className="flex items-center justify-center gap-2 rounded-full bg-slate-900 border border-[#D8FC38]/40 p-3.5 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-5 w-5 text-[#D8FC38]" />
                  <span>Thank you! We&apos;ve sent your exclusive welcome guide.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative flex items-center rounded-full bg-white p-1 sm:p-1.5 shadow-lg">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-4 sm:px-5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    placeholder="Enter your email address..."
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] px-5 sm:px-6 py-2.5 text-sm font-bold text-slate-950 shadow-xs transition-colors duration-200 active:scale-[0.98] cursor-pointer shrink-0"
                  >
                    <span>Get Started</span>
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </form>
              )}
            </div>

            {/* Student Social Proof Bottom */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
              <div className="flex -space-x-2">
                {avatars.map((item, index) => (
                  <div key={index} className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 overflow-hidden bg-slate-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={28}
                      height={28}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                Over <span className="text-white font-bold">100,000+</span> 5-star student reviews worldwide
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
