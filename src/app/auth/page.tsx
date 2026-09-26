'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      const role = data.user?.role || 'student'
      if (role === 'admin' || role === 'instructor') {
        router.push('/dashboard')
      } else {
        router.push('/student/courses')
      }
      router.refresh()
    } catch {
      setErrorMsg('Failed to sign in. Please verify your connection.')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role: 'student' }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Registration failed.')
        setLoading(false)
        return
      }

      setSuccessMsg('Account created successfully! Redirecting...')
      setTimeout(() => {
        router.push('/student')
        router.refresh()
      }, 1000)
    } catch {
      setErrorMsg('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  // Quick Demo Student sign in
  const handleDemoSignIn = async () => {
    setLoading(true)
    setErrorMsg(null)
    const demoEmail = 'student@mentorlms.com'
    const demoPass = 'Password123!'

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/student')
        router.refresh()
      } else {
        setErrorMsg(data.message || 'Demo sign in unavailable.')
      }
    } catch {
      setErrorMsg('Failed to connect to demo account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl p-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-linear-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/30 mb-2">
            <Sparkles className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">
            Mentor<span className="text-indigo-500">LMS</span> Account
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in to track course completion, earn certificates, and join live mentorship.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="py-2 text-xs border-emerald-500/40 text-emerald-400 bg-emerald-950/20">
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
              <TabsTrigger value="signin" className="rounded-lg text-xs font-semibold">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-xs font-semibold">
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="alex@enterprise.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-2"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="alex@enterprise.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs mt-2"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full rounded-xl border-border/80 hover:bg-accent text-xs font-semibold"
          >
            <ShieldCheck className="size-4 mr-2 text-emerald-400" />
            Sign in as Demo Student
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading authentication...</div>}>
      <AuthForm />
    </Suspense>
  )
}
