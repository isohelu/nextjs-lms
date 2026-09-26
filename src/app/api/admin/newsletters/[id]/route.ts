import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

const updateSchema = z.object({
  subject: z.string().min(3).optional(),
  description: z.string().min(10).optional()
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const newsletterId = parseInt(id, 10)
    if (isNaN(newsletterId)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const fields: string[] = []
    const values: (string | number)[] = []

    if (parsed.data.subject) {
      fields.push('subject = ?')
      values.push(parsed.data.subject)
    }
    if (parsed.data.description) {
      fields.push('description = ?')
      values.push(parsed.data.description)
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 })
    }

    fields.push("updated_at = datetime('now')")
    values.push(newsletterId)

    db.prepare(`UPDATE newsletters SET ${fields.join(', ')} WHERE id = ?`).run(...values)

    return NextResponse.json({
      success: true,
      message: 'Newsletter updated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update newsletter.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const newsletterId = parseInt(id, 10)
    if (isNaN(newsletterId)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const result = db.prepare('DELETE FROM newsletters WHERE id = ?').run(newsletterId)
    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Newsletter not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to delete newsletter.' }, { status: 500 })
  }
}
