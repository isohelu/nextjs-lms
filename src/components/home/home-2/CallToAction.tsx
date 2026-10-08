'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Home2CallToAction() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubscribed(true)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden py-20">
      <div className="container mx-auto px-4">
        <div className="relative z-10 mx-auto w-full max-w-210 rounded-3xl bg-slate-950 border border-slate-800 px-6 py-16 text-white md:px-12 md:py-20 shadow-xl">
          <div className="mx-auto w-full max-w-120 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D8FC38]/15 px-3 py-1 text-xs font-bold text-[#D8FC38] border border-[#D8FC38]/30 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8FC38]" />
              STAY IN THE LOOP
            </div>
            <h2 className="text-2xl font-bold leading-tight md:text-3xl md:leading-snug text-white">
              Subscribe to Get the Latest Course Updates & Special Offers
            </h2>
            <p className="mt-3 mb-8 text-slate-300 text-sm md:text-base leading-relaxed">
              Join over 25,000 students who receive our weekly curated learning materials and exclusive discounts.
            </p>

            {subscribed ? (
              <div className="rounded-xl bg-[#D8FC38]/20 border border-[#D8FC38]/40 p-4 font-bold text-[#D8FC38]">
                ✓ Thank you for subscribing to our newsletter!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 text-white text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#D8FC38]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] px-6 font-bold text-slate-950 shadow-xs sm:w-auto transition-all active:scale-[0.98]"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
