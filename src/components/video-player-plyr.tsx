'use client'

import React, { useEffect, useRef } from 'react'
import { Plyr, APITypes } from 'plyr-react'
import 'plyr-react/plyr.css'

interface Props {
  source: {
    type: 'video' | 'audio'
    sources: Array<{
      src: string
      type?: string
      provider?: 'youtube' | 'vimeo' | 'html5'
    }>
  }
  translate?: any
  onEnded?: () => void
}

const VideoPlayerPlyr = ({ source, translate, onEnded }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const plyrRef = useRef<APITypes>(null)

  // Common Plyr options for clean LMS playback (removes all YouTube UI clutter, adds speed & progress)
  const plyrOptions: any = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'fullscreen',
    ],
    settings: ['quality', 'speed'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    resetOnEnd: true,
    keyboard: { focused: true, global: true },
    displayDuration: true,
    tooltips: { controls: true, seek: true },
    youtube: {
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    },
    vimeo: {
      byline: false,
      portrait: false,
      title: false,
      speed: true,
      transparent: false,
    },
  }

  // Attach capturing 'ended' listener on the wrapper container to reliably detect video completion
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onEnded) return

    const handleEnded = () => {
      onEnded()
    }

    container.addEventListener('ended', handleEnded, true)

    // Check Plyr instance events if available
    let plyrInstance: any = null
    const checkTimer = setInterval(() => {
      if (plyrRef.current?.plyr) {
        plyrInstance = plyrRef.current.plyr
        plyrInstance.on('ended', handleEnded)
        clearInterval(checkTimer)
      }
    }, 500)

    return () => {
      container.removeEventListener('ended', handleEnded, true)
      clearInterval(checkTimer)
      if (plyrInstance) {
        try {
          plyrInstance.off('ended', handleEnded)
        } catch {}
      }
    }
  }, [onEnded])

  // Process the source for YouTube / Vimeo URLs
  const processedSource = (() => {
    const src = source.sources[0]?.src
    if (!src) return null

    // Check YouTube
    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be')
    if (isYouTube) {
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : null
      }

      const videoId = getYouTubeId(src)
      if (!videoId) return null

      return {
        type: 'video' as const,
        sources: [
          {
            src: videoId,
            provider: 'youtube' as const,
          },
        ],
      }
    }

    // Check Vimeo
    const isVimeo = src.includes('vimeo.com')
    if (isVimeo) {
      const getVimeoId = (url: string) => {
        const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/
        const match = url.match(regExp)
        return match ? match[3] : null
      }

      const vimeoId = getVimeoId(src)
      if (!vimeoId) return null

      return {
        type: 'video' as const,
        sources: [
          {
            src: vimeoId,
            provider: 'vimeo' as const,
          },
        ],
      }
    }

    return source
  })()

  if (!processedSource) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <p>{translate?.frontend?.no_video_available || 'No video available'}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="plyr-wrapper w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl [&_.plyr]:w-full [&_.plyr]:h-full [&_.plyr--video]:h-full [&_.plyr__video-wrapper]:h-full"
    >
      <Plyr ref={plyrRef} options={plyrOptions} source={processedSource} />
    </div>
  )
}

export default VideoPlayerPlyr
