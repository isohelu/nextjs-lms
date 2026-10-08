import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import db from '@/lib/db'

export async function GET() {
  try {
    await requireRole(['admin'])
    const allPages = db.prepare('SELECT * FROM pages ORDER BY id ASC').all() as any[]
    const homeSetting = settingRepository.getByType('home_page') || { page_slug: 'home-1', page_name: 'Collaborative 1' }
    const systemSetting = db.prepare("SELECT sub_type FROM settings WHERE type = 'system' LIMIT 1").get() as { sub_type?: string } | undefined

    return NextResponse.json({
      success: true,
      pages: allPages,
      home: homeSetting,
      systemType: systemSetting?.sub_type || 'collaborative'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve pages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const body = await req.json()

    // Action: Select active home page
    if (body.action === 'select_home') {
      const { slug, name } = body
      settingRepository.updateByType('home_page', null, { page_slug: slug, page_name: name })
      return NextResponse.json({ success: true, message: `Homepage changed to ${name}` })
    }

    // Action: Change system type
    if (body.action === 'change_system_type') {
      const { sub_type } = body
      db.prepare("UPDATE settings SET sub_type = ? WHERE type = 'system'").run(sub_type)
      return NextResponse.json({ success: true, message: `System type changed to ${sub_type}` })
    }

    // Action: Create new custom page
    if (body.action === 'create_custom_page') {
      const { title, slug, content } = body
      if (!title || !slug) {
        return NextResponse.json({ success: false, message: 'Title and slug are required' }, { status: 400 })
      }
      const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug)
      if (existing) {
        return NextResponse.json({ success: false, message: 'Page slug already exists' }, { status: 400 })
      }
      db.prepare(`
        INSERT INTO pages (title, slug, type, created_at, updated_at)
        VALUES (?, ?, 'inner_page', datetime('now'), datetime('now'))
      `).run(title, slug)

      return NextResponse.json({ success: true, message: 'Custom page created successfully' })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing page ID' }, { status: 400 })
    }

    db.prepare("DELETE FROM pages WHERE id = ? AND type = 'inner_page'").run(Number(id))
    return NextResponse.json({ success: true, message: 'Custom page deleted successfully' })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to delete page' }, { status: 500 })
  }
}
