import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireInstructor } from '@/lib/auth/session'
import db from '@/lib/db'

const gradeSchema = z.object({
  submission_id: z.number().int().positive(),
  marks_obtained: z.number().min(0),
  instructor_feedback: z.string().optional(),
  status: z.enum(['approved', 'rejected', 'graded']).default('graded')
})

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (isNaN(assignmentId)) {
      return NextResponse.json({ success: false, message: 'Invalid assignment ID' }, { status: 400 })
    }

    const submissions = db.prepare(`
      SELECT asub.*, u.name as student_name, u.email as student_email, u.photo as student_photo
      FROM assignment_submissions asub
      JOIN users u ON asub.user_id = u.id
      WHERE asub.course_assignment_id = ?
      ORDER BY asub.id DESC
    `).all(assignmentId)

    return NextResponse.json({
      success: true,
      submissions
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireInstructor()
    const { id } = await context.params
    const assignmentId = parseInt(id, 10)
    if (isNaN(assignmentId)) {
      return NextResponse.json({ success: false, message: 'Invalid assignment ID' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = gradeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const stmt = db.prepare(`
      UPDATE assignment_submissions
      SET marks_obtained = ?, instructor_feedback = ?, status = ?, grader_id = ?, updated_at = datetime('now')
      WHERE id = ? AND course_assignment_id = ?
    `)

    const res = stmt.run(
      parsed.data.marks_obtained,
      parsed.data.instructor_feedback || null,
      parsed.data.status,
      session.id,
      parsed.data.submission_id,
      assignmentId
    )

    if (res.changes === 0) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment graded successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    console.error('Grade assignment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to grade submission' }, { status: 500 })
  }
}
