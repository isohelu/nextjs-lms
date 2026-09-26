'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CategoryCard3Props {
  category: {
    title: string
    slug: string
    courses_count?: number
  }
  className?: string
}

export default function CategoryCard3({ category, className }: CategoryCard3Props) {
  return (
    <Link href={`/courses?category=${category.slug}`} className="block">
      <Card className={cn('flex flex-col justify-center h-27.5 gap-2 rounded-2xl border border-border/80 bg-card px-8 py-5 shadow-none transition-all duration-300 hover:shadow-card hover:border-primary/40', className)}>
        <p className="text-lg font-semibold text-foreground truncate">{category.title}</p>
        <p className="text-sm text-muted-foreground">
          {category.courses_count ?? 12} Courses
        </p>
      </Card>
    </Link>
  )
}
