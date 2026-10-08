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

export default function MetaPixelSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [pixelEnabled, setPixelEnabled] = useState(false)
  const [capiEnabled, setCapiEnabled] = useState(false)
  const [fields, setFields] = useState({
    pixel_id: '',
    access_token: '',
    test_event_code: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/meta-pixel')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({ ...prev, ...data.settings }))
            if (data.settings.pixel_enabled !== undefined) {
              setPixelEnabled(Boolean(data.settings.pixel_enabled))
            }
            if (data.settings.capi_enabled !== undefined) {
              setCapiEnabled(Boolean(data.settings.capi_enabled))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Meta Pixel settings:', err)
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
      const res = await fetch('/api/admin/settings/meta-pixel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          pixel_enabled: pixelEnabled,
          capi_enabled: capiEnabled,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Meta Pixel configuration saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch {
      alert('Error updating Meta Pixel configuration.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Meta Pixel Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Meta Pixel' },
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
                {/* Browser Pixel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Enable Browser Pixel</Label>
                      <p className="text-xs text-muted-foreground">
                        Tracks page views and client-side events using the Meta Pixel JavaScript SDK.
                      </p>
                    </div>
                    <Switch
                      checked={pixelEnabled}
                      onCheckedChange={setPixelEnabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pixel_id">Pixel ID</Label>
                    <Input
                      id="pixel_id"
                      value={fields.pixel_id}
                      onChange={(e) => setFields({ ...fields, pixel_id: e.target.value })}
                      placeholder="e.g. 1234567890123456"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Conversions API */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Enable Conversions API</Label>
                      <p className="text-xs text-muted-foreground">
                        Sends server-side events (e.g. registration, purchase) directly to Meta. Optional, more reliable than the browser pixel alone.
                      </p>
                    </div>
                    <Switch
                      checked={capiEnabled}
                      onCheckedChange={setCapiEnabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="access_token">Conversions API Access Token</Label>
                    <Input
                      id="access_token"
                      type="password"
                      value={fields.access_token}
                      onChange={(e) => setFields({ ...fields, access_token: e.target.value })}
                      placeholder="Enter your Conversions API access token"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="test_event_code">Test Event Code</Label>
                    <Input
                      id="test_event_code"
                      value={fields.test_event_code}
                      onChange={(e) => setFields({ ...fields, test_event_code: e.target.value })}
                      placeholder="e.g. TEST12345 (optional, for testing only)"
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
          </div>

          <div className="space-y-6">
            <Card className="space-y-5 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Where to find these</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Pixel ID</h4>
                  <p>
                    Meta Events Manager → select your pixel → shown under the pixel name / Settings tab.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Access Token</h4>
                  <p>
                    Events Manager → Settings → Conversions API → Generate access token.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Test Event Code</h4>
                  <p>
                    Events Manager → Test Events tab. Remove it once you&apos;ve confirmed events arrive.
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
