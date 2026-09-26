'use client'

import React, { useState } from 'react'
import InputError from '@/components/input-error'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoadingButton from '@/components/loading-button'

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setError('New passwords do not match.')
      return
    }
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'Password changed successfully.')
        setCurrentPassword('')
        setPassword('')
        setPasswordConfirmation('')
      } else {
        setError(data.message || 'Failed to change password.')
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
        <p className="text-lg font-bold">Change Password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {success && (
          <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
            {success}
          </div>
        )}
        {error && <InputError message={error} />}

        <div>
          <Label>Current Password</Label>
          <Input
            required
            type="password"
            name="current_password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="mt-1"
          />
        </div>

        <div>
          <Label>New Password</Label>
          <Input
            required
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Confirm New Password</Label>
          <Input
            required
            type="password"
            name="password_confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Confirm new password"
            className="mt-1"
          />
        </div>

        <div className="flex justify-end">
          <LoadingButton loading={processing}>
            Change Password
          </LoadingButton>
        </div>
      </form>
    </Card>
  )
}

export default ChangePassword
