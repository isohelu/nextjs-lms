'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  UserCircle,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  name?: string
  photo?: string
  role?: 'admin' | 'instructor' | 'student'
}

interface ProfileToggleProps {
  user?: UserProfile | null
  onLogout?: () => void
}

const studentMenuItems = [
  { id: 'courses', name: 'My Courses', slug: 'courses', Icon: GraduationCap },
  { id: 'wishlist', name: 'Wishlist', slug: 'wishlist', Icon: Heart },
  { id: 'profile', name: 'My Profile', slug: 'profile', Icon: UserCircle },
  { id: 'settings', name: 'Settings', slug: 'settings', Icon: SettingsIcon },
]

export default function ProfileToggle({
  user,
  onLogout,
}: ProfileToggleProps) {
  const router = useRouter()
  const supabase = createClient()

  // Default fallback user if authenticated
  const currentUser: UserProfile = user || {
    name: 'Student User',
    role: 'student',
    photo: '',
  }

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
    if (onLogout) {
      onLogout()
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer outline-none">
        {currentUser && currentUser.photo ? (
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={currentUser.photo}
              alt={currentUser.name ?? ''}
              className="h-full w-full content-center object-cover"
            />
            <AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        ) : (
          <UserCircle className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground transition-colors" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-42.5">
        {(currentUser.role === 'admin' || currentUser.role === 'instructor') && (
          <DropdownMenuItem asChild className="cursor-pointer px-3 font-medium">
            <Link href="/dashboard" className="flex items-center">
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        {(currentUser.role === 'student' || currentUser.role === 'instructor') && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer px-3">
              <Link href="/student/courses" className="flex items-center">
                <GraduationCap className="mr-1.5 h-4 w-4" />
                <span>My Courses</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-3">
              <Link href="/student/wishlist" className="flex items-center">
                <Heart className="mr-1.5 h-4 w-4" />
                <span>Wishlist</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-3">
              <Link href="/student/profile" className="flex items-center">
                <UserCircle className="mr-1.5 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-3">
              <Link href="/student/settings" className="flex items-center">
                <SettingsIcon className="mr-1.5 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          className="cursor-pointer px-3 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
