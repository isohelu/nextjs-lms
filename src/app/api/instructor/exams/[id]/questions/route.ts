import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'
import db from '@/lib/db'

const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional().nullable(),
  question_type: z.enum([
    'multiple_choice',
    'multiple_select',
    'matching',
    'fill_blank',
    'ordering',
    'short_answer',
    'listening',
  ]).default('multiple_choice'),
  marks: z.coerce.number().min(0.5).default(1),
  options: z.array(
    z.object({
      option_text: z.string().min(1, 'Option text is required'),
      is_correct: z.union([z.boolean(), z.number()]).transform((val) => Boolean(val)).default(false)
    })
  ).optional().default([])
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id } = await context.params
    const examId = parseInt(id, 10)

    if (isNaN(examId)) {
      return NextResponse.json({ success: false, message: 'Invalid exam ID.' }, { status: 400 })
    }

    const exam = examRepository.findById(examId)
    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found.' }, { status: 404 })
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    if (user.role !== 'admin' && (!instructor || exam.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this exam.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = questionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { title, description, question_type, marks, options } = parsed.data

    const qCount = (db.prepare(
      'SELECT COUNT(*) as c FROM exam_questions WHERE exam_id = ?'
    ).get(examId) as { c: number }).c + 1

    const insertQ = db.prepare(`
      INSERT INTO exam_questions (exam_id, question_type, title, description, marks, sort, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const insertOpt = db.prepare(`
      INSERT INTO exam_question_options (exam_question_id, option_text, is_correct, sort, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const transaction = db.transaction(() => {
      const qRes = insertQ.run(examId, question_type, title, description || null, marks, qCount)
      const questionId = Number(qRes.lastInsertRowid)

      if (Array.isArray(options) && options.length > 0) {
        options.forEach((opt, idx) => {
          insertOpt.run(questionId, opt.option_text, opt.is_correct ? 1 : 0, idx + 1)
        })
      }

      // Update total_questions in exams table
      db.prepare(`UPDATE exams SET total_questions = total_questions + 1 WHERE id = ?`).run(examId)

      return questionId
    })

    const questionId = transaction()

    return NextResponse.json({
      success: true,
      message: 'Question added successfully.',
      questionId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create exam question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add question.' }, { status: 500 })
  }
}
