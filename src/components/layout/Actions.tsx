'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import Appearance from '@/components/common/Appearance'
import Language from '@/components/common/Language'
import ProfileToggle from '@/components/common/ProfileToggle'
import Notification from '@/components/common/Notification'

interface ActionsProps {
  language?: boolean
}

export default function Actions({ language = true }: ActionsProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ id?: number; name?: string; photo?: string; role?: 'admin' | 'instructor' | 'student' } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/auth')
  const loginHref = pathname && pathname !== '/' && !isAuthPage
    ? `/login?redirect=${encodeURIComponent(pathname)}`
    : '/login'

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data && data.user) {
          setIsLoggedIn(true)
          setUser({
            id: data.user.id,
            name: data.user.name,
            photo: data.user.photo || '',
            role: data.user.role || 'student',
          })
          return
        }
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setIsLoggedIn(true)
          setUser({
            id: parsed.id,
            name: parsed.name,
            photo: parsed.avatar || '',
            role: parsed.role || 'student',
          })
          return
        } catch {
          // ignore
        }
      }
    }

    setIsLoggedIn(false)
    setUser(null)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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
      window.location.assign('/login')
    }
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <div className="flex items-center gap-2">
        <Appearance />
        {language && <Language />}
      </div>

      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <Notification />
          <ProfileToggle user={user} onLogout={handleLogout} />
        </div>
      ) : (
        /* Single Iconic User Account Action matching Pinterest Reference */
        <Link
          href={loginHref}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-accent hover:border-foreground/30 hover:shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <User className="size-4 text-muted-foreground" />
          <span>Sign In</span>
        </Link>
      )}
    </div>
  )
}
