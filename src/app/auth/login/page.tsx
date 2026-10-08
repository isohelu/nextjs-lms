'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, GraduationCap, User } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DEMO_PASSWORD } from '@/lib/auth/demo-users'

export default function AuthLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [redirectParam, setRedirectParam] = useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('redirect')
      if (r) setRedirectParam(r)
    }
  }, [])

  const fillDemoCredentials = (roleEmail: string) => {
    setEmail(roleEmail)
    setPassword(DEMO_PASSWORD)
    setErrorMsg(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      const role = data.user?.role || 'student'
      if (typeof window !== 'undefined') {
        localStorage.setItem('mentor_user_role', role)
        localStorage.setItem('dashboard_role', role)
        if (data.user) {
          localStorage.setItem('demo_user', JSON.stringify(data.user))
        }
        window.dispatchEvent(new Event('mentor_user_state_changed'))
        window.dispatchEvent(new Event('storage'))
      }

      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirect')

      let targetUrl = (data && data.redirect) || (role === 'admin' ? '/admin/dashboard' : role === 'instructor' ? '/instructor/dashboard' : '/student')
      if (
        redirectUrl &&
        redirectUrl !== '/' &&
        redirectUrl !== '/auth/login' &&
        redirectUrl !== '/login' &&
        redirectUrl !== '/register' &&
        redirectUrl !== '/auth'
      ) {
        targetUrl = redirectUrl
      }

      // Hard navigation ensures fresh session cookies are loaded into all server/client components
      window.location.href = targetUrl
    } catch {
      setErrorMsg('Failed to connect to authentication service. Please check your network.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to your LMS account"
      description="Continue your learning or management journey."
      headline="Welcome back!"
      subtitle="Sign in to access your courses, teaching dashboard, or administration portal."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm text-primary hover:underline"
                tabIndex={5}
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              name="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(!!checked)}
              tabIndex={3}
            />
            <Label htmlFor="remember" className="mb-0 text-sm font-normal text-muted-foreground">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground text-xs">
              Instant Demo Access
            </span>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-foreground tracking-wide">
                  Instant Demo Accounts
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono bg-background/80 px-2.5 py-1 rounded-lg border border-border">
                Password: <strong className="text-foreground">{DEMO_PASSWORD}</strong>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Click any role below to auto-fill credentials and sign in immediately:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  fillDemoCredentials('admin@mentor.test')
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer text-center ${
                  email === 'admin@mentor.test' || email === 'admin@admin.com'
                    ? 'border-[#D8FC38] bg-[#D8FC38]/15 ring-2 ring-[#D8FC38]/30'
                    : 'border-border bg-background hover:border-[#D8FC38]/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Shield className="size-3.5 text-foreground" />
                  <span>Admin</span>
                </span>
                <span className="text-xs text-muted-foreground truncate w-full mt-0.5">admin@mentor.test</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  fillDemoCredentials('instructor@mentor.test')
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                  email === 'instructor@mentor.test'
                    ? 'border-[#D8FC38] bg-[#D8FC38]/15 ring-2 ring-[#D8FC38]/30'
                    : 'border-border bg-background hover:border-[#D8FC38]/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-foreground" />
                  <span>Instructor</span>
                </span>
                <span className="text-xs text-muted-foreground truncate w-full mt-0.5">instructor@mentor.test</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  fillDemoCredentials('student@mentor.test')
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                  email === 'student@mentor.test'
                    ? 'border-[#D8FC38] bg-[#D8FC38]/15 ring-2 ring-[#D8FC38]/30'
                    : 'border-border bg-background hover:border-[#D8FC38]/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-foreground" />
                  <span>Student</span>
                </span>
                <span className="text-xs text-muted-foreground truncate w-full mt-0.5">student@mentor.test</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-x-2 text-sm text-center md:text-left">
          <span className="text-muted-foreground">Don&apos;t have an account?</span>
          <Link
            href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
            className="underline underline-offset-4 text-foreground font-semibold"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
