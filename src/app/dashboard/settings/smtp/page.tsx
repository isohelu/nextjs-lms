'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import LoadingButton from '@/components/loading-button'
import { CheckCircle2, Mail } from 'lucide-react'

export default function SmtpSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [fields, setFields] = useState({
    mail_mailer: 'smtp',
    mail_host: 'smtp.mailgun.org',
    mail_port: '587',
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    mail_from_address: 'no-reply@mentorlms.com',
    mail_from_name: 'Mentor LMS Notifications',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/smtp')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({
              ...prev,
              ...data.settings,
              mail_port: String(data.settings.mail_port || '587'),
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching SMTP settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('SMTP mail server settings saved successfully.')
      } else {
        alert(data.message || 'Failed to save SMTP settings.')
      }
    } catch {
      alert('Error updating SMTP configuration.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="SMTP Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'SMTP Settings' },
          ]}
          className="mb-4"
        />

        <div className="md:px-3">
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Card className="p-4 sm:p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label>Mail Driver *</Label>
                  <Select
                    value={fields.mail_mailer}
                    onValueChange={(val) => setFields({ ...fields, mail_mailer: val })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select mail driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>SMTP Host *</Label>
                  <Input
                    value={fields.mail_host}
                    onChange={(e) => setFields({ ...fields, mail_host: e.target.value })}
                    placeholder="smtp.mailgun.org"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>SMTP Port *</Label>
                  <Input
                    value={fields.mail_port}
                    onChange={(e) => setFields({ ...fields, mail_port: e.target.value })}
                    placeholder="587"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>SMTP Encryption</Label>
                  <Select
                    value={fields.mail_encryption}
                    onValueChange={(val) => setFields({ ...fields, mail_encryption: val })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>SMTP Username *</Label>
                  <Input
                    value={fields.mail_username}
                    onChange={(e) => setFields({ ...fields, mail_username: e.target.value })}
                    placeholder="postmaster@yourdomain.com"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>SMTP Password *</Label>
                  <Input
                    type="password"
                    value={fields.mail_password}
                    onChange={(e) => setFields({ ...fields, mail_password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>From Email Address *</Label>
                  <Input
                    type="email"
                    value={fields.mail_from_address}
                    onChange={(e) => setFields({ ...fields, mail_from_address: e.target.value })}
                    placeholder="no-reply@yourdomain.com"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>Sender Display Name *</Label>
                  <Input
                    value={fields.mail_from_name}
                    onChange={(e) => setFields({ ...fields, mail_from_name: e.target.value })}
                    placeholder="Mentor LMS Notifications"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <LoadingButton loading={saving} type="submit">
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
