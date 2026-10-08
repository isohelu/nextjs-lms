'use client'

import React from 'react'
import Link from 'next/link'
import {
  Code2,
  Palette,
  Bot,
  Cloud,
  Database,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CategoryData {
  id: string | number
  title: string
  slug: string
  icon?: string
  description?: string
  courses_count?: number
  isHighlight?: boolean
}

// Geometric Glyph Icons preserved for backward compatibility
export function StaircaseGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <rect x="4" y="20" width="7" height="7" rx="1.5" />
      <rect x="12.5" y="12.5" width="7" height="7" rx="1.5" />
      <rect x="21" y="5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function PixelMatrixGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <rect x="6" y="6" width="9" height="9" rx="2" />
      <rect x="17" y="6" width="9" height="9" rx="2" />
      <rect x="6" y="17" width="9" height="9" rx="2" />
    </svg>
  )
}

export function DeltaTrianglesGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <polygon points="16,4 8,14 24,14" />
      <polygon points="16,28 8,18 24,18" />
    </svg>
  )
}

export function StarburstGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 3l3 5.5 6-1-1.5 6 5.5 3-5.5 3 1.5 6-6-1-3 5.5-3-5.5-6 1 1.5-6-5.5-3 5.5-3-1.5-6 6 1z" />
    </svg>
  )
}

export function CrossNodesGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <rect x="13.5" y="4" width="5" height="24" rx="2" />
      <rect x="4" y="13.5" width="24" height="5" rx="2" />
      <rect x="7" y="7" width="4.5" height="4.5" rx="1" />
      <rect x="20.5" y="7" width="4.5" height="4.5" rx="1" />
      <rect x="7" y="20.5" width="4.5" height="4.5" rx="1" />
      <rect x="20.5" y="20.5" width="4.5" height="4.5" rx="1" />
    </svg>
  )
}

export function AsteriskPetalsGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} viewBox="0 0 32 32" fill="currentColor">
      <circle cx="16" cy="16" r="4" />
      <rect x="14" y="3" width="4" height="7" rx="2" />
      <rect x="14" y="22" width="4" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="4" rx="2" />
      <rect x="22" y="14" width="7" height="4" rx="2" />
      <rect x="6.5" y="6.5" width="4" height="7" rx="2" transform="rotate(-45 8.5 10)" />
      <rect x="21.5" y="21.5" width="4" height="7" rx="2" transform="rotate(-45 23.5 25)" />
      <rect x="21.5" y="6.5" width="4" height="7" rx="2" transform="rotate(45 23.5 10)" />
      <rect x="6.5" y="21.5" width="4" height="7" rx="2" transform="rotate(45 8.5 25)" />
    </svg>
  )
}

/**
 * Human-designed icon resolver matching specific discipline semantics
 */
export function getCategoryIcon(slug?: string, title?: string, index: number = 0): LucideIcon {
  const key = `${slug || ''} ${title || ''}`.toLowerCase()
  if (key.includes('web') || key.includes('code') || key.includes('full-stack') || key.includes('dev') || key.includes('software')) {
    return Code2
  }
  if (key.includes('design') || key.includes('ui') || key.includes('ux') || key.includes('figma')) {
    return Palette
  }
  if (key.includes('ai') || key.includes('intelligence') || key.includes('agent') || key.includes('machine') || key.includes('bot')) {
    return Bot
  }
  if (key.includes('cloud') || key.includes('devops') || key.includes('aws') || key.includes('docker') || key.includes('k8s')) {
    return Cloud
  }
  if (key.includes('data') || key.includes('sql') || key.includes('analytic') || key.includes('warehouse')) {
    return Database
  }
  if (key.includes('business') || key.includes('manage') || key.includes('leader') || key.includes('marketing')) {
    return Briefcase
  }
  if (key.includes('cyber') || key.includes('security')) {
    return ShieldCheck
  }

  const fallbackIcons: LucideIcon[] = [Code2, Palette, Bot, Cloud, Database, Briefcase]
  return fallbackIcons[index % fallbackIcons.length]
}

interface CategoryCardProps {
  category: CategoryData
  className?: string
  index?: number
  isHighlight?: boolean
}

export default function CategoryCard({
  category,
  className,
  index = 0,
  isHighlight = false,
}: CategoryCardProps) {
  const defaultTitles = [
    'Web Development',
    'UI/UX Design',
    'Artificial Intelligence',
    'Cloud & DevOps',
    'Data Science & SQL',
    'Business & Management',
  ]

  const displayTitle =
    category.title && category.title.toLowerCase() !== 'default'
      ? category.title
      : defaultTitles[index % defaultTitles.length]

  const defaultDescriptions = [
    'Production-ready web applications and scalable distributed systems.',
    'Design systems, Figma tokens, spatial ergonomics, and UX strategy.',
    'Autonomous agents, LLM orchestration, and generative intelligence.',
    'Kubernetes, Docker, CI/CD pipelines, and high-availability clouds.',
    'Modern data warehouses, real-time analytics, and SQL pipelines.',
    'System security, zero-trust architecture, and penetration testing.',
  ]

  const description =
    category.description || defaultDescriptions[index % defaultDescriptions.length]

  return (
    <div className="h-full">
      <Link
        href={`/courses?category=${category.slug || 'all'}`}
        className={cn(
          'group relative flex flex-col justify-between h-full rounded-[26px] sm:rounded-[28px]',
          'bg-[#F8FAFC] dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10',
          'p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none',
          'hover:border-[#D8FC38] hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl dark:hover:border-[#D8FC38]/80',
          'active:scale-[0.99]',
          'transition-all duration-200 ease-out cursor-pointer overflow-hidden',
          isHighlight && 'bg-slate-950 text-white border-slate-800',
          className
        )}
      >
        <div>
          {/* Top Human-Designed Icon Container */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-xs transition-colors duration-200 ease-out group-hover:bg-[#D8FC38] group-hover:text-slate-950 group-hover:border-[#D8FC38]">
            {React.createElement(getCategoryIcon(category.slug, category.title, index), {
              className: 'h-6 w-6 stroke-[2.2] transition-colors duration-200',
            })}
          </div>

          {/* Title */}
          <h3 className="mt-6 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1 transition-colors duration-200">
            {displayTitle}
          </h3>

          {/* Description */}
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Bottom Link with Subtle Arrow Slide */}
        <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200 transition-colors duration-200 group-hover:text-slate-950 dark:group-hover:text-[#D8FC38]">
          <span>Explore path</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1.5" />
        </div>
      </Link>
    </div>
  )
}
