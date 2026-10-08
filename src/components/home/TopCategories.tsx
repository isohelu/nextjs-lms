'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Sparkles, Users, Star } from 'lucide-react'
import { CategoryData, getCategoryIcon } from '@/components/cards/CategoryCard'
import { cn } from '@/lib/utils'

const defaultDisciplines: CategoryData[] = [
  {
    id: 1,
    title: 'Web Development',
    slug: 'web-development',
    description: 'Production-ready web applications, microservices, and distributed cloud systems.',
    courses_count: 14,
  },
  {
    id: 2,
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'Design systems, Figma tokens, interactive prototypes, and spatial UX strategy.',
    courses_count: 8,
  },
  {
    id: 3,
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'Autonomous AI agents, generative models, LLM orchestration, and deep learning.',
    courses_count: 12,
  },
  {
    id: 4,
    title: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'Kubernetes clusters, Docker containers, CI/CD automation, and multi-cloud systems.',
    courses_count: 9,
  },
  {
    id: 5,
    title: 'Data Science & SQL',
    slug: 'data-science',
    description: 'Modern data warehouses, real-time analytics, machine learning, and SQL pipelines.',
    courses_count: 11,
  },
  {
    id: 6,
    title: 'Business & Management',
    slug: 'business-management',
    description: 'Executive tech leadership, agile project roadmaps, and high-growth strategy.',
    courses_count: 7,
  },
]

const disciplineMetadata: Record<
  string,
  { skills: string[]; learners: string; rating: string; badge: string }
> = {
  'web-development': {
    skills: ['React 19', 'Next.js 15', 'TypeScript', 'Node.js', 'PostgreSQL'],
    learners: '2,450+ Learners',
    rating: '4.95 ★',
    badge: 'MOST POPULAR',
  },
  'ui-ux-design': {
    skills: ['Figma Tokens', 'Design Systems', 'Spatial Ergonomics', 'Prototyping'],
    learners: '1,820+ Learners',
    rating: '4.92 ★',
    badge: 'CREATIVE TRACK',
  },
  'artificial-intelligence': {
    skills: ['LLM Agents', 'Neural Nets', 'LangChain', 'Python AI', 'PyTorch'],
    learners: '3,100+ Learners',
    rating: '4.98 ★',
    badge: 'TRENDING #1',
  },
  'cloud-devops': {
    skills: ['Kubernetes', 'Docker', 'AWS Architecture', 'CI/CD Pipelines'],
    learners: '1,430+ Learners',
    rating: '4.89 ★',
    badge: 'ENTERPRISE TECH',
  },
  'data-science': {
    skills: ['SQL Mastery', 'Data Pipelines', 'Python Pandas', 'PowerBI'],
    learners: '1,950+ Learners',
    rating: '4.91 ★',
    badge: 'HIGH DEMAND',
  },
  'business-management': {
    skills: ['Agile Strategy', 'Leadership', 'Tech Finance', 'Product Mgmt'],
    learners: '1,120+ Learners',
    rating: '4.87 ★',
    badge: 'EXECUTIVE',
  },
}

export default function TopCategories({
  categories = defaultDisciplines,
}: {
  categories?: CategoryData[]
}) {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  const validDb = categories.filter(
    (c) => c.title && c.title.toLowerCase() !== 'default'
  )
  const displayDisciplines =
    validDb.length >= 6
      ? validDb.slice(0, 6)
      : [...validDb, ...defaultDisciplines.slice(validDb.length)].slice(0, 6)

  return (
    <section className="relative pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-10 lg:pb-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto mb-8 sm:mb-12 text-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D8FC38]/15 border border-[#D8FC38]/30 text-xs font-semibold text-slate-800 dark:text-[#D8FC38] mb-3 uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Interactive Career Pathways</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Top Categories
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Hover or tap any discipline to expand full curriculum details, in-demand skills, and live courses.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* IDEA 2: HORIZONTAL ACCORDION EXPANDER ON HOVER (Desktop & Tablet)         */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex flex-row gap-3.5 w-full h-[470px] items-stretch isolate">
          {displayDisciplines.map((category, index) => {
            const isExpanded = activeIndex === index
            const meta = disciplineMetadata[category.slug] || {
              skills: ['Hands-on Labs', 'Industry Projects', 'Mentorship', 'Certification'],
              learners: '1,500+ Learners',
              rating: '4.9 ★',
              badge: 'CAREER TRACK',
            }
            const IconComponent = getCategoryIcon(category.slug, category.title, index)

            return (
              <div
                key={category.id || index}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'relative rounded-[28px] overflow-hidden cursor-pointer select-none',
                  'transition-[flex,border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isExpanded
                    ? 'flex-[3.5] bg-white dark:bg-slate-900 border-2 border-[#D8FC38] shadow-[0_22px_55px_rgba(0,0,0,0.08)] dark:shadow-[0_22px_55px_rgba(0,0,0,0.45)]'
                    : 'flex-1 bg-[#F8FAFC] dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-slate-900/90'
                )}
              >
                {/* Collapsed Slim Mode View */}
                {!isExpanded && (
                  <div className="flex flex-col justify-between items-center h-full py-8 px-2 w-full transition-opacity duration-300">
                    {/* Top Icon */}
                    <div className="size-11 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shrink-0">
                      <IconComponent className="size-5 stroke-[2.2]" />
                    </div>

                    {/* Vertical Category Title */}
                    <span className="[writing-mode:vertical-rl] rotate-180 text-base font-bold text-slate-800 dark:text-slate-200 tracking-wide line-clamp-1 whitespace-nowrap">
                      {category.title}
                    </span>

                    {/* Bottom Course Count Dot */}
                    <div className="size-8 rounded-full bg-slate-200/70 dark:bg-slate-800/80 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {category.courses_count || index * 3 + 8}
                    </div>
                  </div>
                )}

                {/* Expanded Rich Card View */}
                {isExpanded && (
                  <div className="flex flex-col justify-between h-full p-8 sm:p-9 animate-in fade-in zoom-in-95 duration-400">
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="size-14 rounded-2xl flex items-center justify-center bg-[#D8FC38] text-slate-950 shadow-[0_8px_20px_rgba(216,252,56,0.35)] shrink-0">
                            <IconComponent className="size-7 stroke-[2.2]" />
                          </div>
                          <div>
                            <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#D8FC38]">
                              {meta.badge}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                              {category.title}
                            </h3>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D8FC38]/15 border border-[#D8FC38]/40 text-slate-900 dark:text-[#D8FC38]">
                          <span>{category.courses_count || index * 3 + 8} Courses</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                        {category.description}
                      </p>

                      {/* In-Demand Skills / Curriculum Tags */}
                      <div className="mt-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
                          In-Demand Skills & Tools
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {meta.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action & Stats Row */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5 text-slate-400" />
                          <strong className="text-slate-700 dark:text-slate-200 font-semibold">{meta.learners}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3.5 fill-[#D8FC38] text-[#D8FC38]" />
                          <strong className="text-slate-700 dark:text-slate-200 font-semibold">{meta.rating}</strong>
                        </span>
                      </div>

                      <Link
                        href={`/courses?category=${category.slug || 'all'}`}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[#D8FC38] text-slate-950 font-bold px-6 py-3 text-sm hover:bg-[#cbf128] transition-all duration-200 shadow-sm hover:shadow-[0_10px_25px_rgba(216,252,56,0.35)] shrink-0"
                      >
                        <span>Explore Pathway</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET: VERTICAL EXPANDABLE ACCORDION STACK                     */}
        {/* ========================================================================= */}
        <div className="lg:hidden flex flex-col gap-3">
          {displayDisciplines.map((category, index) => {
            const isExpanded = activeIndex === index
            const meta = disciplineMetadata[category.slug] || {
              skills: ['Industry Projects', 'Mentorship', 'Certification'],
              learners: '1,500+ Learners',
              rating: '4.9 ★',
              badge: 'CAREER TRACK',
            }
            const IconComponent = getCategoryIcon(category.slug, category.title, index)

            return (
              <div
                key={category.id || index}
                onClick={() => setActiveIndex(isExpanded ? -1 : index)}
                className={cn(
                  'rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer',
                  isExpanded
                    ? 'bg-white dark:bg-slate-900 border-[#D8FC38] shadow-md'
                    : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10'
                )}
              >
                {/* Header bar */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-10 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0',
                        isExpanded
                          ? 'bg-[#D8FC38] text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      )}
                    >
                      <IconComponent className="size-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {category.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {category.courses_count || index * 3 + 8} Courses
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      'size-5 text-slate-400 transition-transform duration-300',
                      isExpanded && 'rotate-180 text-slate-900 dark:text-white'
                    )}
                  />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4.5 pb-5 pt-1 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-300">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                      {category.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {meta.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {meta.learners} • {meta.rating}
                      </span>

                      <Link
                        href={`/courses?category=${category.slug || 'all'}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#D8FC38] text-slate-950 font-bold px-4 py-2 text-xs"
                      >
                        <span>Explore</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}





