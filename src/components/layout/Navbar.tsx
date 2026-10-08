'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  GraduationCap,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppearance, initializeTheme } from '@/hooks/use-appearance'

export interface NavItem {
  id: number
  title: string
  href: string
  value: string
  type: string
  active: boolean
}

export const navItems: NavItem[] = [
  { id: 1, title: 'Home', href: '/', value: '/', type: 'url', active: true },
  { id: 2, title: 'Courses', href: '/courses', value: '/courses', type: 'url', active: true },
  { id: 3, title: 'For Business', href: '/for-business', value: '/for-business', type: 'url', active: true },
  { id: 4, title: 'Instructors', href: '/instructors', value: '/instructors', type: 'url', active: true },
  { id: 5, title: 'Blog', href: '/blogs', value: '/blogs', type: 'url', active: true },
]

interface AuthUser {
  id: number
  name: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  photo?: string | null
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/auth')
  const loginHref = pathname && pathname !== '/' && !isAuthPage
    ? `/login?redirect=${encodeURIComponent(pathname)}`
    : '/login'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Auth User state
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mounted, setMounted] = useState(false)

  // Appearance / Dark-Light Mode Hook
  const { resolvedAppearance, updateAppearance } = useAppearance()
  const isDark = mounted ? resolvedAppearance === 'dark' : false

  // Initialize theme on client mount
  useEffect(() => {
    initializeTheme()
    setMounted(true)
  }, [])

  // Toggle Dark / Light Mode with instant sync to document, localStorage, and cookie
  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark'
    updateAppearance(nextMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextMode)
    }
  }

  // Authoritative check against backend SQLite database session
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'same-origin',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user)
          // Keep local storage in sync with authoritative database user
          if (typeof window !== 'undefined') {
            localStorage.setItem('demo_user', JSON.stringify(data.user))
            localStorage.setItem('mentor_user_role', data.user.role)
          }
          return
        }
      }
      // Check stored session fallback if available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('demo_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed && (parsed.id || parsed.email)) {
              setUser(parsed)
              return
            }
          } catch {}
        }
      }
      setUser(null)
    } catch (err) {
      console.error('Navbar auth verification failed:', err)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('demo_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed && (parsed.id || parsed.email)) {
              setUser(parsed)
              return
            }
          } catch {}
        }
      }
      setUser(null)
    }
  }

  useEffect(() => {
    // 1. Optimistic instant restore from localStorage to avoid delay / layout flicker
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed && (parsed.id || parsed.email)) {
            setUser(parsed)
          }
        } catch {}
      }
    }

    // 2. Fetch fresh database session verification
    checkAuth()
    window.addEventListener('mentor_user_state_changed', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('mentor_user_state_changed', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Logout functionally with database session clearing
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user')
      localStorage.removeItem('mentor_user_role')
      localStorage.removeItem('dashboard_role')
      document.cookie = 'mentor_session=; path=/; max-age=0'
      document.cookie = 'demo_user=; path=/; max-age=0'
      document.cookie = 'dashboard_role=; path=/; max-age=0'
      window.dispatchEvent(new Event('mentor_user_state_changed'))
      window.dispatchEvent(new Event('storage'))
    }

    setUser(null)
    setUserDropdownOpen(false)
    toast.success('Logged out successfully')
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'For Business', href: '/for-business' },
    { label: 'Instructors', href: '/instructors' },
    { label: 'Blog', href: '/blogs' },
  ]

  const dashboardHref =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'instructor'
      ? '/instructor/dashboard'
      : '/student/dashboard'

  const myCoursesHref =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'instructor'
      ? '/instructor/dashboard'
      : '/student/courses'

  return (
    <header className="w-full bg-[#EBE7FA] dark:bg-slate-950 pt-4 sm:pt-6 pb-2 transition-colors print:hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 sm:h-[68px] w-full items-center justify-between rounded-full bg-white dark:bg-slate-900 px-5 sm:px-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/70 dark:border-slate-800 transition-colors">
          
          {/* Brand Logo: Mentor with stylized electric lime play circle for 'o' */}
          <Link href="/" className="flex items-center gap-0.5 select-none transition-transform hover:scale-[1.02]">
            <span className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
              Ment
            </span>
            <span className="mx-0.5 inline-flex size-[20px] sm:size-[21px] items-center justify-center rounded-full bg-[#D8FC38] text-slate-950 shadow-xs">
              <svg className="size-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </span>
            <span className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
              r
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative text-sm sm:text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'text-slate-950 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-[#D8FC38]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Controls: Search Icon, Dark/Light Switch, User Profile / Sign in */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon with quick flyout */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search courses"
                className="flex size-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Search className="size-[19px]" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-white dark:bg-slate-900 p-2.5 shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (searchQuery.trim()) {
                        window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2"
                  >
                    <Search className="size-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Switch Icon */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex size-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="size-[19px] text-[#D8FC38] transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="size-[19px] transition-transform duration-300 -rotate-12 hover:rotate-0" />
              )}
            </button>

            {/* User State: Logged-in Profile Menu OR Sign In Pill Button */}
            {user ? (
              /* LOGGED IN USER PROFILE DROPDOWN (No Login/Signup buttons shown) */
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-1.5 pr-3 py-1 hover:border-[#D8FC38] dark:hover:border-[#D8FC38] transition-all cursor-pointer shadow-2xs select-none"
                >
                  <div className="relative size-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200 shrink-0">
                    {user.photo ? (
                      <Image
                        src={user.photo}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                        user.role === 'admin'
                          ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                          : user.role === 'instructor'
                          ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                          : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-slate-900 dark:text-white' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="size-4 text-slate-500" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href={myCoursesHref}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      <GraduationCap className="size-4 text-slate-500" />
                      <span>My Courses</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="size-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* NOT LOGGED IN: Single "Sign in ->" Pill Button (Log in link & separator removed) */
              <Link
                href={loginHref}
                className="group inline-flex items-center gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 text-sm sm:text-[15px] font-semibold px-5 sm:px-6 py-2 sm:py-2.5 transition-all shadow-xs active:scale-95 cursor-pointer ml-1"
              >
                <span>Sign in</span>
                <ArrowRight className="size-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex size-9 items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Responsiveness */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2.5 rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 animate-in fade-in duration-200">
            {/* User Info Header in Mobile if Logged In */}
            {user ? (
              <div className="p-3 mb-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-200 shrink-0">
                    {user.photo ? (
                      <Image src={user.photo} alt={user.name} fill className="object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-[#D8FC38] px-3.5 py-1 text-xs font-bold text-slate-950 shadow-xs"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="mb-2">
                <Link
                  href={loginHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold py-2.5 text-sm shadow-xs"
                >
                  <span>Sign in</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </div>
            )}

            {navLinks.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm sm:text-base font-medium py-2.5 px-3.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#D8FC38]/20 text-slate-950 dark:text-white font-semibold border-l-3 border-[#D8FC38]'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2 text-xs font-bold text-red-600 py-2 px-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
              >
                <LogOut className="size-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
