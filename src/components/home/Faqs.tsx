'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { defaultFaqs } from '@/lib/data/faqs'

export default function Faqs() {
  return (
    <div className="overflow-y-hidden py-20">
      <section className="container relative">
        <div className="relative z-10 grid grid-cols-1 gap-7 md:grid-cols-2">
          <div className="md:max-w-lg">
            <p className="mb-1 font-medium text-secondary-foreground">
              FAQ
            </p>
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl text-foreground">
              Frequently Asked Questions!
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about course enrollments, certificates, and access.
            </p>

            <img
              src="/assets/images/intro/home-1/faqs.png"
              alt="Frequently Asked Questions"
              className="mx-auto mt-6 max-w-67 object-contain"
            />
          </div>

          <Accordion
            defaultValue={['faq-0']}
            className="w-full"
          >
            {defaultFaqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${index}`}
                className="mb-4 rounded-lg border border-border bg-background px-6 shadow-xs"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(0,167,111,1)] after:blur-[290px] after:content-['']" />
        <div className="after:pointer-events-none after:absolute after:top-1/2 after:right-20 after:h-72.5 after:w-72.5 after:-translate-y-1/2 after:rounded-full after:bg-[rgba(97,95,255,1)] after:blur-[290px] after:content-['']" />
      </section>
    </div>
  )
}
