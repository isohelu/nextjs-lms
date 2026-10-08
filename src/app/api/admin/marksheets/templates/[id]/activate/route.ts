import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const templateId = parseInt(id, 10)
    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, message: 'Invalid template ID' }, { status: 400 })
    }

    const template = db.prepare('SELECT * FROM marksheet_templates WHERE id = ?').get(templateId) as { type: string } | undefined
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 })
    }

    // Deactivate others of the same type and activate this one
    db.prepare('UPDATE marksheet_templates SET is_active = 0 WHERE type = ?').run(template.type)
    db.prepare("UPDATE marksheet_templates SET is_active = 1, updated_at = datetime('now') WHERE id = ?").run(templateId)

    return NextResponse.json({
      success: true,
      message: 'Marksheet template activated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to activate marksheet template' }, { status: 500 })
  }
}
