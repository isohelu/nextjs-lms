'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    setResendSuccess(false)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResendSuccess(true)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify Your Email Address"
      description="We sent a verification link to your registered email address. Please click the link to activate your account."
      headline="Almost There!"
      subtitle="Verifying your email ensures secure access to your enrolled courses, certificates, and student forum."
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-8 w-8" />
        </div>

        {resendSuccess && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>A new verification link has been dispatched to your email.</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={isResending}
            className="w-full h-11 rounded-xl font-semibold shadow-md gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Resending...' : 'Resend Verification Email'}
          </Button>

          <Button asChild variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href="/auth">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
