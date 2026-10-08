'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { defaultFaqs } from '@/lib/data/faqs'

export default function Faqs() {
  return (
    <section className="relative py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* Section Header: Centered & Clean (Pill Removed)                           */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Frequently Asked Questions
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Find transparent answers about curriculum access, verified certificates, billing, and career mentorship.
          </p>
        </div>

        {/* Accordion Container: Centered & Focused */}
        <div className="max-w-4xl mx-auto">
          <Accordion
            defaultValue={['faq-0']}
            className="w-full space-y-3.5"
          >
            {defaultFaqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${index}`}
                className="overflow-hidden rounded-[20px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 px-6 py-1 shadow-xs transition-[border-color] duration-200 data-[state=open]:border-[#D8FC38] dark:data-[state=open]:border-[#D8FC38]"
              >
                <AccordionTrigger className="text-base sm:text-lg font-bold text-slate-900 dark:text-white text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed pb-4 pt-1">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Support Banner Card: Centered below Accordion */}
          <div className="mt-8 sm:mt-10 rounded-[22px] border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8FC38]/25 text-slate-950 dark:text-[#D8FC38] shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Need further assistance?
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Our student support team is available 24/7.
                </p>
              </div>
            </div>

            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] px-5 py-2.5 text-sm font-bold text-slate-950 shadow-xs transition-all duration-200 active:scale-[0.98] shrink-0"
            >
              <span>Contact Support</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
