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
        <div className="relative z-10 mx-auto w-full max-w-210 rounded-3xl bg-[#007867] px-6 py-16 text-white md:px-12 md:py-20 shadow-2xl">
          <div className="mx-auto w-full max-w-120 text-center">
            <h2 className="text-2xl font-bold leading-tight md:text-3xl md:leading-snug">
              Subscribe to Get the Latest Course Updates & Special Offers
            </h2>
            <p className="mt-3 mb-8 text-white/80 text-sm md:text-base">
              Join over 25,000 students who receive our weekly curated learning materials and exclusive discounts.
            </p>

            {subscribed ? (
              <div className="rounded-xl bg-white/20 p-4 font-semibold text-white backdrop-blur-md">
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
                  className="h-12 flex-1 rounded-xl bg-white px-4 text-foreground text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-xl bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 sm:w-auto"
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
