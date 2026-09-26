'use client'

import React, { useState } from 'react'
import InputError from '@/components/input-error'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoadingButton from '@/components/loading-button'

interface Props {
  email?: string
}

const ForgetPassword = ({ email = 'instructor@mentorlms.com' }: Props) => {
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'Password reset link sent to your email.')
      } else {
        setError(data.message || 'Failed to send reset link.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="border-none shadow">
      <div className="border-b border-b-border px-7 pt-7 pb-4">
        <p className="text-lg font-bold">Forget Password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {success && (
          <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
            {success}
          </div>
        )}
        {error && <InputError message={error} />}

        <div>
          <Label>Your Email</Label>
          <Input
            required
            readOnly
            type="email"
            name="email"
            defaultValue={email}
            className="mt-1 bg-muted cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end">
          <LoadingButton loading={processing}>
            Get Password Reset Link
          </LoadingButton>
        </div>
      </form>
    </Card>
  )
}

export default ForgetPassword
