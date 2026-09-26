import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const liveClassSchema = z.object({
  class_topic: z.string().min(3, 'Topic must be at least 3 characters'),
  provider: z.string().default('Zoom'),
  class_date_and_time: z.string().min(1, 'Date and time is required'),
  class_note: z.string().optional(),
  additional_info: z.string().optional()
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

    const classes = db.prepare('SELECT * FROM course_live_classes WHERE course_id = ? ORDER BY class_date_and_time ASC').all(courseId)

    return NextResponse.json({
      success: true,
      classes,
      total: classes.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch instructor live classes error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve live classes.' }, { status: 500 })
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
    const validated = liveClassSchema.parse(body)
    const now = new Date().toISOString()

    const result = db.prepare(`
      INSERT INTO course_live_classes (
        course_id, class_topic, provider, class_date_and_time, class_note, additional_info, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      courseId,
      validated.class_topic,
      validated.provider,
      validated.class_date_and_time,
      validated.class_note || '',
      validated.additional_info || '',
      now,
      now
    )

    return NextResponse.json({
      success: true,
      message: 'Live session scheduled successfully!',
      id: result.lastInsertRowid
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Create live class error:', error)
    return NextResponse.json({ success: false, message: 'Failed to schedule live class.' }, { status: 500 })
  }
}
