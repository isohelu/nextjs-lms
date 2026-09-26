'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CategoryCard4Props {
  category: {
    title: string
    slug: string
    courses_count?: number
    icon?: string | null
  }
  className?: string
}

export default function CategoryCard4({ category, className }: CategoryCard4Props) {
  return (
    <Link href={`/courses?category=${category.slug}`} className="block">
      <Card
        className={cn(
          'group rounded-2xl border border-border/80 bg-card p-6 shadow-none transition-all duration-300 hover:shadow-card hover:border-primary/40',
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Layers className="h-6 w-6" />
        </div>
        <p className="pt-5 pb-6 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.title}
        </p>

        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground group-hover:text-foreground">
          <span className="font-medium">
            {category.courses_count ?? 15} Courses
          </span>
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Card>
    </Link>
  )
}
