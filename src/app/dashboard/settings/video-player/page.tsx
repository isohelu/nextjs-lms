'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TvMinimalPlay,
  PlayCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Sliders,
  Layers,
  Save,
  Loader2,
  Tv,
  Check,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import VideoPlayer, { VideoPlayerEngine } from '@/components/video-player'

const PLAYER_OPTIONS: {
  id: VideoPlayerEngine
  title: string
}[] = [
  { id: 'plyr', title: 'Plyr' },
  { id: 'videojs', title: 'Video.js' },
  { id: 'cinema', title: 'Cinema Glass Player' },
]

export default function VideoPlayerSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings State
  const [activePlayer, setActivePlayer] = useState<VideoPlayerEngine>('plyr')
  const [autoplay, setAutoplay] = useState(false)
  const [defaultSpeed, setDefaultSpeed] = useState('1')
  const [showSpeedControls, setShowSpeedControls] = useState(true)
  const [showPip, setShowPip] = useState(true)
  const [allowDownload, setAllowDownload] = useState(true)

  // Live preview tester state
  const [previewSample, setPreviewSample] = useState<'youtube' | 'mp4'>('youtube')

  useEffect(() => {
    fetch('/api/admin/settings/video-player')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setActivePlayer(data.settings.active_player || 'plyr')
          setAutoplay(Boolean(data.settings.autoplay))
          setDefaultSpeed(String(data.settings.default_speed || '1'))
          setShowSpeedControls(Boolean(data.settings.show_speed_controls ?? true))
          setShowPip(Boolean(data.settings.show_pip ?? true))
          setAllowDownload(Boolean(data.settings.allow_download ?? true))
        }
      })
      .catch(() => {
        toast.error('Could not load current player settings.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/video-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_player: activePlayer,
          autoplay,
          default_speed: defaultSpeed,
          show_speed_controls: showSpeedControls,
          show_pip: showPip,
          allow_download: allowDownload,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Video Player settings saved successfully!')
      } else {
        toast.error(data.message || 'Failed to save settings.')
      }
    } catch {
      toast.error('Network error saving settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading Player Settings...</span>
      </div>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 pb-20">
        {/* Breadcrumbs */}
        <Breadcrumbs
          title="Video Player Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings', href: '/dashboard/settings/system' },
            { title: 'Video Player' },
          ]}
          className="mb-4"
        />

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <TvMinimalPlay className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Video Player Settings
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure the default video player engine and playback controls.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 font-bold shadow-xs">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Player Settings
          </Button>
        </div>

        {/* Section 1: Active Player Selection */}
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Active Video Player
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select which player will render lessons and course videos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLAYER_OPTIONS.map((player) => {
              const isSelected = activePlayer === player.id

              return (
                <div
                  key={player.id}
                  onClick={() => setActivePlayer(player.id)}
                  className={`rounded-xl border p-4 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                        isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{player.title}</span>
                  </div>

                  <Button
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs font-semibold px-3"
                  >
                    {isSelected ? 'Active' : 'Select'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

      {/* Section 2: Player Behavior & Features */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Playback Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 divide-y divide-border pt-0">
          {/* Default Playback Speed */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 first:pt-0">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">Default Playback Speed</Label>
              <p className="text-xs text-muted-foreground">Initial speed for video lessons.</p>
            </div>
            <Select value={defaultSpeed} onValueChange={setDefaultSpeed}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1.0x (Normal)</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2.0x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speed Controls Switch */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">Playback Speed Controls</Label>
              <p className="text-xs text-muted-foreground">Allow students to change playback speed.</p>
            </div>
            <Switch checked={showSpeedControls} onCheckedChange={setShowSpeedControls} />
          </div>

          {/* Autoplay Switch */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">Autoplay</Label>
              <p className="text-xs text-muted-foreground">Auto-play next lesson on load.</p>
            </div>
            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
          </div>

          {/* Picture-in-Picture Switch */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">Picture-in-Picture (PiP)</Label>
              <p className="text-xs text-muted-foreground">Allow floating mini-player mode.</p>
            </div>
            <Switch checked={showPip} onCheckedChange={setShowPip} />
          </div>

          {/* Resource Download Switch */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">Asset Downloads</Label>
              <p className="text-xs text-muted-foreground">Allow students to download attached lesson materials.</p>
            </div>
            <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Live Player Interactive Sandbox */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-primary" />
              Preview
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant={previewSample === 'youtube' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSample('youtube')}
                className="text-xs h-8"
              >
                YouTube Feed
              </Button>
              <Button
                variant={previewSample === 'mp4' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSample('mp4')}
                className="text-xs h-8"
              >
                MP4 Direct Stream
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="max-w-3xl mx-auto">
            <VideoPlayer
              key={`admin-sandbox-${activePlayer}-${previewSample}`}
              playerType={activePlayer}
              source={{
                type: 'video',
                sources: [
                  {
                    src:
                      previewSample === 'youtube'
                        ? 'https://www.youtube.com/watch?v=lYCADK9ehXg'
                        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    provider: previewSample === 'youtube' ? 'youtube' : 'html5',
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
