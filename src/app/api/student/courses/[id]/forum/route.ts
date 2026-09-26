import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import db from '@/lib/db'

const forumSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  section_lesson_id: z.number().int().positive().optional()
})

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const forums = db.prepare(`
      SELECT cf.*, u.name as user_name, u.photo as user_photo,
             (SELECT COUNT(*) FROM course_forum_replies cfr WHERE cfr.course_forum_id = cf.id) as replies_count
      FROM course_forums cf
      JOIN users u ON cf.user_id = u.id
      WHERE cf.course_id = ?
      ORDER BY cf.id DESC
    `).all(courseId)

    return NextResponse.json({
      success: true,
      forums
    })
  } catch (error: unknown) {
    console.error('Fetch forums error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve discussion threads.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = forumSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const lessonId = parsed.data.section_lesson_id || 1

    const stmt = db.prepare(`
      INSERT INTO course_forums (
        title, description, likes, dislikes, user_id, course_id, section_lesson_id, created_at, updated_at
      ) VALUES (
        ?, ?, '[]', '[]', ?, ?, ?, datetime('now'), datetime('now')
      )
    `)
    const res = stmt.run(parsed.data.title, parsed.data.description, user.id, courseId, lessonId)

    return NextResponse.json({
      success: true,
      message: 'Discussion question posted successfully.',
      forumId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to participate in discussions.' }, { status: 401 })
    }
    console.error('Post forum error:', error)
    return NextResponse.json({ success: false, message: 'Failed to post question.' }, { status: 500 })
  }
}
