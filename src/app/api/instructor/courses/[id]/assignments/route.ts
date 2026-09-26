import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireInstructor } from '@/lib/auth/session'
import db from '@/lib/db'

const assignmentSchema = z.object({
  title: z.string().min(3),
  total_mark: z.number().positive(),
  pass_mark: z.number().positive(),
  retake: z.number().int().min(1).default(1),
  summary: z.string().optional(),
  deadline: z.string().optional(),
  late_submission: z.boolean().default(false),
  late_total_mark: z.number().default(0),
  late_deadline: z.string().optional()
})

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await context.params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID' }, { status: 400 })
    }

    const assignments = db.prepare(`
      SELECT ca.*,
             (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.course_assignment_id = ca.id) as total_submissions,
             (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.course_assignment_id = ca.id AND asub.status = 'pending') as pending_grading
      FROM course_assignments ca
      WHERE ca.course_id = ?
      ORDER BY ca.id ASC
    `).all(courseId)

    return NextResponse.json({
      success: true,
      assignments
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireInstructor()
    const { id } = await context.params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = assignmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const stmt = db.prepare(`
      INSERT INTO course_assignments (
        title, total_mark, pass_mark, retake, summary,
        deadline, late_submission, late_total_mark, late_deadline,
        course_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(
      parsed.data.title,
      parsed.data.total_mark,
      parsed.data.pass_mark,
      parsed.data.retake,
      parsed.data.summary || null,
      parsed.data.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      parsed.data.late_submission ? 1 : 0,
      parsed.data.late_total_mark,
      parsed.data.late_deadline || null,
      courseId
    )

    return NextResponse.json({
      success: true,
      message: 'Course assignment created successfully.',
      assignmentId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    console.error('Create assignment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create assignment' }, { status: 500 })
  }
}
