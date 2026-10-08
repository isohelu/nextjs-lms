'use client'

import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const PlyrPlayer = lazy(() => import('./video-player-plyr'))
const VideoJsPlayer = lazy(() => import('./video-player/VideoJsPlayer'))
const CinemaPlayer = lazy(() => import('./video-player/CinemaPlayer'))

export type VideoPlayerEngine = 'plyr' | 'videojs' | 'cinema'

interface Props {
  source: {
    type: 'video' | 'audio'
    sources: Array<{
      src: string
      type?: string
      provider?: 'youtube' | 'vimeo' | 'html5'
    }>
  }
  playerType?: VideoPlayerEngine
  options?: any
  translate?: any
  onEnded?: () => void
}

// Global active player memory cache
let cachedPlayer: VideoPlayerEngine = 'plyr'

export default function VideoPlayer({ source, playerType, options, translate, onEnded }: Props) {
  const [activeEngine, setActiveEngine] = useState<VideoPlayerEngine>(playerType || cachedPlayer)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (!playerType) {
      // Fetch dynamic active player configured by admin
      fetch('/api/settings/video-player')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings?.active_player) {
            cachedPlayer = data.settings.active_player
            setActiveEngine(data.settings.active_player)
          }
        })
        .catch(() => {})
    }
  }, [playerType])

  const fallback = (
    <div className="aspect-video w-full rounded-2xl bg-black flex items-center justify-center border border-border">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
    </div>
  )

  if (!mounted) {
    return fallback
  }

  return (
    <Suspense fallback={fallback}>
      {activeEngine === 'videojs' ? (
        <VideoJsPlayer source={source} options={options} onEnded={onEnded} />
      ) : activeEngine === 'cinema' ? (
        <CinemaPlayer source={source} options={options} onEnded={onEnded} />
      ) : (
        <PlyrPlayer source={source} translate={translate} onEnded={onEnded} />
      )}
    </Suspense>
  )
}
