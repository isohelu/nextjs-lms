import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const gradeSchema = z.object({
  marks_obtained: z.number().min(0),
  instructor_feedback: z.string().optional()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const submissionId = parseInt(rawId, 10)

    if (isNaN(submissionId)) {
      return NextResponse.json({ success: false, message: 'Invalid submission ID.' }, { status: 400 })
    }

    const submission = db.prepare(`
      SELECT s.*, ca.total_mark, ca.course_id
      FROM assignment_submissions s
      JOIN course_assignments ca ON s.course_assignment_id = ca.id
      WHERE s.id = ?
    `).get(submissionId) as any

    if (!submission) {
      return NextResponse.json({ success: false, message: 'Submission not found.' }, { status: 404 })
    }

    const body = await req.json()
    const validated = gradeSchema.parse(body)

    if (validated.marks_obtained > Number(submission.total_mark)) {
      return NextResponse.json({
        success: false,
        message: `Marks obtained cannot exceed assignment total marks (${submission.total_mark}).`
      }, { status: 400 })
    }

    db.prepare(`
      UPDATE assignment_submissions
      SET marks_obtained = ?,
          instructor_feedback = ?,
          status = 'graded',
          grader_id = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      validated.marks_obtained,
      validated.instructor_feedback || '',
      user.id,
      new Date().toISOString(),
      submissionId
    )

    return NextResponse.json({
      success: true,
      message: 'Submission graded successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Grade assignment submission error:', error)
    return NextResponse.json({ success: false, message: 'Failed to grade submission.' }, { status: 500 })
  }
}
