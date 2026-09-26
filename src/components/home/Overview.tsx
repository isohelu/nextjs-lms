import React from 'react'
import { Users, Download, Heart, Award } from 'lucide-react'

export default function Overview() {
  const stats = [
    {
      value: '68k+',
      label: 'Join 68k+ students already mastering new skills.',
      icon: Users,
      bgColor: 'bg-[rgba(52,105,154,0.1)]',
      iconBg: 'bg-[rgba(52,105,154,1)]',
    },
    {
      value: '32k+',
      label: 'Downloaded over 32,000 times by users worldwide.',
      icon: Download,
      bgColor: 'bg-[rgba(255,203,97,0.1)]',
      iconBg: 'bg-[rgba(255,203,97,1)]',
    },
    {
      value: '45k+',
      label: 'Loved by learners with 45k+ great reviews.',
      icon: Heart,
      bgColor: 'bg-[rgba(74,151,130,0.1)]',
      iconBg: 'bg-[rgba(74,151,130,1)]',
    },
    {
      value: '1.2k+',
      label: 'Recognized with more than 1,200 prestigious accolades.',
      icon: Award,
      bgColor: 'bg-[rgba(121,158,255,0.1)]',
      iconBg: 'bg-[rgba(121,158,255,1)]',
    },
  ]

  return (
    <section className="container py-20 text-center">
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div
              key={index}
              className={`rounded-3xl border-none ${stat.bgColor} px-6 py-10 shadow-none! transition-transform duration-300 hover:-translate-y-1 md:py-12`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${stat.iconBg} text-white shadow-md`}
              >
                <IconComponent className="h-7 w-7" />
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-4xl font-bold tracking-tight text-foreground md:text-[44px]">
                  {stat.value}
                </h3>
                <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed">
                  {stat.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
