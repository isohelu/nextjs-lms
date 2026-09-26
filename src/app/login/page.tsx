'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getDemoUser, DEMO_PASSWORD, DEMO_USERS } from '@/lib/auth/demo-users'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirect')

      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (data.redirect) {
        router.push(data.redirect)
      } else if (role === 'admin') {
        router.push('/admin/dashboard')
      } else if (role === 'instructor') {
        router.push('/instructor/dashboard')
      } else {
        router.push('/student/dashboard')
      }
      router.refresh()
    } catch {
      setErrorMsg('Failed to connect to authentication service. Please check your network.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back!"
      description="Continue your learning journey."
      headline="Welcome back!"
      subtitle="Continue your learning journey."
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
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setErrorMsg('Google SSO is in development mode. Please sign in with email/password or use the instant demo accounts below.')
            }}
          >
            Continue with Google
          </Button>

          {/* Quick Demo Credentials Panel */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground tracking-wide">
                Demo Accounts
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Password: {DEMO_PASSWORD}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@mentor.test')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/80 bg-background hover:border-primary/50 hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <span className="text-xs font-semibold text-foreground group-hover:text-primary">Admin</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">admin@mentor.test</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('instructor@mentor.test')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/80 bg-background hover:border-primary/50 hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <span className="text-xs font-semibold text-foreground group-hover:text-primary">Instructor</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">instructor@mentor.test</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('student@mentor.test')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/80 bg-background hover:border-primary/50 hover:bg-muted/50 transition-colors text-center cursor-pointer group"
              >
                <span className="text-xs font-semibold text-foreground group-hover:text-primary">Student</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">student@mentor.test</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-x-2 text-sm text-center md:text-left">
          <span className="text-muted-foreground">Don&apos;t have an account?</span>
          <Link href="/register" className="underline underline-offset-4 text-primary font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
