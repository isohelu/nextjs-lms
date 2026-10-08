'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import LoadingButton from '@/components/loading-button'
import { CheckCircle2, Shield } from 'lucide-react'

export default function AuthSettingsPage() {
  const [activeTab, setActiveTab] = useState<'google' | 'recaptcha'>('google')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [googleFields, setGoogleFields] = useState({
    active: true,
    client_id: '',
    client_secret: '',
    redirect: 'http://localhost:3000/api/auth/callback/google',
  })

  const [recaptchaFields, setRecaptchaFields] = useState({
    active: false,
    site_key: '',
    secret_key: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/auth')
        if (res.ok) {
          const data = await res.json()
          if (data.google) {
            setGoogleFields(prev => ({ ...prev, ...data.google }))
          }
          if (data.recaptcha) {
            setRecaptchaFields(prev => ({ ...prev, ...data.recaptcha }))
          }
        }
      } catch (err) {
        console.error('Error fetching Auth settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSaveGoogle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/admin/settings/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_type: 'google',
          fields: googleFields,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Google OAuth settings saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch {
      alert('Error updating Google OAuth settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  const handleSaveRecaptcha = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/admin/settings/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_type: 'recaptcha',
          fields: recaptchaFields,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Google reCAPTCHA settings saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch {
      alert('Error updating reCAPTCHA settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Authentication Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Authentication Settings' },
          ]}
          className="mb-4"
        />

        {successMessage && (
          <div className="md:px-3">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'google' | 'recaptcha')}
          className="grid grid-rows-1 gap-5 md:grid-cols-4 md:px-3"
        >
          <div>
            <TabsList className="horizontal-tabs-list">
              <TabsTrigger
                value="google"
                className="horizontal-tabs-trigger"
              >
                Google Auth
              </TabsTrigger>
              <TabsTrigger
                value="recaptcha"
                className="horizontal-tabs-trigger"
              >
                Google Recaptcha
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="md:col-span-3">
            {/* Google Auth Tab */}
            <TabsContent value="google" className="m-0">
              <Card className="p-4 sm:p-6">
                <form onSubmit={handleSaveGoogle} className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold">Google Auth</h2>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor="google-status" className="mb-0 text-xs cursor-pointer">
                        {googleFields.active ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id="google-status"
                        checked={googleFields.active}
                        onCheckedChange={(checked) =>
                          setGoogleFields(prev => ({ ...prev, active: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label>Google Client ID</Label>
                      <Input
                        value={googleFields.client_id}
                        onChange={(e) =>
                          setGoogleFields(prev => ({ ...prev, client_id: e.target.value }))
                        }
                        placeholder="Enter Google Client ID"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Google Client Secret</Label>
                      <Input
                        type="password"
                        value={googleFields.client_secret}
                        onChange={(e) =>
                          setGoogleFields(prev => ({ ...prev, client_secret: e.target.value }))
                        }
                        placeholder="Enter Google Client Secret"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Google Redirect URI</Label>
                      <Input
                        value={googleFields.redirect}
                        onChange={(e) =>
                          setGoogleFields(prev => ({ ...prev, redirect: e.target.value }))
                        }
                        placeholder="http://localhost:3000/api/auth/callback/google"
                        className="mt-1 font-mono text-xs"
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
            </TabsContent>

            {/* reCAPTCHA Tab */}
            <TabsContent value="recaptcha" className="m-0">
              <Card className="p-4 sm:p-6">
                <form onSubmit={handleSaveRecaptcha} className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold">ReCaptcha Settings</h2>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor="recaptcha-status" className="mb-0 text-xs cursor-pointer">
                        {recaptchaFields.active ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id="recaptcha-status"
                        checked={recaptchaFields.active}
                        onCheckedChange={(checked) =>
                          setRecaptchaFields(prev => ({ ...prev, active: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label>Site Key</Label>
                      <Input
                        value={recaptchaFields.site_key}
                        onChange={(e) =>
                          setRecaptchaFields(prev => ({ ...prev, site_key: e.target.value }))
                        }
                        placeholder="Site Key"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        value={recaptchaFields.secret_key}
                        onChange={(e) =>
                          setRecaptchaFields(prev => ({ ...prev, secret_key: e.target.value }))
                        }
                        placeholder="Secret Key"
                        className="mt-1"
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
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
