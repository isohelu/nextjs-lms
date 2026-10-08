'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import LoadingButton from '@/components/loading-button'
import { Upload, CheckCircle, Database, Puzzle, CheckCircle2, AlertTriangle } from 'lucide-react'

interface PluginItem {
  name: string
  title: string
  description: string
  version: string
  is_enabled: boolean
  can_toggle: boolean
  needs_setup: boolean
  has_seeder: boolean
}

const DEFAULT_PLUGINS: PluginItem[] = [
  {
    name: 'AIAssistant',
    title: 'AI Assistant',
    description: 'Generates course outlines, quiz questions, and lecture summaries with advanced LLM intelligence.',
    version: '1.2.0',
    is_enabled: true,
    can_toggle: true,
    needs_setup: true,
    has_seeder: true,
  },
  {
    name: 'Certification',
    title: 'Certificates & Marksheets',
    description: 'Dynamic PDF certificate and academic marksheet generator with drag-and-drop live preview builder.',
    version: '2.1.0',
    is_enabled: true,
    can_toggle: true,
    needs_setup: true,
    has_seeder: true,
  },
  {
    name: 'OfflinePayment',
    title: 'Offline Payments',
    description: 'Enables direct bank wire transfers, manual receipt uploads, and admin approval workflows.',
    version: '1.0.5',
    is_enabled: true,
    can_toggle: true,
    needs_setup: false,
    has_seeder: false,
  },
]

export default function PluginsSettingsPage() {
  const [plugins, setPlugins] = useState<PluginItem[]>(DEFAULT_PLUGINS)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [seederModalPlugin, setSeederModalPlugin] = useState<PluginItem | null>(null)
  const [runningSeeder, setRunningSeeder] = useState(false)

  const handleToggle = (pluginName: string, enabled: boolean) => {
    setPlugins(prev =>
      prev.map(p => (p.name === pluginName ? { ...p, is_enabled: enabled } : p))
    )
    setSuccessMessage(`Plugin ${pluginName} ${enabled ? 'enabled' : 'disabled'} successfully.`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleInstall = () => {
    if (!selectedFile) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setSelectedFile(null)
      setSuccessMessage('Plugin uploaded and installed successfully.')
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 1200)
  }

  const handleRunSeeder = (plugin: PluginItem) => {
    setRunningSeeder(true)
    setTimeout(() => {
      setRunningSeeder(false)
      setSeederModalPlugin(null)
      setSuccessMessage(`Database migration and seeder for ${plugin.name} executed successfully.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 1500)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <Breadcrumbs
          title="Plugins"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Plugins' },
          ]}
          className="mb-4"
        />

        {successMessage && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Upload Plugin Card */}
        <Card className="py-4 md:py-6">
          <CardContent className="space-y-4 px-4 md:px-6">
            <Label className="flex items-center gap-2 font-semibold">
              <Upload className="h-4 w-4 text-primary" />
              Upload plugin
            </Label>

            <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
              <div className="flex-1 w-full flex items-center border border-border rounded-lg sm:rounded-r-none px-3 py-2 bg-white text-xs">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-foreground hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <LoadingButton
                size="lg"
                type="button"
                disabled={!selectedFile || uploading}
                loading={uploading}
                onClick={handleInstall}
                className="w-full sm:w-auto md:rounded-l-none h-10 px-6 text-xs sm:text-sm font-bold bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 rounded-xl shadow-xs"
              >
                {uploading ? 'Installing...' : 'Install plugin'}
              </LoadingButton>
            </div>

            <p className="text-xs text-muted-foreground">
              Large deploy ZIPs upload in chunks (up to 256 MB). The package must contain Modules/&#123;Name&#125;, public/build, and bootstrap/ssr.
            </p>

            {selectedFile && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                      <strong>Selected file:</strong> {selectedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                      Ready for deployment. Click install to deploy the plugin module.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <h4 className="text-xl font-semibold text-foreground">Installed plugins</h4>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <Card key={plugin.name} className="p-4 md:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">{plugin.title || plugin.name}</h2>
                      {plugin.is_enabled ? (
                        <Badge className="bg-[#D8FC38] text-slate-950 font-bold text-xs">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-semibold">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {plugin.description}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Version {plugin.version}
                    </p>
                  </div>

                  {plugin.can_toggle && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Switch
                        id={`toggle-${plugin.name}`}
                        checked={plugin.is_enabled}
                        onCheckedChange={(checked) => handleToggle(plugin.name, checked)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {plugin.needs_setup && plugin.has_seeder && (
                <div>
                  <Separator className="my-4" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive text-xs gap-2"
                    disabled={!plugin.is_enabled}
                    onClick={() => setSeederModalPlugin(plugin)}
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Run Migration and Seeder</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Seeder Confirmation Modal */}
        <Dialog open={!!seederModalPlugin} onOpenChange={(open) => !open && setSeederModalPlugin(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Run migration and seeder for {seederModalPlugin?.name}?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This will run the database migration and seeder for the <strong>{seederModalPlugin?.name}</strong> plugin.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Important Notes:</span>
              </div>
              <ul className="list-inside list-disc space-y-1 text-amber-800">
                <li>Run this only once after installing or updating the plugin</li>
                <li>Running the seeder multiple times may overwrite existing default records</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeederModalPlugin(null)}
              >
                Cancel
              </Button>
              <LoadingButton
                size="sm"
                loading={runningSeeder}
                onClick={() => seederModalPlugin && handleRunSeeder(seederModalPlugin)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Confirm & Run
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
