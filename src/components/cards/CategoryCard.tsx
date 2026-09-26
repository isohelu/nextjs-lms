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
    <Link
      href={`/courses/all?category=${category.slug}`}
      className="group flex flex-col h-full"
    >
      <Card
        className={cn(
          'flex flex-col justify-between h-full rounded-2xl border p-5 transition-all duration-300 shadow-none! hover:shadow-card! hover:-translate-y-1',
          className
        )}
        style={{
          borderColor: color.replace('1)', '0.15)'),
          backgroundColor: color.replace('1)', '0.04)'),
        }}
      >
        <div>
          <div style={{ color }}>
            <IconComponent className="h-7 w-7" />
          </div>

          <p className="mt-4 mb-4 text-xl font-semibold text-foreground line-clamp-2 min-h-14">
            {category.title}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 text-muted-foreground transition-colors group-hover:text-foreground pt-2">
          <p className="text-sm font-medium">
            {category.courses_count || 12} Courses
          </p>
          <ExternalLink className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  )
}
