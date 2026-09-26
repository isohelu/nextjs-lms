'use client'

import React from 'react'
import { Laptop, Award, Users } from 'lucide-react'

export default function Home3Features() {
  const features = [
    {
      icon: Laptop,
      title: 'Flexible Online Learning',
      description: 'Learn at your own pace anytime, anywhere with lifetime access to all lessons, assignments, and curriculum resources.',
    },
    {
      icon: Users,
      title: 'Certified Expert Instructors',
      description: 'Gain practical knowledge directly from industry practitioners working at leading tech enterprises and research labs.',
    },
    {
      icon: Award,
      title: 'Recognized Certifications',
      description: 'Receive verifiable digital certificates upon passing course exams, ready to showcase directly on your professional resume.',
    },
  ]

  return (
    <section className="relative overflow-hidden py-16">
      <div className="container mx-auto px-4">
        <div className="relative z-10 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-card hover:border-primary/40"
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="leading-relaxed text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <div className="after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-24 after:w-24 after:rounded-full after:bg-primary/5 after:blur-2xl after:content-['']"></div>
                <div className="after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:h-24 after:w-24 after:rounded-full after:bg-secondary/10 after:blur-2xl after:content-['']"></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
