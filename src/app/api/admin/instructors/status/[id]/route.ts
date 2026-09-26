import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const statusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending'])
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await context.params
    const instructorId = parseInt(id, 10)

    if (isNaN(instructorId)) {
      return NextResponse.json({ success: false, message: 'Invalid instructor ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { status } = parsed.data

    const instructor = db.prepare('SELECT id, user_id FROM instructors WHERE id = ?').get(instructorId) as {
      id: number
      user_id: number
    } | undefined

    if (!instructor) {
      return NextResponse.json({ success: false, message: 'Instructor application not found.' }, { status: 404 })
    }

    const transaction = db.transaction(() => {
      db.prepare(`UPDATE instructors SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, instructorId)

      if (status === 'approved') {
        db.prepare(`
          UPDATE users SET role = 'instructor', instructor_id = ?, updated_at = datetime('now') WHERE id = ?
        `).run(instructorId, instructor.user_id)
      } else if (status === 'rejected') {
        db.prepare(`
          UPDATE users SET role = 'student', updated_at = datetime('now') WHERE id = ?
        `).run(instructor.user_id)
      }
    })

    transaction()

    return NextResponse.json({
      success: true,
      message: `Instructor application marked as ${status}.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update instructor status error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update application status.' }, { status: 500 })
  }
}
