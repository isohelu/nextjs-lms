import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()) // { questionId: submittedAnswer }
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin'])
    const { id, quizId } = await context.params
    const courseId = parseInt(id, 10)
    const sectionQuizId = parseInt(quizId, 10)

    if (isNaN(courseId) || isNaN(sectionQuizId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    if (user.role !== 'admin' && !courseRepository.isEnrolled(user.id, courseId)) {
      return NextResponse.json({ success: false, message: 'Enrollment required.' }, { status: 403 })
    }

    const quiz = db.prepare('SELECT * FROM section_quizzes WHERE id = ?').get(sectionQuizId) as {
      id: number
      total_mark: number
      pass_mark: number
    } | undefined

    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz not found.' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const userAnswers = parsed.data.answers
    const questions = db.prepare('SELECT * FROM quiz_questions WHERE section_quiz_id = ?').all(sectionQuizId) as {
      id: number
      title: string
      answer: string
    }[]

    let correctCount = 0
    let incorrectCount = 0

    for (const q of questions) {
      const submitted = (userAnswers[String(q.id)] || '').trim().toLowerCase()
      const correct = (q.answer || '').trim().toLowerCase()
      if (submitted && submitted === correct) {
        correctCount++
      } else {
        incorrectCount++
      }
    }

    const totalQuestions = questions.length || 1
    const totalMark = quiz.total_mark || 100
    const marksPerQ = totalMark / totalQuestions
    const obtainedMarks = Math.round(correctCount * marksPerQ)
    const isPassed = obtainedMarks >= (quiz.pass_mark || 50) ? 1 : 0

    // Count prior attempts
    const priorAttempts = (db.prepare(`
      SELECT COUNT(*) as c FROM quiz_submissions WHERE user_id = ? AND section_quiz_id = ?
    `).get(user.id, sectionQuizId) as { c: number }).c + 1

    const insertStmt = db.prepare(`
      INSERT INTO quiz_submissions (
        attempts, correct_answers, incorrect_answers, total_marks, is_passed,
        user_id, section_quiz_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
      )
    `)
    insertStmt.run(
      priorAttempts,
      correctCount,
      incorrectCount,
      obtainedMarks,
      isPassed,
      user.id,
      sectionQuizId
    )

    return NextResponse.json({
      success: true,
      result: {
        totalMarks: totalMark,
        obtainedMarks,
        correctCount,
        incorrectCount,
        isPassed: isPassed === 1,
        attempts: priorAttempts
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit quiz.' },
      { status: 500 }
    )
  }
}
