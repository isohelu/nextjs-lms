'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import AppLogo from '@/components/common/AppLogo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Actions from '@/components/layout/Actions'
import MobileMenuDrawer, { NavItem } from '@/components/layout/MobileMenuDrawer'
import { cn } from '@/lib/utils'

interface NavbarProps {
  language?: boolean
  heightCover?: boolean
  customizable?: boolean
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

export default function Navbar({
  language = true,
  heightCover = true,
}: NavbarProps) {
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
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const renderNavItems = (item: NavItem) => {
    if (item.type === 'url') {
      return (
        <Link
          key={item.id}
          href={item.value || item.href || ''}
          className="text-sm font-normal text-foreground hover:text-primary transition-colors"
        >
          {item.title}
        </Link>
      )
    }

    if (item.type === 'dropdown') {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-normal text-foreground hover:text-primary transition-colors">
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
            'container mx-auto max-w-7xl mt-0 flex h-18 w-full items-center justify-between gap-1 px-4! transition-all duration-200 md:gap-6',
            isSticky &&
              'mx-auto mt-4 h-16 w-full rounded-2xl bg-background shadow-card md:max-w-6xl!',
            'max-md:mt-0 max-md:h-18 max-md:rounded-none max-md:w-full max-md:max-w-none',
            isSticky && 'max-md:bg-background max-md:shadow-sm max-md:border-b max-md:border-border/50'
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
            <Actions language={language} />

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

      <MobileMenuDrawer
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        navItems={navItems}
        language={language}
      />

      {heightCover && (
        <div className="relative z-20 h-18 bg-transparent" />
      )}
    </>
  )
}
