'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import LoadingButton from '@/components/loading-button'
import { Video, CheckCircle2 } from 'lucide-react'

export default function LiveClassSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [zoomWebSdk, setZoomWebSdk] = useState(false)
  const [fields, setFields] = useState({
    zoom_account_email: '',
    zoom_account_id: '',
    zoom_client_id: '',
    zoom_client_secret: '',
    zoom_sdk_client_id: '',
    zoom_sdk_client_secret: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/live-class')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({ ...prev, ...data.settings }))
            if (data.settings.zoom_web_sdk !== undefined) {
              setZoomWebSdk(Boolean(data.settings.zoom_web_sdk))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Live Class settings:', err)
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
      const res = await fetch('/api/admin/settings/live-class', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          zoom_web_sdk: zoomWebSdk,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Zoom live class configuration saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch {
      alert('Error updating live class settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Live Class Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Live Class Settings' },
          ]}
          className="mb-4"
        />

        <div className="space-y-6 md:px-3">
          {successMessage && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <Card className="space-y-6 py-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Configure Zoom
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Account Email */}
                    <div className="space-y-2">
                      <Label htmlFor="zoom_account_email">
                        Account Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zoom_account_email"
                        type="email"
                        value={fields.zoom_account_email}
                        onChange={(e) =>
                          setFields({ ...fields, zoom_account_email: e.target.value })
                        }
                        placeholder="zoom@yourdomain.com"
                        required
                      />
                    </div>

                    {/* Account ID */}
                    <div className="space-y-2">
                      <Label htmlFor="zoom_account_id">
                        Account ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zoom_account_id"
                        type="text"
                        value={fields.zoom_account_id}
                        onChange={(e) =>
                          setFields({ ...fields, zoom_account_id: e.target.value })
                        }
                        placeholder="Enter your Zoom account ID"
                        required
                      />
                    </div>

                    {/* Client ID */}
                    <div className="space-y-2">
                      <Label htmlFor="zoom_client_id">
                        Client ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zoom_client_id"
                        type="text"
                        value={fields.zoom_client_id}
                        onChange={(e) =>
                          setFields({ ...fields, zoom_client_id: e.target.value })
                        }
                        placeholder="Enter your Zoom client ID"
                        required
                      />
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-2">
                      <Label htmlFor="zoom_client_secret">
                        Client Secret <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zoom_client_secret"
                        type="password"
                        value={fields.zoom_client_secret}
                        onChange={(e) =>
                          setFields({ ...fields, zoom_client_secret: e.target.value })
                        }
                        placeholder="Enter your Zoom client secret"
                        required
                      />
                    </div>

                    <Separator />

                    {/* Web SDK Option */}
                    <div className="space-y-4">
                      <Label className="mb-4 block">
                        Do you want to use Web SDK for your live class? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={zoomWebSdk ? 'activate' : 'deactivate'}
                        onValueChange={(val) => setZoomWebSdk(val === 'activate')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="activate" value="activate" className="cursor-pointer" />
                          <Label htmlFor="activate" className="mb-0 cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="deactivate" value="deactivate" className="cursor-pointer" />
                          <Label htmlFor="deactivate" className="mb-0 cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Web SDK Credentials */}
                    {zoomWebSdk && (
                      <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                        <h4 className="text-sm font-semibold text-foreground">
                          Meeting SDK Credentials
                        </h4>

                        <div className="space-y-2">
                          <Label>
                            Meeting SDK Client ID <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            value={fields.zoom_sdk_client_id}
                            onChange={(e) =>
                              setFields({ ...fields, zoom_sdk_client_id: e.target.value })
                            }
                            placeholder="Enter your Meeting SDK client ID"
                            required={zoomWebSdk}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Meeting SDK Client Secret <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="password"
                            value={fields.zoom_sdk_client_secret}
                            onChange={(e) =>
                              setFields({ ...fields, zoom_sdk_client_secret: e.target.value })
                            }
                            placeholder="Enter your Meeting SDK client secret"
                            required={zoomWebSdk}
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                      <LoadingButton
                        loading={saving}
                        type="submit"
                        className="w-full sm:w-auto"
                      >
                        Save Changes
                      </LoadingButton>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <div className="space-y-6">
              <Card className="space-y-6 py-6">
                <CardHeader>
                  <CardTitle className="text-lg">Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-1 font-medium text-sm text-foreground">
                      Step 1: Create Zoom App
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Go to the Zoom Marketplace and create a Server-to-Server OAuth app.
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-1 font-medium text-sm text-foreground">
                      Step 2: Get Credentials
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Copy your Account ID, Client ID, and Client Secret from your app settings.
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-1 font-medium text-sm text-foreground">
                      Step 3: Web SDK (Optional)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you want to embed Zoom meetings directly in your website, enable Web SDK and provide Meeting SDK credentials.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="space-y-5 py-6">
                <CardHeader>
                  <CardTitle className="text-lg">Required Scopes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• meeting:write</li>
                    <li>• meeting:read</li>
                    <li>• user:read</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
