'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Gauge,
  Tv,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function CinemaPlayer({ source, options, onEnded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rawSrc = source.sources[0]?.src || ''
  const ytId = parseYouTubeId(rawSrc)
  const vimeoId = parseVimeoId(rawSrc)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [theaterMode, setTheaterMode] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVol = value[0]
    videoRef.current.volume = newVol
    setVolume(newVol)
    setIsMuted(newVol === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      videoRef.current.volume = volume || 1
      setIsMuted(false)
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const handleSpeedChange = (newSpeed: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = newSpeed
    setSpeed(newSpeed)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const togglePiP = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch {}
  }

  // YouTube / Vimeo handler
  if (ytId) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group">
        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white font-medium pointer-events-none">
          <Sparkles className="h-3.5 w-3.5 text-[#D8FC38]" />
          Cinema Engine
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            key={`cinema-yt-${ytId}`}
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&controls=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title="Cinema Player"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[122%] h-[122%] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  if (vimeoId) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-primary/20">
        <iframe
          key={`cinema-vim-${vimeoId}`}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
          title="Cinema Vimeo Player"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const videoSrc =
    rawSrc && (rawSrc.startsWith('http') || rawSrc.startsWith('/') || rawSrc.includes('.mp4') || rawSrc.includes('.webm'))
      ? rawSrc
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group select-none ${
        theaterMode ? 'ring-4 ring-primary/40' : ''
      }`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        onClick={togglePlay}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false)
          onEnded?.()
        }}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Floating Center Play/Pause Indicator on Hover */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-primary/90 text-primary-foreground shadow-2xl backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
        >
          <Play className="h-9 w-9 ml-1 fill-current" />
        </button>
      )}

      {/* Badge Top Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white/90 flex items-center gap-1.5 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-[#D8FC38]" />
          Cinema Player
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div
        className={`absolute bottom-4 left-4 right-4 z-30 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-white/15 bg-black/75 p-3.5 backdrop-blur-xl shadow-2xl space-y-2.5">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white/80 shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
            </div>
            <span className="text-xs font-mono font-bold text-white/60 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-lg"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </Button>

              {/* -10s / +10s Quick Seek */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(-10)}
                className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(10)}
                className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg"
                title="Forward 10 seconds"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 ml-2 group/vol">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-16 hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Playback Speed Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-mono font-bold text-white/90 hover:bg-white/20 hover:text-white rounded-lg gap-1"
                  >
                    <Gauge className="h-3.5 w-3.5" />
                    {speed}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white min-w-28">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`cursor-pointer text-xs font-semibold justify-between rounded-lg ${
                        speed === s ? 'text-slate-950 font-bold bg-[#D8FC38]' : ''
                      }`}
                    >
                      <span>{s}x</span>
                      {s === 1 && <span className="text-xs text-muted-foreground ml-2">Normal</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Picture-in-Picture */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg hidden sm:flex"
                title="Picture-in-Picture"
              >
                <Layers className="h-3.5 w-3.5" />
              </Button>

              {/* Theater Mode */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheaterMode(!theaterMode)}
                className={`h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg hidden sm:flex ${
                  theaterMode ? 'text-primary bg-primary/20' : ''
                }`}
                title="Theater Mode"
              >
                <Tv className="h-3.5 w-3.5" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white/80 hover:bg-white/20 hover:text-white rounded-lg"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
