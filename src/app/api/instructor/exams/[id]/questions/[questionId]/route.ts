import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawExamId, questionId: rawQuestionId } = await params
    const examId = parseInt(rawExamId, 10)
    const questionId = parseInt(rawQuestionId, 10)

    if (isNaN(examId) || isNaN(questionId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const question = db.prepare('SELECT id FROM exam_questions WHERE id = ? AND exam_id = ?').get(questionId, examId)
    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 })
    }

    const runTransaction = db.transaction(() => {
      db.prepare('DELETE FROM exam_question_options WHERE exam_question_id = ?').run(questionId)
      db.prepare('DELETE FROM exam_questions WHERE id = ?').run(questionId)
      db.prepare('UPDATE exams SET total_questions = MAX(0, total_questions - 1) WHERE id = ?').run(examId)
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Delete question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete question.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawExamId, questionId: rawQuestionId } = await params
    const examId = parseInt(rawExamId, 10)
    const questionId = parseInt(rawQuestionId, 10)

    if (isNaN(examId) || isNaN(questionId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const body = await req.json()
    const { title, marks, question_type, options } = body

    const question = db.prepare('SELECT id FROM exam_questions WHERE id = ? AND exam_id = ?').get(questionId, examId)
    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 })
    }

    const runTransaction = db.transaction(() => {
      if (title || marks !== undefined || question_type) {
        db.prepare(`
          UPDATE exam_questions SET
            title = COALESCE(?, title),
            marks = COALESCE(?, marks),
            question_type = COALESCE(?, question_type),
            updated_at = datetime('now')
          WHERE id = ?
        `).run(title, marks, question_type, questionId)
      }

      if (Array.isArray(options)) {
        db.prepare('DELETE FROM exam_question_options WHERE exam_question_id = ?').run(questionId)
        const insertOpt = db.prepare(`
          INSERT INTO exam_question_options (exam_question_id, option_text, is_correct, sort, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `)
        options.forEach((opt: { option_text: string; is_correct?: boolean | number }, idx: number) => {
          insertOpt.run(questionId, opt.option_text, opt.is_correct ? 1 : 0, idx + 1)
        })
      }
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Update question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update question.' }, { status: 500 })
  }
}
