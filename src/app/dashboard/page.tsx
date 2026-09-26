'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboardView from '@/components/dashboard/AdminDashboardView'
import InstructorDashboardView from '@/components/dashboard/InstructorDashboardView'
import { Loader2 } from 'lucide-react'

export default function RoleAwareDashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<'admin' | 'instructor' | 'student' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const qRole = params.get('role')
          if (qRole === 'instructor' || qRole === 'admin') {
            setRole(qRole)
            setLoading(false)
            return
          }
        }

        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!data.user) {
          router.replace('/login')
          return
        }

        const userRole = data.user.role || 'student'
        if (userRole === 'admin' || userRole === 'instructor') {
          setRole(userRole)
        } else {
          router.replace('/student/dashboard')
        }
      } catch {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#007867]" />
          <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (role === 'admin') {
    return <AdminDashboardView />
  }

  if (role === 'instructor') {
    return <InstructorDashboardView />
  }

  return null
}
