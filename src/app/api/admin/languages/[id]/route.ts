import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const langId = parseInt(id, 10)
    if (isNaN(langId)) {
      return NextResponse.json({ success: false, message: 'Invalid language ID' }, { status: 400 })
    }

    const body = await req.json()
    if (body.is_default === true) {
      db.prepare('UPDATE languages SET is_default = 0').run()
      db.prepare('UPDATE languages SET is_default = 1, is_active = 1 WHERE id = ?').run(langId)
    } else if (body.is_active !== undefined) {
      db.prepare('UPDATE languages SET is_active = ? WHERE id = ?').run(body.is_active ? 1 : 0, langId)
    }

    return NextResponse.json({
      success: true,
      message: 'Language updated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update language' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const langId = parseInt(id, 10)
    if (isNaN(langId)) {
      return NextResponse.json({ success: false, message: 'Invalid language ID' }, { status: 400 })
    }

    const lang = db.prepare('SELECT is_default FROM languages WHERE id = ?').get(langId) as { is_default: number } | undefined
    if (lang?.is_default) {
      return NextResponse.json({ success: false, message: 'Cannot delete default language' }, { status: 400 })
    }

    db.prepare('DELETE FROM languages WHERE id = ?').run(langId)
    return NextResponse.json({
      success: true,
      message: 'Language deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to delete language' }, { status: 500 })
  }
}
