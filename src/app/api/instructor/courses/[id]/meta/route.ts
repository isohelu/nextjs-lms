import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const metaSchema = z.object({
  type: z.enum(['faq', 'outcome', 'requirement']),
  question: z.string().optional(),
  answer: z.string().optional(),
  outcome: z.string().optional(),
  requirement: z.string().optional(),
  sort: z.number().default(0)
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const faqs = db.prepare('SELECT * FROM course_faqs WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)
    const outcomes = db.prepare('SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)
    const requirements = db.prepare('SELECT * FROM course_requirements WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)

    return NextResponse.json({
      success: true,
      faqs,
      outcomes,
      requirements
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch course meta error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve course metadata.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const body = await req.json()
    const validated = metaSchema.parse(body)
    const now = new Date().toISOString()

    let newId = 0
    if (validated.type === 'faq') {
      if (!validated.question || !validated.answer) {
        return NextResponse.json({ success: false, message: 'Question and answer are required for FAQs.' }, { status: 400 })
      }
      const res = db.prepare(`
        INSERT INTO course_faqs (course_id, question, answer, sort, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(courseId, validated.question, validated.answer, validated.sort, now, now)
      newId = Number(res.lastInsertRowid)
    } else if (validated.type === 'outcome') {
      if (!validated.outcome) {
        return NextResponse.json({ success: false, message: 'Outcome text is required.' }, { status: 400 })
      }
      const res = db.prepare(`
        INSERT INTO course_outcomes (course_id, outcome, sort, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(courseId, validated.outcome, validated.sort, now, now)
      newId = Number(res.lastInsertRowid)
    } else if (validated.type === 'requirement') {
      if (!validated.requirement) {
        return NextResponse.json({ success: false, message: 'Requirement text is required.' }, { status: 400 })
      }
      const res = db.prepare(`
        INSERT INTO course_requirements (course_id, requirement, sort, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(courseId, validated.requirement, validated.sort, now, now)
      newId = Number(res.lastInsertRowid)
    }

    return NextResponse.json({
      success: true,
      message: 'Course item added successfully!',
      id: newId
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Add course meta error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add item.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const itemId = parseInt(url.searchParams.get('itemId') || '0', 10)

    if (!type || !itemId) {
      return NextResponse.json({ success: false, message: 'Item type and itemId are required.' }, { status: 400 })
    }

    if (type === 'faq') {
      db.prepare('DELETE FROM course_faqs WHERE id = ? AND course_id = ?').run(itemId, courseId)
    } else if (type === 'outcome') {
      db.prepare('DELETE FROM course_outcomes WHERE id = ? AND course_id = ?').run(itemId, courseId)
    } else if (type === 'requirement') {
      db.prepare('DELETE FROM course_requirements WHERE id = ? AND course_id = ?').run(itemId, courseId)
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Delete course meta error:', error)
    return NextResponse.json({ success: false, message: 'Failed to remove item.' }, { status: 500 })
  }
}
