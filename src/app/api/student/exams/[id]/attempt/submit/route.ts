import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'
import db from '@/lib/db'

const submitSchema = z.object({
  attempt_id: z.number().int().positive(),
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      selectedOptionId: z.number().int().positive().optional()
    })
  )
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin'])
    const { id } = await context.params
    const examId = parseInt(id, 10)

    if (isNaN(examId)) {
      return NextResponse.json({ success: false, message: 'Invalid exam ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { attempt_id, answers } = parsed.data

    // Verify ownership of the attempt
    const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(attempt_id) as {
      id: number
      user_id: number
      exam_id: number
      status: string
    } | undefined

    if (!attempt) {
      return NextResponse.json({ success: false, message: 'Attempt not found.' }, { status: 404 })
    }

    if (user.role !== 'admin' && attempt.user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Access denied.' }, { status: 403 })
    }

    if (attempt.status === 'completed') {
      return NextResponse.json({ success: false, message: 'This attempt has already been submitted.' }, { status: 400 })
    }

    const result = examRepository.submitAttempt(attempt_id, answers)

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Exam submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit exam attempt.' },
      { status: 500 }
    )
  }
}
