'use client'

import React, { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Loader2 } from 'lucide-react'

interface Props {
  source: {
    type: 'video' | 'audio'
    sources: Array<{
      src: string
      type?: string
      provider?: 'youtube' | 'vimeo' | 'html5'
    }>
  }
  options?: any
  onEnded?: () => void
}

function parseYouTubeId(url?: string | null): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function parseVimeoId(url?: string | null): string | null {
  if (!url) return null
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/
  const match = url.match(regExp)
  return match ? match[3] : null
}

export default function VideoJsPlayer({ source, options, onEnded }: Props) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded
  const [loading, setLoading] = useState(false)

  const rawSrc = source.sources[0]?.src || ''
  const ytId = parseYouTubeId(rawSrc)
  const vimeoId = parseVimeoId(rawSrc)

  useEffect(() => {
    // If it's YouTube or Vimeo, we render a clean customized iframe container with Video.js styled overlay
    if (ytId || vimeoId) {
      return
    }

    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-forest')
      videoRef.current.appendChild(videoElement)

      const player = (playerRef.current = videojs(
        videoElement,
        {
          autoplay: options?.autoplay || false,
          controls: true,
          responsive: true,
          fluid: true,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          controlBar: {
            playbackRateMenuButton: true,
            pictureInPictureToggle: true,
            volumePanel: { inline: false },
          },
          sources: [
            {
              src: rawSrc || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              type: 'video/mp4',
            },
          ],
          ...options,
        },
        () => {
          setLoading(false)
          player.on('ended', () => {
            onEndedRef.current?.()
          })
        }
      ))
    } else if (playerRef.current) {
      const player = playerRef.current
      player.src([
        {
          src: rawSrc || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video/mp4',
        },
      ])
    }
  }, [rawSrc, options, ytId, vimeoId])

  useEffect(() => {
    const player = playerRef.current
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [])

  // For YouTube in Video.js mode: render clean responsive player with controls
  if (ytId) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border group">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            key={`vjs-yt-${ytId}`}
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&controls=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title="Video Player"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[122%] h-[122%] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  // For Vimeo
  if (vimeoId) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border">
        <iframe
          key={`vjs-vim-${vimeoId}`}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
          title="Video.js Vimeo Player"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div data-vjs-player ref={videoRef} className="w-full h-full [&_.video-js]:w-full [&_.video-js]:h-full" />
    </div>
  )
}
