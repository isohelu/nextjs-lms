'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  ChevronDown,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
  UserCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppearance } from '@/hooks/use-appearance'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: number | string
  title: string
  href?: string
  value?: string
  type: 'url' | 'dropdown'
  active?: boolean
  items?: { title: string; url: string }[]
}

interface MobileMenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  navItems: NavItem[]
  language?: boolean
}

const menuItemClass =
  'bg-muted w-full text-left justify-start text-sm font-normal'

export default function MobileMenuDrawer({
  open,
  onOpenChange,
  navItems,
  language = true,
}: MobileMenuDrawerProps) {
  const router = useRouter()
  const { appearance, updateAppearance } = useAppearance()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'student'>('student')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsLoggedIn(true)
        setUserRole(data.user.user_metadata?.role || 'student')
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('demo_user')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setIsLoggedIn(true)
            setUserRole(parsed.role || 'student')
          } catch {
            setIsLoggedIn(false)
          }
        }
      }
    })
  }, [supabase])

  const close = () => onOpenChange(false)

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user')
      document.cookie = 'demo_user=; path=/; max-age=0'
    }
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    close()
    router.push('/login')
    router.refresh()
  }

  const renderNavItems = (item: NavItem) => {
    switch (item.type) {
      case 'url':
        return (
          <Link
            key={item.id}
            href={item.value || item.href || ''}
            onClick={close}
            className="py-1.5 text-sm font-normal text-foreground hover:text-primary transition-colors"
          >
            {item.title}
          </Link>
        )

      case 'dropdown':
        return (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger className={menuItemClass}>
              <span className="flex items-center justify-between w-full">
                {item.title}
                <ChevronDown className="h-4 w-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-20">
              {item.items &&
                item.items.map((subItem, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    asChild
                    className="cursor-pointer px-5"
                  >
                    <Link href={subItem.url || ''} onClick={close}>
                      {subItem.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )

      default:
        return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-65 flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle className="text-base font-semibold text-foreground">Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-57px)] flex-1 px-6">
          <div className="flex flex-col gap-2 py-2">
            {navItems.map((item) => (
              <Fragment key={item.id}>{renderNavItems(item)}</Fragment>
            ))}

            <Separator className="my-2" />

            {/* Notification */}
            {isLoggedIn && (
              <Link href="/notifications" onClick={close}>
                <Button
                  variant="ghost"
                  className={cn(
                    'flex flex-row items-center gap-2',
                    menuItemClass
                  )}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
              </Link>
            )}

            {/* Profile items if logged in */}
            {isLoggedIn && (
              <>
                {(userRole === 'admin' || userRole === 'instructor') && (
                  <Button
                    type="button"
                    variant="ghost"
                    className={menuItemClass}
                    onClick={() => {
                      router.push('/dashboard')
                      close()
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className={menuItemClass}
                  onClick={() => {
                    router.push('/student?tab=courses')
                    close()
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  My Courses
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={menuItemClass}
                  onClick={() => {
                    router.push('/student?tab=wishlist')
                    close()
                  }}
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={menuItemClass}
                  onClick={() => {
                    router.push('/student?tab=profile')
                    close()
                  }}
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={menuItemClass}
                  onClick={() => {
                    router.push('/student?tab=settings')
                    close()
                  }}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={menuItemClass}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
                <Separator className="my-2" />
              </>
            )}

            {/* Theme switcher */}
            {(
              [
                { value: 'light' as const, label: 'Light', Icon: Sun },
                { value: 'dark' as const, label: 'Dark', Icon: Moon },
                { value: 'system' as const, label: 'System', Icon: Monitor },
              ] as const
            ).map(({ value, label, Icon }) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                className={cn(menuItemClass, 'justify-between')}
                onClick={() => {
                  updateAppearance(value)
                  close()
                }}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                {appearance === value && <Check className="h-4 w-4" />}
              </Button>
            ))}

            <Separator className="my-2" />

            {!isLoggedIn && (
              <div className="space-y-2 border-t border-border pt-4 pb-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-sm shadow-none"
                >
                  <Link href="/register" onClick={close}>
                    Sign up
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full rounded-sm shadow-none"
                >
                  <Link href="/login" onClick={close}>
                    Log in
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
