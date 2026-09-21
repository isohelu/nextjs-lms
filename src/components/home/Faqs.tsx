'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { defaultFaqs } from '@/lib/data/faqs'

export default function Faqs() {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="relative overflow-hidden py-20 bg-muted/10">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Title & Illustration */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
                FAQ
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently Asked Questions!
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Find answers to common questions about course enrollments,
                certificates, access duration, and our 30-day money-back guarantee.
              </p>
            </div>

            <div className="pt-4">
              <img
                src="/assets/images/intro/home-1/faqs.png"
                alt="Frequently Asked Questions"
                className="mx-auto max-w-[280px] drop-shadow-md"
              />
            </div>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:col-span-7 space-y-4">
            {defaultFaqs.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 shadow-xs hover:border-primary/40"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between gap-4 text-left font-semibold text-foreground text-base sm:text-lg focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180 text-primary'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-border/40 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Decorative Blurs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,167,111,0.2)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.2)_0%,transparent_70%)] blur-3xl" />
    </section>
  )
}
