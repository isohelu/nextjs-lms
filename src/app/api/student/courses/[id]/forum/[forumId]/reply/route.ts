import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import db from '@/lib/db'

const replySchema = z.object({
  description: z.string().min(2, 'Reply must be at least 2 characters')
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; forumId: string }> }
) {
  try {
    const user = await requireAuth()
    const { forumId } = await context.params
    const forumThreadId = parseInt(forumId, 10)

    if (isNaN(forumThreadId)) {
      return NextResponse.json({ success: false, message: 'Invalid forum thread ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = replySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const stmt = db.prepare(`
      INSERT INTO course_forum_replies (description, user_id, course_forum_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(parsed.data.description, user.id, forumThreadId)

    return NextResponse.json({
      success: true,
      message: 'Reply posted successfully.',
      replyId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to reply.' }, { status: 401 })
    }
    console.error('Post forum reply error:', error)
    return NextResponse.json({ success: false, message: 'Failed to post reply.' }, { status: 500 })
  }
}
