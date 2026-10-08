import { NextResponse } from 'next/server'
import db from '@/lib/db'

const DEFAULT_VIDEO_SETTINGS = {
  active_player: 'plyr', // 'plyr' | 'videojs' | 'cinema'
  autoplay: false,
  default_speed: '1',
  allow_download: true,
  show_speed_controls: true,
  show_pip: true,
  theater_mode: false,
}

export async function GET() {
  try {
    const row = db.prepare("SELECT * FROM settings WHERE type = 'video_player' LIMIT 1").get() as {
      fields: string
    } | undefined

    if (row && row.fields) {
      try {
        const parsed = JSON.parse(row.fields)
        return NextResponse.json({
          success: true,
          settings: { ...DEFAULT_VIDEO_SETTINGS, ...parsed },
        })
      } catch {}
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_VIDEO_SETTINGS,
    })
  } catch (error) {
    console.error('Error fetching video player settings:', error)
    return NextResponse.json({
      success: true,
      settings: DEFAULT_VIDEO_SETTINGS,
    })
  }
}
