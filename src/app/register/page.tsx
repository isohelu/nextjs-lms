'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role: 'student'
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Registration failed. Please verify your details.')
        setLoading(false)
        return
      }

      router.push(data.redirect || '/student?tab=courses')
      router.refresh()
    } catch {
      setErrorMsg('Failed to connect to registration service. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start learning today."
      headline="Start learning today"
      subtitle="Join thousands of students worldwide."
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-6">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              tabIndex={3}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              tabIndex={4}
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
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
              setErrorMsg('Google registration is in development mode. Please register with your email and password.')
            }}
          >
            Continue with Google
          </Button>
        </div>

        <div className="space-x-2 text-sm text-center md:text-left">
          <span className="text-muted-foreground">Already have an account?</span>
          <Link href="/login" className="underline underline-offset-4 text-primary font-medium">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
