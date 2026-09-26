import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  template_data: z.record(z.string(), z.unknown()).optional(),
  logo_path: z.string().optional().nullable(),
  is_active: z.boolean().optional()
})

export async function PUT(
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

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const template = db.prepare('SELECT * FROM certificate_templates WHERE id = ?').get(templateId) as { type: string } | undefined
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 })
    }

    // If activating this template, deactivate other templates of same type
    if (parsed.data.is_active === true) {
      db.prepare('UPDATE certificate_templates SET is_active = 0 WHERE type = ?').run(template.type)
    }

    const fields: string[] = []
    const values: (string | number | null)[] = []

    if (parsed.data.name !== undefined) {
      fields.push('name = ?')
      values.push(parsed.data.name)
    }
    if (parsed.data.template_data !== undefined) {
      fields.push('template_data = ?')
      values.push(JSON.stringify(parsed.data.template_data))
    }
    if (parsed.data.logo_path !== undefined) {
      fields.push('logo_path = ?')
      values.push(parsed.data.logo_path)
    }
    if (parsed.data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(parsed.data.is_active ? 1 : 0)
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')")
      values.push(templateId)
      db.prepare(`UPDATE certificate_templates SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate template updated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const templateId = parseInt(id, 10)
    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, message: 'Invalid template ID' }, { status: 400 })
    }

    const res = db.prepare('DELETE FROM certificate_templates WHERE id = ?').run(templateId)
    if (res.changes === 0) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate template deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to delete template' }, { status: 500 })
  }
}
