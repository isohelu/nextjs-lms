import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
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
    await requireRole(['admin'])
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
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch settings.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const body = await req.json()

    const newSettings = {
      active_player: body.active_player || 'plyr',
      autoplay: Boolean(body.autoplay),
      default_speed: String(body.default_speed || '1'),
      allow_download: Boolean(body.allow_download ?? true),
      show_speed_controls: Boolean(body.show_speed_controls ?? true),
      show_pip: Boolean(body.show_pip ?? true),
      theater_mode: Boolean(body.theater_mode),
    }

    const fieldsJson = JSON.stringify(newSettings)
    const existing = db.prepare("SELECT id FROM settings WHERE type = 'video_player' LIMIT 1").get() as { id: number } | undefined

    if (existing) {
      db.prepare("UPDATE settings SET fields = ?, updated_at = datetime('now') WHERE id = ?").run(fieldsJson, existing.id)
    } else {
      db.prepare(
        "INSERT INTO settings (type, sub_type, title, fields, created_at, updated_at) VALUES ('video_player', 'player', 'Video Player Settings', ?, datetime('now'), datetime('now'))"
      ).run(fieldsJson)
    }

    return NextResponse.json({
      success: true,
      message: 'Video Player settings updated successfully.',
      settings: newSettings,
    })
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Error saving video player settings:', error)
    return NextResponse.json({ success: false, message: 'Failed to save settings.' }, { status: 500 })
  }
}
