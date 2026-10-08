'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Compass, LayoutDashboard, LogIn, LogOut, Menu, X, Sparkles } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ email: user.email, id: user.id })
      } else {
        setUser(null)
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email, id: session.user.id })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: 'Courses', href: '/', icon: BookOpen },
    { label: 'Explore', href: '/#catalog', icon: Compass },
    { label: 'My Learning', href: '/dashboard', icon: LayoutDashboard },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-[#D8FC38] border border-slate-800 shadow-xs">
            <Sparkles className="size-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              Mentor<span className="text-slate-900 dark:text-slate-100 font-bold">LMS</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D8FC38]/20 text-slate-950 dark:text-[#D8FC38] border border-[#D8FC38]/40">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  isActive
                    ? 'text-slate-950 dark:text-white bg-[#D8FC38]/15 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side auth & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <Avatar className="size-9 border border-border/60 ring-2 ring-[#D8FC38]/40">
                  <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                  <AvatarFallback className="bg-slate-950 text-[#D8FC38] text-xs uppercase font-bold">
                    {user.email?.slice(0, 2) || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground max-w-30 truncate">
                  {user.email?.split('@')[0]}
                </span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-xs font-semibold rounded-xl border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="size-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-semibold rounded-xl">
                  <LogIn className="size-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full justify-start rounded-xl">
                <LogOut className="size-4 mr-2" />
                Sign Out ({user.email?.split('@')[0]})
              </Button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold rounded-xl">Sign In / Register</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
