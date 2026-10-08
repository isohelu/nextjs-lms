'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Code,
  Cpu,
  PenTool,
  Server,
  BarChart2,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Flame,
  Compass,
  SlidersHorizontal,
  BadgeCheck,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MegaCategory {
  id: string
  title: string
  slug: string
  icon: React.ElementType
  courseCount: string
  badge?: string
  popularTracks: { title: string; href: string }[]
  careerPaths: { title: string; href: string }[]
  skillLevels: { title: string; href: string }[]
}

const MEGA_CATEGORIES: MegaCategory[] = [
  {
    id: 'web-dev',
    title: 'Web & Full-Stack Development',
    slug: 'web-development',
    icon: Code,
    courseCount: '142 Courses',
    badge: 'POPULAR',
    popularTracks: [
      { title: 'Next.js 15 & React 19 Pro', href: '/courses?category=web-development&search=nextjs' },
      { title: 'TypeScript 5 Enterprise', href: '/courses?category=web-development&search=typescript' },
      { title: 'Node.js & Express REST APIs', href: '/courses?category=web-development&search=nodejs' },
      { title: 'Tailwind CSS v4 & Modern UI', href: '/courses?category=web-development&search=tailwind' },
      { title: 'Full-Stack PostgreSQL Architecture', href: '/courses?category=web-development&search=postgres' },
    ],
    careerPaths: [
      { title: 'Senior Full-Stack Engineer', href: '/courses?category=web-development' },
      { title: 'Frontend Systems Architect', href: '/courses?category=web-development' },
      { title: 'Backend API Specialist', href: '/courses?category=web-development' },
      { title: 'React Native Mobile Developer', href: '/courses?category=web-development' },
    ],
    skillLevels: [
      { title: 'Beginner Foundations (0 to 1)', href: '/courses?category=web-development&level=Beginner' },
      { title: 'Intermediate Project Builder', href: '/courses?category=web-development&level=Intermediate' },
      { title: 'Advanced Masterclass & Architecture', href: '/courses?category=web-development&level=Advanced' },
      { title: 'Accredited Certification Track', href: '/courses?category=web-development' },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    slug: 'artificial-intelligence',
    icon: Cpu,
    courseCount: '86 Courses',
    badge: 'HOT',
    popularTracks: [
      { title: 'LLMs, RAG & Vector Databases', href: '/courses?category=artificial-intelligence&search=rag' },
      { title: 'Python for Deep Learning & PyTorch', href: '/courses?category=artificial-intelligence&search=python' },
      { title: 'LangChain & Autonomous AI Agents', href: '/courses?category=artificial-intelligence&search=agents' },
      { title: 'Computer Vision & OpenAI APIs', href: '/courses?category=artificial-intelligence&search=openai' },
    ],
    careerPaths: [
      { title: 'AI Applications Engineer', href: '/courses?category=artificial-intelligence' },
      { title: 'Machine Learning Scientist', href: '/courses?category=artificial-intelligence' },
      { title: 'Prompt Engineer & AI Strategist', href: '/courses?category=artificial-intelligence' },
    ],
    skillLevels: [
      { title: 'AI for Developers (Beginner)', href: '/courses?category=artificial-intelligence&level=Beginner' },
      { title: 'Production GenAI (Intermediate)', href: '/courses?category=artificial-intelligence&level=Intermediate' },
      { title: 'Fine-Tuning & Quantization (Advanced)', href: '/courses?category=artificial-intelligence&level=Advanced' },
    ],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX & Product Design',
    slug: 'ui-ux-design',
    icon: PenTool,
    courseCount: '64 Courses',
    popularTracks: [
      { title: 'Figma to Production Code Masterclass', href: '/courses?category=ui-ux-design&search=figma' },
      { title: 'Design Systems & OKLCH Tokens', href: '/courses?category=ui-ux-design&search=tokens' },
      { title: 'Micro-Interactions & Spatial Motion', href: '/courses?category=ui-ux-design&search=motion' },
      { title: 'High-Converting Landing Page UX', href: '/courses?category=ui-ux-design&search=landing' },
    ],
    careerPaths: [
      { title: 'Product Designer (UI/UX)', href: '/courses?category=ui-ux-design' },
      { title: 'Design Systems Lead', href: '/courses?category=ui-ux-design' },
      { title: 'UX Researcher & Architect', href: '/courses?category=ui-ux-design' },
    ],
    skillLevels: [
      { title: 'Design Fundamentals (Beginner)', href: '/courses?category=ui-ux-design&level=Beginner' },
      { title: 'Interactive Prototypes (Intermediate)', href: '/courses?category=ui-ux-design&level=Intermediate' },
      { title: 'Enterprise Design Systems (Advanced)', href: '/courses?category=ui-ux-design&level=Advanced' },
    ],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps Architecture',
    slug: 'cloud-devops',
    icon: Server,
    courseCount: '58 Courses',
    popularTracks: [
      { title: 'AWS Cloud Solutions Architect', href: '/courses?category=cloud-devops&search=aws' },
      { title: 'Docker, Kubernetes & Microservices', href: '/courses?category=cloud-devops&search=k8s' },
      { title: 'CI/CD Pipelines with GitHub Actions', href: '/courses?category=cloud-devops&search=cicd' },
      { title: 'Terraform & Infrastructure as Code', href: '/courses?category=cloud-devops&search=terraform' },
    ],
    careerPaths: [
      { title: 'DevOps & Site Reliability Engineer', href: '/courses?category=cloud-devops' },
      { title: 'Cloud Infrastructure Architect', href: '/courses?category=cloud-devops' },
    ],
    skillLevels: [
      { title: 'Cloud Basics (Beginner)', href: '/courses?category=cloud-devops&level=Beginner' },
      { title: 'Containerization Pro (Intermediate)', href: '/courses?category=cloud-devops&level=Intermediate' },
      { title: 'Multi-Cloud Enterprise (Advanced)', href: '/courses?category=cloud-devops&level=Advanced' },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    slug: 'data-science',
    icon: BarChart2,
    courseCount: '72 Courses',
    popularTracks: [
      { title: 'Advanced SQL & Database Optimization', href: '/courses?category=data-science&search=sql' },
      { title: 'Python Pandas, NumPy & Visualization', href: '/courses?category=data-science&search=pandas' },
      { title: 'PowerBI, Tableau & Executive Analytics', href: '/courses?category=data-science&search=bi' },
    ],
    careerPaths: [
      { title: 'Data Analyst & BI Specialist', href: '/courses?category=data-science' },
      { title: 'Quantitative Data Scientist', href: '/courses?category=data-science' },
    ],
    skillLevels: [
      { title: 'SQL Essentials (Beginner)', href: '/courses?category=data-science&level=Beginner' },
      { title: 'Statistical Modeling (Intermediate)', href: '/courses?category=data-science&level=Intermediate' },
      { title: 'Big Data & Spark (Advanced)', href: '/courses?category=data-science&level=Advanced' },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Ethical Hacking',
    slug: 'cybersecurity',
    icon: ShieldCheck,
    courseCount: '45 Courses',
    badge: 'PRO',
    popularTracks: [
      { title: 'CompTIA Security+ Certification', href: '/courses?category=cybersecurity&search=security' },
      { title: 'Web App Penetration Testing & OWASP', href: '/courses?category=cybersecurity&search=pentest' },
      { title: 'Network Security & Threat Analysis', href: '/courses?category=cybersecurity&search=network' },
    ],
    careerPaths: [
      { title: 'Certified Ethical Hacker (CEH)', href: '/courses?category=cybersecurity' },
      { title: 'SOC Security Analyst', href: '/courses?category=cybersecurity' },
    ],
    skillLevels: [
      { title: 'Cyber Hygiene (Beginner)', href: '/courses?category=cybersecurity&level=Beginner' },
      { title: 'Ethical Hacking (Intermediate)', href: '/courses?category=cybersecurity&level=Intermediate' },
      { title: 'Defensive Architecture (Advanced)', href: '/courses?category=cybersecurity&level=Advanced' },
    ],
  },
  {
    id: 'business',
    title: 'Business & Management',
    slug: 'business-management',
    icon: Briefcase,
    courseCount: '52 Courses',
    popularTracks: [
      { title: 'Tech Product Management (Agile/Scrum)', href: '/courses?category=business-management&search=pm' },
      { title: 'Startup Strategy & Venture Funding', href: '/courses?category=business-management&search=startup' },
      { title: 'Financial Modeling & SaaS Metrics', href: '/courses?category=business-management&search=metrics' },
    ],
    careerPaths: [
      { title: 'Technical Product Manager (TPM)', href: '/courses?category=business-management' },
      { title: 'Startup Founder & Operations Lead', href: '/courses?category=business-management' },
    ],
    skillLevels: [
      { title: 'Business Fundamentals (Beginner)', href: '/courses?category=business-management&level=Beginner' },
      { title: 'Product Leadership (Intermediate)', href: '/courses?category=business-management&level=Intermediate' },
      { title: 'Executive Operations (Advanced)', href: '/courses?category=business-management&level=Advanced' },
    ],
  },
]

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('web-dev')
  const menuCardRef = useRef<HTMLDivElement>(null)

  // Listen for outside clicks on any blank space or document area
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (menuCardRef.current && !menuCardRef.current.contains(target)) {
        // Prevent toggle conflict if user clicked the catalog button directly
        const catalogBtn = document.getElementById('catalog-toggle-button')
        if (catalogBtn && catalogBtn.contains(target)) {
          return
        }
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Capture mousedown / touchstart early to ensure responsive dismissal
    document.addEventListener('mousedown', handleOutsideInteraction)
    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction)
      document.removeEventListener('touchstart', handleOutsideInteraction)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeCategory =
    MEGA_CATEGORIES.find((c) => c.id === activeCategoryId) || MEGA_CATEGORIES[0]

  return (
    <>
      {/* Transparent Backdrop Scrim - No blur, clicking anywhere on background dismisses menu */}
      <div
        className="fixed inset-0 top-0 z-30 bg-transparent cursor-pointer print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Dropdown Panel (pointer-events-none to let clicks pass to backdrop on gutters) */}
      <div
        className="hidden md:block absolute top-full left-0 right-0 z-50 mt-3 w-full pointer-events-none"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pointer-events-none">
          
          {/* MegaMenu Card Container with Clean Neutral Surface & Subtle Shadow */}
          <div
            ref={menuCardRef}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all"
          >
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left Column (3.2 Cols): Categories List */}
            <div className="flex flex-col gap-1 border-r border-border/70 pr-4 lg:col-span-3">
              <div className="mb-3 px-3 flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <span>Browse Categories</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-[#D8FC38] px-2 py-0.5 rounded-md">500+ Courses</span>
              </div>

              {MEGA_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = cat.id === activeCategoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-150 cursor-pointer',
                      isActive
                        ? 'bg-[#D8FC38]/15 text-slate-950 dark:text-white font-bold shadow-xs border-l-2 border-[#D8FC38]'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isActive
                            ? 'bg-[#D8FC38] text-slate-950 shadow-xs'
                            : 'bg-muted text-muted-foreground group-hover:bg-[#D8FC38]/20 group-hover:text-slate-950 dark:group-hover:text-[#D8FC38]'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold">{cat.title}</span>
                          {cat.badge && (
                            <span className="rounded bg-[#D8FC38] px-2 py-0.5 text-xs font-bold text-slate-950">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {cat.courseCount}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={cn(
                        'size-4 shrink-0 transition-transform duration-150',
                        isActive
                          ? 'text-slate-950 dark:text-[#D8FC38] translate-x-1'
                          : 'text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1'
                      )}
                    />
                  </button>
                )
              })}

              <div className="mt-3 border-t border-border/60 pt-3">
                <Link
                  href="/courses/all"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-bold text-slate-950 dark:text-white hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D8FC38]" />
                    Explore All Learning Tracks
                  </span>
                  <ArrowUpRight className="size-4 text-slate-600 dark:text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Middle Columns (6 Cols): 3 Sub-columns */}
            <div
              key={activeCategory.id}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-6 lg:border-r lg:border-border/70 lg:pr-6"
            >
              
              {/* Sub-column 1: Popular Tracks */}
              <div className="flex flex-col gap-2.5">
                <div className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Flame className="size-4 text-amber-500" />
                  <span className="text-foreground">Popular Tracks</span>
                </div>
                <div className="flex flex-col gap-1">
                  {activeCategory.popularTracks.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground hover:translate-x-1 transition-all duration-150"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sub-column 2: Career Paths */}
              <div className="flex flex-col gap-2.5">
                <div className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Compass className="size-4 text-slate-700 dark:text-slate-300" />
                  <span className="text-foreground">Career Paths</span>
                </div>
                <div className="flex flex-col gap-1">
                  {activeCategory.careerPaths.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground hover:translate-x-1 transition-all duration-150"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sub-column 3: Skill Levels */}
              <div className="flex flex-col gap-2.5">
                <div className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <SlidersHorizontal className="size-4 text-slate-700 dark:text-slate-300" />
                  <span className="text-foreground">Skill Level</span>
                </div>
                <div className="flex flex-col gap-1">
                  {activeCategory.skillLevels.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground hover:translate-x-1 transition-all duration-150"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (3 Cols): Promotional Card */}
            <div className="flex flex-col justify-between lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-5 text-white shadow-xl">
                
                <div className="relative z-10 flex flex-col items-start">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D8FC38]/20 border border-[#D8FC38]/40 px-2.5 py-1 text-xs font-bold tracking-wide text-[#D8FC38]">
                    <BadgeCheck className="size-3.5 text-[#D8FC38]" />
                    <span>INSTRUCTOR SPOTLIGHT</span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-white">
                    Teach what you love & earn up to $5,000/mo
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Join 2,500+ verified mentors. Create courses, grade code reviews, and reach students worldwide.
                  </p>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 p-3 w-full">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#D8FC38]/20 text-[#D8FC38]">
                      <Wallet className="size-4 text-[#D8FC38]" />
                    </div>
                    <div className="text-xs leading-tight">
                      <p className="font-bold text-white">Instant Payouts</p>
                      <p className="text-xs text-slate-400">Direct to Stripe & PayPal</p>
                    </div>
                  </div>

                  <Link
                    href="/become-instructor"
                    onClick={onClose}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 px-4 py-2.5 text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
                  >
                    <span>Start Teaching Today</span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </>
  )
}
