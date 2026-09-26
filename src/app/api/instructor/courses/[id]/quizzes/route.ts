import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const quizSchema = z.object({
  course_section_id: z.coerce.number().int().positive().optional(),
  section_id: z.coerce.number().int().positive().optional(),
  title: z.preprocess((val) => String(val ?? '').trim(), z.string().min(1, 'Quiz title is required')),
  total_marks: z.coerce.number().optional().default(10),
  pass_mark: z.coerce.number().optional().default(5),
  hours: z.coerce.number().optional().default(0),
  minutes: z.coerce.number().optional().default(30),
  seconds: z.coerce.number().optional().default(0),
  retake: z.coerce.number().optional().default(1),
  summary: z.string().optional().default(''),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const quizzes = db.prepare(
      'SELECT id, title, total_mark as total_marks, pass_mark, duration, hours, minutes, course_section_id, course_id FROM section_quizzes WHERE course_id = ? ORDER BY id ASC'
    ).all(courseId)

    return NextResponse.json({ success: true, quizzes })
  } catch (error: unknown) {
    console.error('Fetch quizzes error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve quizzes.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = quizSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] || parsed.error.issues[0]?.message || 'Invalid quiz data'
      return NextResponse.json(
        { success: false, message: firstError, errors: fieldErrors },
        { status: 422 }
      )
    }

    const validated = parsed.data
    let targetSectionId = validated.course_section_id || validated.section_id

    if (!targetSectionId) {
      const firstSection = db.prepare('SELECT id FROM course_sections WHERE course_id = ? ORDER BY sort ASC, id ASC LIMIT 1').get(courseId) as { id: number } | undefined
      if (firstSection) {
        targetSectionId = firstSection.id
      } else {
        const newSec = db.prepare(`
          INSERT INTO course_sections (title, sort, course_id, created_at, updated_at)
          VALUES ('General Module', 1, ?, datetime('now'), datetime('now'))
        `).run(courseId)
        targetSectionId = Number(newSec.lastInsertRowid)
      }
    }

    const now = new Date().toISOString()
    const duration = `${String(validated.hours || 0).padStart(2, '0')}:${String(validated.minutes || 30).padStart(2, '0')}:${String(validated.seconds || 0).padStart(2, '0')}`

    const result = db.prepare(`
      INSERT INTO section_quizzes (
        title, duration, hours, minutes, seconds,
        total_mark, pass_mark, retake, summary, course_id, course_section_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      validated.title,
      duration,
      validated.hours,
      validated.minutes,
      validated.seconds || 0,
      validated.total_marks,
      validated.pass_mark,
      validated.retake || 1,
      validated.summary || '',
      courseId,
      targetSectionId,
      now,
      now
    )

    const quizId = Number(result.lastInsertRowid)

    return NextResponse.json({
      success: true,
      message: 'Quiz created successfully!',
      id: quizId,
      quizId,
      quiz: {
        id: quizId,
        title: validated.title,
        course_section_id: targetSectionId,
        total_marks: validated.total_marks,
        pass_mark: validated.pass_mark,
        hours: validated.hours,
        minutes: validated.minutes,
        seconds: validated.seconds || 0,
        retake: validated.retake || 1,
        summary: validated.summary || ''
      }
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Create quiz error:', error)
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to create quiz.' }, { status: 500 })
  }
}
