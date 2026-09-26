'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Appearance from '@/components/common/Appearance'
import Language from '@/components/common/Language'
import ProfileToggle from '@/components/common/ProfileToggle'
import Notification from '@/components/common/Notification'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  language?: boolean
}

export default function Actions({ language = true }: ActionsProps) {
  const [user, setUser] = useState<{ id?: number; name?: string; photo?: string; role?: 'admin' | 'instructor' | 'student' } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
      document.cookie = 'demo_user=; path=/; max-age=0'
      document.cookie = 'lms_session=; path=/; max-age=0'
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
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/register">Sign up</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
