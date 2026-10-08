'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import LoadingButton from '@/components/loading-button'
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  HardDrive,
  Video,
  Activity,
  XCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

type StorageDriver = 'local' | 's3' | 'r2' | 'bunny'

interface StorageFormFields {
  storage_driver: StorageDriver
  aws_access_key_id: string
  aws_secret_access_key: string
  aws_default_region: string
  aws_bucket: string
  r2_access_key_id: string
  r2_secret_access_key: string
  r2_bucket: string
  r2_endpoint: string
  r2_public_url: string
  r2_region: string
  bunny_library_id: string
  bunny_api_key: string
  bunny_token_auth_key: string
}

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [storageDriver, setStorageDriver] = useState<StorageDriver>('local')
  const [fields, setFields] = useState<StorageFormFields>({
    storage_driver: 'local',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_default_region: 'us-east-1',
    aws_bucket: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket: '',
    r2_endpoint: '',
    r2_public_url: '',
    r2_region: 'auto',
    bunny_library_id: '',
    bunny_api_key: '',
    bunny_token_auth_key: '',
  })

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/storage')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields((prev) => ({ ...prev, ...data.settings }))
            if (data.settings.storage_driver) {
              setStorageDriver(data.settings.storage_driver)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching storage settings:', err)
        toast.error('Failed to load storage settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch('/api/admin/settings/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver: storageDriver,
          settings: fields,
        }),
      })

      const data = await res.json()
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connection successful!' : 'Connection failed.'),
      })

      if (data.success) {
        toast.success(data.message || 'Storage connection verified!')
      } else {
        toast.error(data.message || 'Connection test failed.')
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Network error while testing connection.',
      })
      toast.error('Failed to reach server for testing.')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const payload = {
        ...fields,
        storage_driver: storageDriver,
      }

      const res = await fetch('/api/admin/settings/storage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Storage settings updated successfully.')
        setSuccessMessage('Storage settings updated successfully.')
      } else {
        toast.error(data.message || 'Failed to update storage settings.')
      }
    } catch {
      toast.error('Network error updating storage configuration.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Storage Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Storage Settings' },
          ]}
          className="mb-4"
        />

        <div className="md:px-3">
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`mb-4 flex items-center gap-2 p-4 rounded-xl border text-xs font-semibold shadow-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <Card className="p-4 sm:p-6 bg-card border-border shadow-xs rounded-xl">
            <form onSubmit={handleSave} autoComplete="off" className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Storage Driver <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1">
                  <Select
                    value={storageDriver}
                    onValueChange={(val) => {
                      const driver = val as StorageDriver
                      setStorageDriver(driver)
                      setFields((prev) => ({ ...prev, storage_driver: driver }))
                      setTestResult(null)
                    }}
                  >
                    <SelectTrigger className="w-full bg-background border-input text-foreground">
                      <SelectValue placeholder="Select storage driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="s3">AWS S3</SelectItem>
                      <SelectItem value="r2">Cloudflare R2</SelectItem>
                      <SelectItem value="bunny">Bunny Stream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {storageDriver === 'bunny' && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Bunny only hosts lesson videos — it has no file storage of its own for images, documents, or
                    course previews, so those keep using the local disk while Bunny is selected.
                  </p>
                )}
              </div>

              {/* CORS Warning Banner for AWS S3 & Cloudflare R2 */}
              {(storageDriver === 's3' || storageDriver === 'r2') && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold text-sm">
                    CORS must be configured on your bucket
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs space-y-2 mt-1">
                    <p>
                      Videos and files now upload directly from the visitor&apos;s browser to your{' '}
                      <strong>{storageDriver === 's3' ? 'S3 bucket' : 'R2 bucket'}</strong> for speed — your
                      server is no longer in the middle. The bucket must explicitly allow this, or uploads will fail.
                    </p>
                    <p>
                      In{' '}
                      {storageDriver === 's3'
                        ? 'the S3 console (Permissions → CORS)'
                        : 'your R2 dashboard (Settings → CORS Policy)'}
                      , add a rule allowing your site&apos;s domain, for example:
                    </p>
                    <pre className="overflow-x-auto rounded-xl bg-amber-100 dark:bg-amber-900/40 p-3 font-mono text-xs whitespace-pre text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40">
{`[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}
                    </pre>
                    <p>
                      <code className="font-bold">ExposeHeaders: [&quot;ETag&quot;]</code> is required — without
                      it the browser can&apos;t read the value it needs to finish the upload, and every upload will
                      fail.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* AWS S3 Form Fields */}
              {storageDriver === 's3' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <Label className="text-sm font-medium">
                      AWS Access Key ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="aws_access_key_id"
                      autoComplete="off"
                      value={fields.aws_access_key_id}
                      onChange={(e) =>
                        setFields({ ...fields, aws_access_key_id: e.target.value })
                      }
                      placeholder="e.g. AKIAIOSFODNN7EXAMPLE"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      AWS Secret Access Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="aws_secret_access_key"
                      autoComplete="new-password"
                      value={fields.aws_secret_access_key}
                      onChange={(e) =>
                        setFields({ ...fields, aws_secret_access_key: e.target.value })
                      }
                      placeholder="Enter your AWS secret access key"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      AWS Region <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="aws_default_region"
                      autoComplete="off"
                      value={fields.aws_default_region}
                      onChange={(e) =>
                        setFields({ ...fields, aws_default_region: e.target.value })
                      }
                      placeholder="us-east-1"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Bucket Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="aws_bucket"
                      autoComplete="off"
                      value={fields.aws_bucket}
                      onChange={(e) =>
                        setFields({ ...fields, aws_bucket: e.target.value })
                      }
                      placeholder="my-lms-course-bucket"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Cloudflare R2 Form Fields */}
              {storageDriver === 'r2' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <Label className="text-sm font-medium">
                      Account ID or Access Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="r2_access_key_id"
                      autoComplete="off"
                      value={fields.r2_access_key_id}
                      onChange={(e) =>
                        setFields({ ...fields, r2_access_key_id: e.target.value })
                      }
                      placeholder="Enter R2 Access Key ID"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Secret Access Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="r2_secret_access_key"
                      autoComplete="new-password"
                      value={fields.r2_secret_access_key}
                      onChange={(e) =>
                        setFields({ ...fields, r2_secret_access_key: e.target.value })
                      }
                      placeholder="Enter R2 Secret Access Key"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Bucket Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="r2_bucket"
                      autoComplete="off"
                      value={fields.r2_bucket}
                      onChange={(e) =>
                        setFields({ ...fields, r2_bucket: e.target.value })
                      }
                      placeholder="Enter R2 Bucket Name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Endpoint <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="r2_endpoint"
                      autoComplete="off"
                      value={fields.r2_endpoint}
                      onChange={(e) =>
                        setFields({ ...fields, r2_endpoint: e.target.value })
                      }
                      placeholder="https://<account-id>.r2.cloudflarestorage.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Public URL (Optional)</Label>
                    <Input
                      name="r2_public_url"
                      autoComplete="off"
                      value={fields.r2_public_url}
                      onChange={(e) =>
                        setFields({ ...fields, r2_public_url: e.target.value })
                      }
                      placeholder="https://pub-xxxx.r2.dev"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Only needed for images/documents/course previews to display. Lesson videos on R2 always use
                      presigned streaming requests.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Region</Label>
                    <Input
                      name="r2_region"
                      autoComplete="off"
                      value={fields.r2_region}
                      onChange={(e) =>
                        setFields({ ...fields, r2_region: e.target.value })
                      }
                      placeholder="auto"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Bunny Stream Fields */}
              {storageDriver === 'bunny' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <Label className="text-sm font-medium">
                      Bunny Library ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      name="bunny_library_id"
                      autoComplete="off"
                      value={fields.bunny_library_id}
                      onChange={(e) =>
                        setFields({ ...fields, bunny_library_id: e.target.value })
                      }
                      placeholder="Enter your Bunny Stream Library ID (e.g. 123456)"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Bunny Stream API Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="bunny_api_key"
                      autoComplete="new-password"
                      value={fields.bunny_api_key}
                      onChange={(e) =>
                        setFields({ ...fields, bunny_api_key: e.target.value })
                      }
                      placeholder="Enter your Bunny Stream API key"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Bunny Token Authentication Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="bunny_token_auth_key"
                      autoComplete="new-password"
                      value={fields.bunny_token_auth_key}
                      onChange={(e) =>
                        setFields({ ...fields, bunny_token_auth_key: e.target.value })
                      }
                      placeholder="Enter your library's Token Authentication security key"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enable Token Authentication on this library in the Bunny dashboard first, then copy its
                      security key here — this is what signs every lesson&apos;s playback URL.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {storageDriver === 'local' && (
                    <>
                      <HardDrive className="h-3.5 w-3.5 text-primary" />
                      <span>Files & videos stored on local server disk</span>
                    </>
                  )}
                  {storageDriver === 's3' && (
                    <>
                      <Cloud className="h-3.5 w-3.5 text-amber-500" />
                      <span>AWS S3 Cloud Storage Active</span>
                    </>
                  )}
                  {storageDriver === 'r2' && (
                    <>
                      <Database className="h-3.5 w-3.5 text-orange-500" />
                      <span>Cloudflare R2 Zero-Egress Storage Active</span>
                    </>
                  )}
                  {storageDriver === 'bunny' && (
                    <>
                      <Video className="h-3.5 w-3.5 text-rose-500" />
                      <span>Bunny Stream CDN Video Delivery Active</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testing || saving}
                    className="flex items-center gap-1.5"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </Button>

                  <LoadingButton loading={saving} type="submit">
                    Save Changes
                  </LoadingButton>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
