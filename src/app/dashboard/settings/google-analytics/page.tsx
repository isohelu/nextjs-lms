'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import LoadingButton from '@/components/loading-button'
import { CheckCircle2 } from 'lucide-react'

export default function GoogleAnalyticsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [mpEnabled, setMpEnabled] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [fields, setFields] = useState({
    measurement_id: '',
    api_secret: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/google-analytics')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({ ...prev, ...data.settings }))
            if (data.settings.analytics_enabled !== undefined) {
              setAnalyticsEnabled(Boolean(data.settings.analytics_enabled))
            }
            if (data.settings.mp_enabled !== undefined) {
              setMpEnabled(Boolean(data.settings.mp_enabled))
            }
            if (data.settings.debug_mode !== undefined) {
              setDebugMode(Boolean(data.settings.debug_mode))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Google Analytics settings:', err)
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
      const res = await fetch('/api/admin/settings/google-analytics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          analytics_enabled: analyticsEnabled,
          mp_enabled: mpEnabled,
          debug_mode: debugMode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Google Analytics configuration saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch {
      alert('Error updating Google Analytics configuration.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Google Analytics Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Google Analytics' },
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

        <div className="grid grid-cols-1 gap-6 md:px-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Browser gtag.js */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Enable Google Analytics</Label>
                      <p className="text-xs text-muted-foreground">
                        Tracks page views and engagement using the gtag.js JavaScript library.
                      </p>
                    </div>
                    <Switch
                      checked={analyticsEnabled}
                      onCheckedChange={setAnalyticsEnabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="measurement_id">Measurement ID</Label>
                    <Input
                      id="measurement_id"
                      value={fields.measurement_id}
                      onChange={(e) => setFields({ ...fields, measurement_id: e.target.value })}
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Measurement Protocol */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Enable Measurement Protocol</Label>
                      <p className="text-xs text-muted-foreground">
                        Sends server-side events (e.g. registration, purchase) directly to Google. Optional, more reliable than the browser tag alone.
                      </p>
                    </div>
                    <Switch
                      checked={mpEnabled}
                      onCheckedChange={setMpEnabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="api_secret">Measurement Protocol API Secret</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      value={fields.api_secret}
                      onChange={(e) => setFields({ ...fields, api_secret: e.target.value })}
                      placeholder="Enter your Measurement Protocol API secret"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Debug Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Routes events to Google&apos;s validation endpoint for testing. Turn this off once you&apos;ve confirmed events arrive.
                      </p>
                    </div>
                    <Switch
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
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

          <div className="space-y-6">
            <Card className="space-y-5 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Where to find these</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Measurement ID</h4>
                  <p>
                    analytics.google.com → Admin → Data streams → your web stream → shown as G-XXXXXXXXXX.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">API Secret</h4>
                  <p>
                    Same data stream panel → Measurement Protocol API secrets → Create.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Verifying it works</h4>
                  <p>
                    Reports → Realtime (browser events, seconds) or Admin → DebugView (with Debug Mode on).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
