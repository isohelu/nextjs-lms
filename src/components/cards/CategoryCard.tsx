import React from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Code2,
  Palette,
  Briefcase,
  Layers,
  Database,
  Terminal,
  Cpu,
  Globe2,
  LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface CategoryData {
  id: string | number
  title: string
  slug: string
  icon?: string
  courses_count?: number
}

const iconMap: Record<string, LucideIcon> = {
  code: Code2,
  palette: Palette,
  briefcase: Briefcase,
  layers: Layers,
  database: Database,
  terminal: Terminal,
  cpu: Cpu,
  globe: Globe2,
}

interface CategoryCardProps {
  category: CategoryData
  className?: string
  color?: string
}

export default function CategoryCard({
  category,
  className,
  color = 'rgba(79,57,246,1)',
}: CategoryCardProps) {
  const IconComponent =
    (category.icon && iconMap[category.icon.toLowerCase()]) || Code2

  return (
    <Link href={`/courses/all?category=${category.slug}`}>
      <Card
        className={cn(
          'group relative min-h-[140px] rounded-2xl border p-6 transition-all duration-300 !shadow-none hover:!shadow-card hover:-translate-y-1',
          className
        )}
        style={{
          borderColor: color.replace('1)', '0.15)'),
          backgroundColor: color.replace('1)', '0.04)'),
        }}
      >
        <div style={{ color }}>
          <IconComponent className="h-7 w-7" />
        </div>

        <p className="mt-4 mb-3 text-lg font-semibold text-foreground">
          {category.title}
        </p>

        <div className="flex items-center justify-between gap-2 text-muted-foreground transition-colors group-hover:text-foreground">
          <p className="text-sm font-medium">
            {category.courses_count || 12} Courses
          </p>
          <ExternalLink className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  )
}
