'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface PartnerLogo {
  id: number
  src: string
  alt: string
  width: number
  height: number
}

const defaultPartners: PartnerLogo[] = [
  { id: 1, src: '/assets/logos/logo-1.png', alt: 'Logoipsum 1', width: 520, height: 80 },
  { id: 2, src: '/assets/logos/logo-2.png', alt: 'Logoipsum 2', width: 544, height: 80 },
  { id: 3, src: '/assets/logos/logo-3.png', alt: 'Logoipsum 3', width: 418, height: 80 },
  { id: 4, src: '/assets/logos/logo-4.png', alt: 'Logoipsum 4', width: 478, height: 86 },
  { id: 5, src: '/assets/logos/logo-5.png', alt: 'Logoipsum 5', width: 498, height: 80 },
  { id: 6, src: '/assets/logos/logo-6.png', alt: 'Logoipsum University', width: 282, height: 80 },
]

interface PartnersProps {
  title?: string
  partners?: PartnerLogo[]
  className?: string
}

export default function Partners({
  title = 'Trusted by over 100 leading companies worldwide',
  partners = defaultPartners,
  className,
}: PartnersProps) {
  return (
    <section className={cn('relative py-6 sm:py-8 lg:py-10 select-none overflow-hidden', className)}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title: Static & Immediate */}
        <p className="mb-6 sm:mb-8 text-center text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 tracking-normal">
          {title}
        </p>

        {/* Responsive Logo Grid: 2 columns on mobile, 3 on tablet, 6 on desktop (Static Editorial Wall) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-center justify-items-center gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-8 lg:gap-x-10">
          {partners.map((partner) => (
            <div key={partner.id} className="flex items-center justify-center w-full px-2 py-1">
              <div className="relative flex items-center justify-center h-8 sm:h-9 lg:h-10 w-full">
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={partner.width}
                  height={partner.height}
                  className="h-6 sm:h-7 lg:h-8 w-auto max-w-[125px] sm:max-w-[145px] lg:max-w-[160px] object-contain opacity-75 hover:opacity-100 transition-opacity duration-200 dark:brightness-0 dark:invert dark:opacity-70 dark:hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
