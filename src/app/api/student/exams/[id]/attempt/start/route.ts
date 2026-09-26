import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'

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

    const exam = examRepository.findById(examId)
    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found.' }, { status: 404 })
    }

    if (user.role !== 'admin' && !examRepository.isEnrolled(user.id, examId)) {
      return NextResponse.json(
        { success: false, message: 'You must enroll in this exam before starting an attempt.' },
        { status: 403 }
      )
    }

    const previousAttempts = examRepository.getAttempts(user.id, examId)
    const maxAttempts = exam.max_attempts || 1
    if (user.role !== 'admin' && previousAttempts.length >= maxAttempts) {
      return NextResponse.json(
        { success: false, message: `Maximum attempts limit (${maxAttempts}) reached for this exam.` },
        { status: 400 }
      )
    }

    const attemptId = examRepository.startAttempt(user.id, examId)
    const questions = examRepository.getQuestions(examId, false) // false = hide is_correct answers!

    return NextResponse.json({
      success: true,
      attemptId,
      exam: {
        id: exam.id,
        title: exam.title,
        duration_hours: exam.duration_hours,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        pass_mark: exam.pass_mark
      },
      questions
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Exam attempt start error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to start exam attempt.' },
      { status: 500 }
    )
  }
}
