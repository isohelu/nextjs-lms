'use client'

import React, { useState } from 'react'
import InputError from '@/components/input-error'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoadingButton from '@/components/loading-button'

interface Props {
  currentEmail?: string
}

const ChangeEmail = ({ currentEmail = 'instructor@mentorlms.com' }: Props) => {
  const [newEmail, setNewEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail, newEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'Verification link sent to your new email address.')
      } else {
        setError(data.message || 'Failed to request email change.')
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
        <p className="text-lg font-bold">Change Email</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {success && (
          <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
            {success}
          </div>
        )}
        <div>
          <Label>Current Email</Label>
          <Input
            required
            readOnly
            type="email"
            name="current_email"
            defaultValue={currentEmail}
            className="mt-1 bg-muted cursor-not-allowed"
          />
        </div>

        <div>
          <Label>New Email</Label>
          <Input
            required
            type="email"
            name="new_email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
            className="mt-1"
          />
          {error && <InputError message={error} className="mt-2" />}
        </div>

        <div className="flex justify-end">
          <LoadingButton loading={processing}>
            Get Email Change Link
          </LoadingButton>
        </div>
      </form>
    </Card>
  )
}

export default ChangeEmail
