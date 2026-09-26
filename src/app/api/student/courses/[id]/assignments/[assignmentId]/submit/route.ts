import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const submissionSchema = z.object({
  attachment_path: z.string().min(1, 'Attachment link or file path is required'),
  attachment_type: z.string().default('file'),
  comment: z.string().optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id: rawCourseId, assignmentId: rawAssignmentId } = await params
    const courseId = parseInt(rawCourseId, 10)
    const assignmentId = parseInt(rawAssignmentId, 10)

    if (isNaN(courseId) || isNaN(assignmentId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    // Verify assignment exists for this course
    const assignment = db.prepare(`
      SELECT * FROM course_assignments WHERE id = ? AND course_id = ?
    `).get(assignmentId, courseId) as any

    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found.' }, { status: 404 })
    }

    const body = await req.json()
    const validated = submissionSchema.parse(body)

    // Check if late
    const now = new Date()
    let isLate = 0
    if (assignment.deadline) {
      const deadlineDate = new Date(assignment.deadline)
      if (now > deadlineDate) {
        if (!assignment.late_submission) {
          return NextResponse.json({ success: false, message: 'Deadline has passed and late submissions are not allowed.' }, { status: 400 })
        }
        isLate = 1
      }
    }

    // Check existing attempts
    const existing = db.prepare(`
      SELECT id, attempt_number FROM assignment_submissions
      WHERE course_assignment_id = ? AND user_id = ?
      ORDER BY attempt_number DESC LIMIT 1
    `).get(assignmentId, user.id) as { id: number; attempt_number: number } | undefined

    const nextAttempt = existing ? existing.attempt_number + 1 : 1

    const result = db.prepare(`
      INSERT INTO assignment_submissions (
        course_assignment_id, user_id, attachment_type, attachment_path,
        comment, submitted_at, status, attempt_number, is_late,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `).run(
      assignmentId,
      user.id,
      validated.attachment_type,
      validated.attachment_path,
      validated.comment || '',
      now.toISOString(),
      nextAttempt,
      isLate,
      now.toISOString(),
      now.toISOString()
    )

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully!',
      submissionId: result.lastInsertRowid,
      attemptNumber: nextAttempt,
      isLate: Boolean(isLate)
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Submit assignment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit assignment.' }, { status: 500 })
  }
}
