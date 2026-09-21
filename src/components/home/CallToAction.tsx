'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

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
    '/assets/avatars/avatar-1.png',
    '/assets/avatars/avatar-2.png',
    '/assets/avatars/avatar-3.png',
    '/assets/avatars/avatar-4.png',
    '/assets/avatars/avatar-5.png',
    '/assets/avatars/avatar-6.png',
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-3xl sm:rounded-4xl bg-[rgba(0,114,98,1)] shadow-xl">
          <div className="space-y-6 bg-[url('/assets/images/intro/home-1/cta-bg-vector.png')] bg-cover bg-center px-6 py-16 text-center text-white md:px-12 md:py-20">
            {/* Title */}
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Subscribe Our Newsletter
            </h2>

            <p className="mx-auto max-w-md text-base text-white/90 leading-relaxed">
              Subscribe to our newsletter to get the latest news, updates, and
              exclusive course discounts delivered directly to your inbox.
            </p>

            {/* Newsletter Input Form */}
            <div className="mx-auto max-w-md">
              {subscribed ? (
                <div className="rounded-xl bg-white/20 p-3.5 backdrop-blur text-sm font-semibold text-white">
                  ✓ Thank you for subscribing! Welcome to Mentor LMS.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:rounded-xl sm:bg-white sm:p-1.5"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full rounded-xl bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:bg-transparent"
                  />
                  <Button
                    type="submit"
                    className="shrink-0 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>

            {/* Avatar Stack */}
            <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
              <div className="flex -space-x-2">
                {avatars.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Subscriber ${index + 1}`}
                    className="h-8 w-8 rounded-full border-2 border-[rgba(0,114,98,1)] object-cover"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-white/95">
                +2000 readers worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
