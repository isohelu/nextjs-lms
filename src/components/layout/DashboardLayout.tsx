'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  School,
  Book,
  ShoppingBag,
  FilePenLine,
  Palette,
  Briefcase,
  Users,
  CreditCard,
  Award,
  Newspaper,
  Globe,
  Settings,
  GitCompareArrows,
  ChevronDown,
  PanelLeft,
  Bell,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  GraduationCap,
  Heart,
  Mail,
} from 'lucide-react'
import AppLogo from '@/components/common/AppLogo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NavChild {
  name: string
  href: string
  access?: ('admin' | 'instructor')[]
}

export interface NavMenuItem {
  title: string
  href?: string
  icon: React.ElementType
  access: ('admin' | 'instructor')[]
  children?: NavChild[]
}

export const fullDashboardRoutes: NavMenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    access: ['admin', 'instructor'],
  },
  {
    title: 'Courses',
    icon: School,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/courses/categories', access: ['admin'] },
      { name: 'Manage Courses', href: '/dashboard/courses', access: ['admin', 'instructor'] },
      { name: 'Create Course', href: '/dashboard/courses/create', access: ['admin', 'instructor'] },
      { name: 'Course Coupons', href: '/dashboard/courses/course/coupons', access: ['admin'] },
      { name: 'Course Enrollments', href: '/dashboard/courses/course/enrollments', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Exams',
    icon: Book,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/exams/categories', access: ['admin'] },
      { name: 'Manage Exams', href: '/dashboard/exams', access: ['admin', 'instructor'] },
      { name: 'Create Exam', href: '/dashboard/exams/create', access: ['admin', 'instructor'] },
      { name: 'Exam Coupons', href: '/dashboard/exams/exam/coupons', access: ['admin'] },
      { name: 'Exam Enrollments', href: '/dashboard/exams/exam/enrollments', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Store',
    icon: ShoppingBag,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/store/categories', access: ['admin'] },
      { name: 'Manage Products', href: '/dashboard/store/products', access: ['admin', 'instructor'] },
      { name: 'Create Product', href: '/dashboard/store/products/create', access: ['admin', 'instructor'] },
      { name: 'Product Coupons', href: '/dashboard/store/products/product/coupons', access: ['admin'] },
      { name: 'Product Sales', href: '/dashboard/store/products/product/sales', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Blogs',
    icon: FilePenLine,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/blogs/categories', access: ['admin'] },
      { name: 'Create Blog', href: '/dashboard/blogs/create', access: ['admin', 'instructor'] },
      { name: 'Manage Blog', href: '/dashboard/blogs', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Frontend',
    icon: Palette,
    access: ['admin'],
    children: [
      { name: 'Pages', href: '/dashboard/frontend/pages', access: ['admin'] },
      { name: 'Hero Section', href: '/dashboard/frontend/hero-section', access: ['admin'] },
      { name: 'About Platform', href: '/dashboard/frontend/about-section', access: ['admin'] },
      { name: 'Learning Journey', href: '/dashboard/frontend/learning-journey', access: ['admin'] },
      { name: 'Live Schedules', href: '/dashboard/frontend/live-schedules', access: ['admin'] },
      { name: 'Study Showcase', href: '/dashboard/frontend/lms-showcase', access: ['admin'] },
      { name: 'Testimonials Section', href: '/dashboard/frontend/testimonials', access: ['admin'] },
      { name: 'Blog Section', href: '/dashboard/frontend/blog-section', access: ['admin'] },
      { name: 'Page API', href: '/dashboard/frontend/api', access: ['admin'] },
    ],
  },
  {
    title: 'Job Circulars',
    icon: Briefcase,
    access: ['admin'],
    children: [
      { name: 'All Jobs', href: '/dashboard/job-circulars', access: ['admin'] },
      { name: 'Create Job', href: '/dashboard/job-circulars/create', access: ['admin'] },
    ],
  },
  {
    title: 'Instructors',
    icon: Users,
    access: ['admin'],
    children: [
      { name: 'Applications', href: '/dashboard/instructors/applications', access: ['admin'] },
      { name: 'Manage Instructors', href: '/dashboard/instructors', access: ['admin'] },
      { name: 'Create Instructor', href: '/dashboard/instructors/create', access: ['admin'] },
    ],
  },
  {
    title: 'Billings',
    icon: CreditCard,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Configuration', href: '/dashboard/billings/payment', access: ['admin'] },
      { name: 'Online Payments', href: '/dashboard/billings/payment-reports/online', access: ['admin'] },
      { name: 'Offline Payments', href: '/dashboard/billings/payment-reports/offline', access: ['admin'] },
      { name: 'Payout Request', href: '/dashboard/billings/payouts/request', access: ['admin'] },
      { name: 'Payout History', href: '/dashboard/billings/payouts/history', access: ['admin'] },
      { name: 'Withdraw', href: '/dashboard/billings/payouts', access: ['instructor'] },
      { name: 'Settings', href: '/dashboard/billings/payouts/settings', access: ['instructor'] },
    ],
  },
  {
    title: 'Certificate',
    icon: Award,
    access: ['admin'],
    children: [
      { name: 'Certificate', href: '/dashboard/certification/certificate', access: ['admin'] },
      { name: 'Marksheet', href: '/dashboard/certification/marksheet', access: ['admin'] },
    ],
  },
  {
    title: 'Newsletters',
    href: '/dashboard/newsletters',
    icon: Newspaper,
    access: ['admin'],
  },
  {
    title: 'All Users',
    href: '/dashboard/users',
    icon: UserCheck,
    access: ['admin'],
  },
  {
    title: 'Translation',
    href: '/dashboard/language',
    icon: Globe,
    access: ['admin'],
  },
  {
    title: 'Settings',
    icon: Settings,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Account', href: '/dashboard/settings/account', access: ['admin', 'instructor'] },
      { name: 'System', href: '/dashboard/settings/system', access: ['admin'] },
      { name: 'Storage', href: '/dashboard/settings/storage', access: ['admin'] },
      { name: 'SMTP', href: '/dashboard/settings/smtp', access: ['admin'] },
      { name: 'Plugins', href: '/dashboard/settings/plugins', access: ['admin'] },
      { name: 'Auth', href: '/dashboard/settings/auth0', access: ['admin'] },
      { name: 'Video Player', href: '/dashboard/settings/video-player', access: ['admin'] },
      { name: 'Live Class', href: '/dashboard/settings/live-class', access: ['admin'] },
      { name: 'Meta Pixel', href: '/dashboard/settings/meta-pixel', access: ['admin'] },
      { name: 'Google Analytics', href: '/dashboard/settings/google-analytics', access: ['admin'] },
    ],
  },
  {
    title: 'Maintenance',
    href: '/dashboard/settings/maintenance',
    icon: GitCompareArrows,
    access: ['admin'],
  },
]

function computeInitialAccordions(pathname: string): Record<string, boolean> {
  const initial: Record<string, boolean> = {
    Courses: false,
    Exams: false,
    Store: false,
    Blogs: false,
    Frontend: false,
    'Job Circulars': false,
    Instructors: false,
    Billings: false,
    Certificate: false,
    Settings: false,
  }
  if (!pathname) return initial

  fullDashboardRoutes.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(c => {
        if (pathname === c.href) return true
        if (pathname.startsWith(c.href + '/')) {
          const hasMoreSpecificSibling = item.children?.some(
            other => other.href !== c.href && other.href.length > c.href.length && (pathname === other.href || pathname.startsWith(other.href + '/'))
          )
          return !hasMoreSpecificSibling
        }
        return false
      })
      if (hasActiveChild) {
        initial[item.title] = true
      }
    }
  })
  return initial
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role?: 'admin' | 'instructor'
}

export default function DashboardLayout({
  children,
  role: initialRole
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [queryRole, setQueryRole] = useState<'admin' | 'instructor' | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    id?: number
    name?: string
    email?: string
    role?: 'admin' | 'instructor'
  } | null>(null)
  const [storedRole, setStoredRole] = useState<'admin' | 'instructor' | null>(null)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('Zinc')
  const [selectedFont, setSelectedFont] = useState('Inter')

  const THEME_COLORS = [
    { label: 'Zinc', value: 'Zinc', hsl: '#18181b', primary: '240 5.9% 10%' },
    { label: 'Rose', value: 'Rose', hsl: '#e11d48', primary: '346.8 77.2% 49.8%' },
    { label: 'Blue', value: 'Blue', hsl: '#3b82f6', primary: '221.2 83.2% 53.3%' },
    { label: 'Green', value: 'Green', hsl: '#16a34a', primary: '142.1 76.2% 36.3%' },
    { label: 'Orange', value: 'Orange', hsl: '#f97316', primary: '24.6 95% 53.1%' },
  ]

  const FONT_FAMILIES = [
    { label: 'Inter', value: 'Inter', font: 'var(--font-inter), Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto', font: 'Roboto, sans-serif' },
    { label: 'Poppins', value: 'Poppins', font: 'Poppins, sans-serif' },
    { label: 'Nunito', value: 'Nunito', font: 'Nunito, sans-serif' },
    { label: 'Outfit', value: 'Outfit', font: 'Outfit, sans-serif' },
  ]

  const handleColorChange = (colorName: string, primaryHsl: string) => {
    setSelectedColor(colorName)
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary', primaryHsl)
      localStorage.setItem('theme_color', colorName)
    }
  }

  const handleFontChange = (fontName: string, fontFamily: string) => {
    setSelectedFont(fontName)
    if (typeof document !== 'undefined') {
      document.body.style.fontFamily = fontFamily
      localStorage.setItem('theme_font', fontName)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('theme_color')
      if (savedColor) {
        const found = THEME_COLORS.find(c => c.value === savedColor)
        if (found) {
          setSelectedColor(found.value)
          document.documentElement.style.setProperty('--primary', found.primary)
        }
      }
      const savedFont = localStorage.getItem('theme_font')
      if (savedFont) {
        const foundFont = FONT_FAMILIES.find(f => f.value === savedFont)
        if (foundFont) {
          setSelectedFont(foundFont.value)
          document.body.style.fontFamily = foundFont.font
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('role')
      if (r === 'instructor' || r === 'admin') {
        setQueryRole(r)
        localStorage.setItem('dashboard_role', r)
      } else {
        const saved = localStorage.getItem('dashboard_role') as 'admin' | 'instructor' | null
        if (saved) setStoredRole(saved)
      }
      setIsDark(document.documentElement.classList.contains('dark'))
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const nextDark = !document.documentElement.classList.contains('dark')
      if (nextDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      setIsDark(nextDark)
    }
  }

  const activeRole: 'admin' | 'instructor' =
    (currentUser?.role === 'admin' || currentUser?.role === 'instructor' ? currentUser.role : null) ||
    initialRole ||
    (queryRole === 'admin' || queryRole === 'instructor' ? queryRole : null) ||
    (storedRole === 'admin' || storedRole === 'instructor' ? storedRole : null) ||
    'instructor'

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => computeInitialAccordions(pathname))

  // Fetch logged in session
  const fetchAuthUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setCurrentUser(data.user)
          if (data.user.role === 'admin' || data.user.role === 'instructor') {
            setStoredRole(data.user.role)
            if (typeof window !== 'undefined') {
              localStorage.setItem('dashboard_role', data.user.role)
              localStorage.setItem('mentor_user_role', data.user.role)
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  const toggleAccordion = (title: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Auto-expand active accordion if child path matches current route
  useEffect(() => {
    fullDashboardRoutes.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(c => {
          if (pathname === c.href) return true
          if (pathname.startsWith(c.href + '/')) {
            const hasMoreSpecificSibling = item.children?.some(
              other => other.href !== c.href && other.href.length > c.href.length && (pathname === other.href || pathname.startsWith(other.href + '/'))
            )
            return !hasMoreSpecificSibling
          }
          return false
        })
        if (hasActiveChild) {
          setOpenAccordions(prev => prev[item.title] ? prev : ({ ...prev, [item.title]: true }))
        }
      }
    })
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user')
      localStorage.setItem('mentor_user_role', 'guest')
      document.cookie = 'demo_user=; path=/; max-age=0'
      document.cookie = 'mentor_session=; path=/; max-age=0'
      document.cookie = 'lms_session=; path=/; max-age=0'
      window.dispatchEvent(new Event('mentor_user_state_changed'))
      window.dispatchEvent(new Event('storage'))
    }
    window.location.href = '/login'
  }

  // Filter routes according to active user role
  const visibleRoutes = fullDashboardRoutes
    .filter(item => item.access.includes(activeRole))
    .map(item => ({
      ...item,
      children: item.children
        ? item.children.filter(child => !child.access || child.access.includes(activeRole))
        : undefined,
    }))

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : activeRole === 'admin' ? 'SA' : 'LI'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased font-sans">
      {/* Left Sidebar */}
      <aside
        className={cn(
          'h-full flex-shrink-0 flex flex-col border-r border-border bg-background transition-all duration-300 ease-in-out z-40',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center px-4 py-3 border-b border-border/40">
          <Link href="/" className={cn('flex items-center gap-2 overflow-hidden', !sidebarOpen && 'justify-center w-full')}>
            <AppLogo className="h-[26px] w-auto" />
          </Link>
        </div>

        {/* Navigation Section with ScrollArea */}
        <div className={cn('flex-1 overflow-y-auto space-y-1', sidebarOpen ? 'p-2' : 'p-1')}>
          {sidebarOpen && (
            <div className="text-sidebar-foreground/70 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium uppercase tracking-wider">
              Main Menu
            </div>
          )}

          <nav className="space-y-1">
            {visibleRoutes.map((item) => {
              const Icon = item.icon
              const isDirectLink = !!item.href
              const hasActiveChild = item.children?.some(c => {
                if (pathname === c.href) return true
                if (pathname.startsWith(c.href + '/')) {
                  const hasMoreSpecificSibling = item.children?.some(
                    other => other.href !== c.href && other.href.length > c.href.length && (pathname === other.href || pathname.startsWith(other.href + '/'))
                  )
                  return !hasMoreSpecificSibling
                }
                return false
              })
              const isParentActive = (isDirectLink && (item.href === '/dashboard' ? (pathname === '/dashboard' || pathname === '/admin/dashboard' || pathname === '/instructor/dashboard') : (pathname === item.href || pathname.startsWith(item.href + '/')))) || (!isDirectLink && hasActiveChild)
              const isOpen = openAccordions[item.title] ?? (hasActiveChild || false)

              if (isDirectLink) {
                return (
                  <Link
                    key={item.title}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 h-10 text-sm font-medium transition-colors',
                      isParentActive
                        ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Link>
                )
              }

              return (
                <div key={item.title} className="space-y-1">
                  <div
                    className={cn(
                      'h-10 overflow-hidden rounded-lg hover:bg-muted transition-colors',
                      isParentActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.title)}
                      className={cn(
                        'flex h-10 w-full cursor-pointer items-center justify-between gap-3 px-3 py-0 text-sm font-normal hover:no-underline'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>{item.title}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-200',
                            isParentActive ? 'text-primary' : 'text-muted-foreground',
                            isOpen && 'rotate-180'
                          )}
                        />
                      )}
                    </button>
                  </div>

                  {/* Dropdown Children with Tree Connectors */}
                  {sidebarOpen && isOpen && item.children && (
                    <div className="space-y-1 p-0 py-1">
                      {item.children.map((child, childIdx) => {
                        const isLast = childIdx === item.children!.length - 1
                        const isExact = pathname === child.href
                        const hasSiblingMatch = item.children?.some(
                          other => other.href !== child.href && (pathname === other.href || (other.href.length > child.href.length && pathname.startsWith(other.href + '/')))
                        )
                        const isChildActive = isExact || (!hasSiblingMatch && pathname.startsWith(child.href + '/'))
                        return (
                          <div className="relative w-full pl-7" key={child.name}>
                            <span
                              className={cn(
                                'absolute top-0 left-4 border-l border-sidebar-border/60',
                                isLast ? 'h-1/2' : 'h-full'
                              )}
                            />
                            <span className="absolute top-1/2 left-4 w-3 -translate-y-px rounded-bl-lg border-b border-sidebar-border/60" />
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center h-9 pl-3 rounded-md text-sm capitalize transition-colors',
                                isChildActive
                                  ? 'bg-secondary font-medium text-secondary-foreground hover:bg-secondary/90'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span>{child.name}</span>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md md:px-6">
          {/* Left: Sidebar trigger */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="-ml-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-transparent text-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {/* Language Dropdown Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center justify-center px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                >
                  US
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem className="cursor-pointer text-xs font-medium">English (US)</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs font-medium">Spanish (ES)</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs font-medium">French (FR)</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs font-medium">German (DE)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme / Appearance Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Notification Bell */}
            <Link
              href="/dashboard/newsletters"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            </Link>

            {/* Settings Cog opening slide-over SettingsDrawer */}
            <Sheet open={settingsDrawerOpen} onOpenChange={setSettingsDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSettingsDrawerOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Settings"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 sm:max-w-80">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                    <Palette className="h-4 w-4 text-primary" />
                    Settings
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-6 overflow-y-auto px-5 py-5 text-sm">
                  {/* Appearance Mode */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Appearance
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={!isDark ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (isDark) toggleTheme()
                        }}
                        className="w-full text-xs"
                      >
                        <Sun className="mr-1.5 h-3.5 w-3.5" /> Light
                      </Button>
                      <Button
                        variant={isDark ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (!isDark) toggleTheme()
                        }}
                        className="w-full text-xs"
                      >
                        <Moon className="mr-1.5 h-3.5 w-3.5" /> Dark
                      </Button>
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Color Preset
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {THEME_COLORS.map(({ label, value, hsl, primary }) => (
                        <button
                          key={value}
                          type="button"
                          title={label}
                          onClick={() => handleColorChange(value, primary)}
                          className={cn(
                            'group relative flex h-10 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 transition-all duration-150 hover:scale-105 cursor-pointer',
                            selectedColor === value
                              ? 'border-primary shadow-md'
                              : 'border-transparent hover:border-border'
                          )}
                        >
                          <span
                            className="h-5 w-5 rounded-full shadow-sm"
                            style={{ backgroundColor: hsl }}
                          />
                          {selectedColor === value && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Font Family
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {FONT_FAMILIES.map(({ label, value, font }) => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFontChange(value, font)}
                          className={cn(
                            'justify-between text-xs h-8',
                            selectedFont === value
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-border hover:bg-muted'
                          )}
                        >
                          <span style={{ fontFamily: font }}>{label}</span>
                          {selectedFont === value && <span className="text-xs">✓</span>}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Settings Links */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Quick Configuration
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard/settings/system"
                        onClick={() => setSettingsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors text-xs font-medium"
                      >
                        <span>System & Branding</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                      </Link>
                      <Link
                        href="/dashboard/settings/storage"
                        onClick={() => setSettingsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors text-xs font-medium"
                      >
                        <span>Storage Configuration</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                      </Link>
                      <Link
                        href="/dashboard/settings/smtp"
                        onClick={() => setSettingsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors text-xs font-medium"
                      >
                        <span>SMTP Email Settings</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                      </Link>
                      <Link
                        href="/dashboard/settings/plugins"
                        onClick={() => setSettingsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors text-xs font-medium"
                      >
                        <span>Plugins & Extensions</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                      </Link>
                      <Link
                        href="/dashboard/settings/maintenance"
                        onClick={() => setSettingsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors text-xs font-medium text-amber-600 dark:text-amber-400"
                      >
                        <span>Maintenance Mode</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Profile Drawer matching Laravel LMS profile-drawer.tsx */}
            <Sheet open={profileDrawerOpen} onOpenChange={setProfileDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(true)}
                  className="relative ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer border border-border"
                >
                  {userInitials}
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 sm:max-w-80">
                <SheetHeader className="p-0">
                  {/* Cover / Hero banner */}
                  <div className="relative h-24 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />

                  {/* Avatar overlapping cover */}
                  <div className="absolute top-14 left-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-lg font-bold text-primary shadow-md">
                      {userInitials}
                    </div>
                  </div>
                </SheetHeader>

                {/* Profile Info */}
                <div className="space-y-1 px-5 pt-12 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-foreground">
                        {currentUser?.name || (activeRole === 'instructor' ? 'Lead Instructor' : 'System Administrator')}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <p className="truncate text-xs text-muted-foreground">
                          {currentUser?.email || (activeRole === 'instructor' ? 'instructor@mentor.test' : 'admin@mentor.test')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs font-semibold capitalize">
                      {currentUser?.role || activeRole}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Instructor Menu Items matching Laravel profile-drawer.tsx */}
                {(currentUser?.role === 'instructor' || activeRole === 'instructor') && (
                  <>
                    <div className="space-y-1 p-3">
                      <Link
                        href="/student/courses"
                        onClick={() => setProfileDrawerOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>My Courses</span>
                      </Link>
                      <Link
                        href="/student/wishlist"
                        onClick={() => setProfileDrawerOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        href="/student/profile"
                        onClick={() => setProfileDrawerOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/student/settings"
                        onClick={() => setProfileDrawerOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Logout Button matching Laravel profile-drawer.tsx */}
                <div className="p-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
