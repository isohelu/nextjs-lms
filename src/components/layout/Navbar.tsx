'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import AppLogo from '@/components/common/AppLogo'
import { Button } from '@/components/ui/button'
import Appearance from '@/components/common/Appearance'
import Language from '@/components/common/Language'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: number
  title: string
  href?: string
  value?: string
  type: 'url' | 'dropdown'
  active?: boolean
  items?: { title: string; url: string }[]
}

export const navItems: NavItem[] = [
  { id: 1, title: 'Courses', href: '/courses/all', value: '/courses/all', type: 'url', active: true },
  { id: 2, title: 'Exams', href: '/exams/all', value: '/exams/all', type: 'url', active: true },
  { id: 3, title: 'Store', href: '/products', value: '/products', type: 'url', active: true },
  { id: 4, title: 'About Us', href: '/about-us', value: '/about-us', type: 'url', active: true },
  { id: 5, title: 'Our Team', href: '/our-team', value: '/our-team', type: 'url', active: true },
  { id: 6, title: 'Careers', href: '/careers', value: '/careers', type: 'url', active: true },
  { id: 7, title: 'Blogs', href: '/blogs/all', value: '/blogs/all', type: 'url', active: true },
]

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderNavItems = (item: NavItem) => {
    if (item.type === 'url') {
      return (
        <Link
          key={item.id}
          href={item.value || item.href || ''}
          className="text-sm font-normal"
        >
          {item.title}
        </Link>
      )
    }

    if (item.type === 'dropdown') {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-normal">
            {item.title}
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-20">
            {item.items?.map((subItem, idx) => (
              <DropdownMenuItem
                key={idx}
                asChild
                className="cursor-pointer px-5"
              >
                <Link href={subItem.url}>{subItem.title}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return null
  }

  return (
    <>
      <div className="fixed top-0 z-30 w-full">
        <div
          className={cn(
            'container mt-0 flex h-[72px] items-center justify-between gap-1 !px-4 transition-all duration-200 md:gap-6',
            isSticky &&
              'mx-auto mt-4 h-16 w-full rounded-2xl bg-background shadow-card md:!max-w-6xl'
          )}
        >
          <Link href="/">
            <AppLogo />
          </Link>

          <div className="hidden gap-4 md:flex md:items-center">
            {navItems.map((item) => (
              <Fragment key={item.id}>{renderNavItems(item)}</Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2">
                <Appearance />
                <Language />
              </div>

              <div className="space-x-2">
                <Button asChild variant="outline">
                  <Link href="/register">Sign up</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>

            <Button
              size="icon"
              variant="secondary"
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

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
                <span className="text-xl">×</span>
              </Button>
            </div>

            <nav className="mt-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.value || item.href || ''}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-normal text-foreground transition-colors hover:text-secondary-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border">
              <div className="flex items-center justify-around py-2">
                <Appearance />
                <Language />
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Sign up
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
