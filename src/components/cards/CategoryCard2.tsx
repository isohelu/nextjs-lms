import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Code,
  Layout,
  Database,
  Shield,
  Smartphone,
  Sparkles,
  BarChart,
  Layers
} from 'lucide-react'
import { CategoryData } from './CategoryCard'

const ICON_MAP: Record<string, any> = {
  code: Code,
  layout: Layout,
  database: Database,
  shield: Shield,
  smartphone: Smartphone,
  sparkles: Sparkles,
  chart: BarChart,
  layers: Layers,
}

export default function CategoryCard2({ category }: { category: CategoryData }) {
  const IconComponent = ICON_MAP[(category.icon || '').toLowerCase()] || Layers

  return (
    <Link
      href={`/courses/all?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col h-full"
    >
      <Card className="flex h-full items-center gap-4 rounded-2xl p-5 border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <IconComponent className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {category.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {category.courses_count || 12} Courses
          </p>
        </div>
      </Card>
    </Link>
  )
}
