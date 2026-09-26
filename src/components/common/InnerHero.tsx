import React from 'react'
import Link from 'next/link'
import { ChevronsRight, Home } from 'lucide-react'

interface InnerHeroProps {
  title: string
  slug: string
}

export default function InnerHero({ title, slug }: InnerHeroProps) {
  return (
    <div className="relative overflow-y-hidden bg-[rgba(255,222,99,0.06)] -mt-18 pt-53 pb-25">
      <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
        <h1 className="text-4xl font-bold md:text-[44px] text-foreground">
          {title}
        </h1>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors flex items-center">
            <Home size={18} />
          </Link>
          <ChevronsRight size={14} />
          <span className="text-sm">{slug}</span>
        </div>
      </div>

      {/* Decorative Blur Circle matching Laravel */}
      <div className="after:pointer-events-none after:absolute after:top-1/2 after:right-0 after:h-50 after:w-50 after:-translate-y-1/2 after:rounded-full after:bg-[rgba(0,167,111,1)] after:blur-[140px] after:content-['']" />
    </div>
  )
}
