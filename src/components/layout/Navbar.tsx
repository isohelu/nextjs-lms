'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Bell,
  ShoppingCart,
  Globe,
  User,
  ChevronDown,
} from 'lucide-react'
import AppLogo from '@/components/common/AppLogo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const navItems = [
  { id: 1, title: 'Courses', href: '/courses/all' },
  { id: 2, title: 'Exams', href: '/exams/all' },
  { id: 3, title: 'Store', href: '/products' },
  { id: 4, title: 'About Us', href: '/about-us' },
  { id: 5, title: 'Our Team', href: '/our-team' },
  { id: 6, title: 'Careers', href: '/careers' },
  { id: 7, title: 'Blogs', href: '/blogs/all' },
]

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <>
      <header className="fixed top-0 z-30 w-full transition-all duration-300">
        <div
          className={cn(
            'container mt-0 flex h-[72px] items-center justify-between gap-1 !px-4 transition-all duration-200 md:gap-6',
            isSticky &&
              'mx-auto mt-4 h-16 w-full rounded-2xl bg-background/95 shadow-card backdrop-blur md:!max-w-6xl'
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden gap-5 md:flex md:items-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-secondary-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notification */}
            <Button
              size="icon"
              variant="ghost"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>

            {/* Cart */}
            <Button
              size="icon"
              variant="ghost"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>

            {/* Language Selector */}
            <div className="hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
              <Globe className="h-3.5 w-3.5" />
              <span>EN</span>
            </div>

            {/* Login / Auth Button */}
            <Button
              asChild
              variant="outline"
              className="hidden border-border font-medium hover:border-primary sm:flex"
            >
              <Link href="/auth">Log in</Link>
            </Button>

            <Button
              asChild
              className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:flex"
            >
              <Link href="/auth">Sign up</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              size="icon"
              variant="secondary"
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="border-b border-border bg-background px-4 py-3 shadow-sm">
            <div className="container mx-auto flex max-w-4xl items-center gap-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, mentors, certifications, and skills..."
                className="w-full bg-transparent text-sm focus:outline-none"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Height Spacer matching Laravel */}
      <div className="relative z-20 h-[72px] bg-transparent" />

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <AppLogo />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="mt-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-medium text-foreground transition-colors hover:text-secondary-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild className="w-full bg-primary text-primary-foreground">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
