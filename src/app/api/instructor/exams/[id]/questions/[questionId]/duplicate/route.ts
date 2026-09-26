import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawExamId, questionId: rawQuestionId } = await params
    const examId = parseInt(rawExamId, 10)
    const questionId = parseInt(rawQuestionId, 10)

    if (isNaN(examId) || isNaN(questionId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const question = db.prepare('SELECT * FROM exam_questions WHERE id = ? AND exam_id = ?').get(questionId, examId) as any

    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 })
    }

    const options = db.prepare('SELECT * FROM exam_question_options WHERE exam_question_id = ?').all(questionId) as any[]

    const now = new Date().toISOString()
    let newQuestionId = 0

    const runTransaction = db.transaction(() => {
      const qRes = db.prepare(`
        INSERT INTO exam_questions (
          exam_id, question_type, title, description, marks, sort, options, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        examId,
        question.question_type,
        `${question.title} (Copy)`,
        question.description,
        question.marks,
        (question.sort || 0) + 1,
        question.options,
        now,
        now
      )

      newQuestionId = Number(qRes.lastInsertRowid)

      const optStmt = db.prepare(`
        INSERT INTO exam_question_options (
          exam_question_id, option_text, is_correct, sort, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (const opt of options) {
        optStmt.run(newQuestionId, opt.option_text, opt.is_correct, opt.sort, now, now)
      }
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Question duplicated successfully!',
      questionId: newQuestionId
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Duplicate question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to duplicate question.' }, { status: 500 })
  }
}
