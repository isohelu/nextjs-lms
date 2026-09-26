'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate sending recovery email
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSuccess(true)
    } catch {
      setError('Failed to send reset instructions. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your registered email address and we'll send you instructions to reset your password."
      headline="Account Recovery"
      subtitle="Don't worry, it happens. We'll help you securely reset your credentials and get right back to learning."
    >
      {isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              We have sent password reset instructions to <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth">Return to Login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl font-semibold shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Instructions...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
