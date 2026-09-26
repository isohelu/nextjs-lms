import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id, attemptId } = await context.params
    const examId = parseInt(id, 10)
    const attId = parseInt(attemptId, 10)

    if (isNaN(examId) || isNaN(attId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(attId) as {
      id: number
      user_id: number
      exam_id: number
      total_marks: number
      obtained_marks: number
      correct_answers: number
      incorrect_answers: number
      is_passed: number
      status: string
      start_time: string
      end_time: string
    } | undefined

    if (!attempt) {
      return NextResponse.json({ success: false, message: 'Attempt record not found.' }, { status: 404 })
    }

    if (user.role !== 'admin' && attempt.user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Access denied.' }, { status: 403 })
    }

    const exam = db.prepare('SELECT title, pass_mark FROM exams WHERE id = ?').get(examId) as {
      title: string
      pass_mark: number
    } | undefined

    const totalMarks = attempt.total_marks || 60
    const obtainedMarks = attempt.obtained_marks || 0
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        examTitle: exam?.title || 'Certification Exam',
        totalMarks,
        obtainedMarks,
        percentage,
        isPassed: Boolean(attempt.is_passed),
        passPercentage: exam?.pass_mark || 70,
        correctCount: attempt.correct_answers || 0,
        incorrectCount: attempt.incorrect_answers || 0,
        status: attempt.status
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve result.' }, { status: 500 })
  }
}
