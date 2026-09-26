import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import db from '@/lib/db'

const submissionSchema = z.object({
  course_assignment_id: z.number().int().positive(),
  attachment_path: z.string().min(2),
  attachment_type: z.string().default('url'),
  comment: z.string().optional()
})

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID' }, { status: 400 })
    }

    const assignments = db.prepare(`
      SELECT ca.*,
             (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.course_assignment_id = ca.id AND asub.user_id = ?) as student_attempts_count,
             (SELECT status FROM assignment_submissions asub WHERE asub.course_assignment_id = ca.id AND asub.user_id = ? ORDER BY id DESC LIMIT 1) as student_latest_status,
             (SELECT marks_obtained FROM assignment_submissions asub WHERE asub.course_assignment_id = ca.id AND asub.user_id = ? ORDER BY id DESC LIMIT 1) as student_latest_marks
      FROM course_assignments ca
      WHERE ca.course_id = ?
      ORDER BY ca.id ASC
    `).all(session.id, session.id, session.id, courseId)

    return NextResponse.json({
      success: true,
      assignments
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch course assignments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = submissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const assignment = db.prepare('SELECT * FROM course_assignments WHERE id = ? AND course_id = ?').get(
      parsed.data.course_assignment_id,
      courseId
    ) as { id: number; retake: number } | undefined

    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found for this course.' }, { status: 404 })
    }

    const pastAttemptsCount = (
      db.prepare(
        'SELECT COUNT(*) as count FROM assignment_submissions WHERE course_assignment_id = ? AND user_id = ?'
      ).get(parsed.data.course_assignment_id, session.id) as { count: number }
    ).count

    if (pastAttemptsCount >= (assignment.retake || 1)) {
      return NextResponse.json(
        { success: false, message: 'Maximum submission attempts reached for this assignment.' },
        { status: 400 }
      )
    }

    const attemptNumber = pastAttemptsCount + 1

    const stmt = db.prepare(`
      INSERT INTO assignment_submissions (
        attachment_type, attachment_path, comment, submitted_at,
        marks_obtained, status, attempt_number, is_late,
        user_id, course_assignment_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, datetime('now'),
        0, 'pending', ?, 0,
        ?, ?, datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(
      parsed.data.attachment_type,
      parsed.data.attachment_path,
      parsed.data.comment || null,
      attemptNumber,
      session.id,
      parsed.data.course_assignment_id
    )

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully for instructor review.',
      submissionId: Number(res.lastInsertRowid),
      attemptNumber
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Submit assignment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit assignment.' }, { status: 500 })
  }
}
