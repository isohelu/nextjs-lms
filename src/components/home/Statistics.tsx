import React from 'react'
import { Card } from '@/components/ui/card'

export interface StatItem {
  id: number | string
  value: string
  label: string
}

const DEFAULT_STATS: StatItem[] = [
  { id: 1, value: '68k+', label: 'Active Students' },
  { id: 2, value: '1.2k+', label: 'Premium Courses' },
  { id: 3, value: '45k+', label: '5-Star Reviews' },
  { id: 4, value: '98%', label: 'Placement Rate' },
]

export default function Statistics({ stats }: { stats?: StatItem[] }) {
  const items = stats || DEFAULT_STATS

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-center justify-between gap-10 sm:gap-14 border-none bg-[#004B50] p-8 sm:p-12 text-white shadow-xl rounded-3xl md:flex-row md:px-16 lg:px-24">
          {items.map((statistic) => (
            <div key={statistic.id} className="text-center md:text-left space-y-1">
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                {statistic.value}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-white/80 tracking-wide uppercase">
                {statistic.label}
              </p>
            </div>
          ))}
        </Card>
      </div>
    </section>
  )
}
