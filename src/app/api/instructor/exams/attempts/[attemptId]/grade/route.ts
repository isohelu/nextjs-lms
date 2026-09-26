import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const gradeAttemptSchema = z.object({
  obtained_marks: z.number().min(0),
  feedback: z.string().optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { attemptId: rawId } = await params
    const attemptId = parseInt(rawId, 10)

    if (isNaN(attemptId)) {
      return NextResponse.json({ success: false, message: 'Invalid attempt ID.' }, { status: 400 })
    }

    const attempt = db.prepare(`
      SELECT ea.*, e.pass_mark, e.total_marks
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE ea.id = ?
    `).get(attemptId) as any

    if (!attempt) {
      return NextResponse.json({ success: false, message: 'Attempt not found.' }, { status: 404 })
    }

    const body = await req.json()
    const validated = gradeAttemptSchema.parse(body)

    const totalMarks = Number(attempt.total_marks || 100)
    const passMarkPercent = Number(attempt.pass_mark || 60)
    const scorePercent = (validated.obtained_marks / totalMarks) * 100
    const isPassed = scorePercent >= passMarkPercent ? 1 : 0

    db.prepare(`
      UPDATE exam_attempts
      SET obtained_marks = ?,
          is_passed = ?,
          status = 'graded',
          updated_at = ?
      WHERE id = ?
    `).run(
      validated.obtained_marks,
      isPassed,
      new Date().toISOString(),
      attemptId
    )

    return NextResponse.json({
      success: true,
      message: 'Exam attempt graded successfully!',
      is_passed: Boolean(isPassed),
      obtained_marks: validated.obtained_marks
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Grade exam attempt error:', error)
    return NextResponse.json({ success: false, message: 'Failed to grade attempt.' }, { status: 500 })
  }
}
