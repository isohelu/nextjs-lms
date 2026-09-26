'use client'

import React from 'react'
import { Users, Video, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Home2Overview() {
  const stats = [
    {
      count: '15,000+',
      title: 'Active Learners Worldwide',
      icon: Users,
    },
    {
      count: '1,450+',
      title: 'High-Quality Video Lessons',
      icon: Video,
    },
    {
      count: '4.9 / 5',
      title: 'Positive Student Reviews',
      icon: Star,
    },
  ]

  return (
    <section className="relative overflow-hidden py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="relative z-10 mx-auto mb-12 text-center md:max-w-2xl">
          <p className="mb-2 font-medium text-secondary-foreground">
            Platform Overview
          </p>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-foreground">
            Empowering Millions Through Accessible Education
          </h2>
          <p className="text-muted-foreground">
            Our numbers reflect our commitment to excellence in modern learning and student empowerment.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="relative z-10 flex flex-col items-center justify-center border border-border/80 bg-card/60 p-8 shadow-card backdrop-blur-md transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {stat.count}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
