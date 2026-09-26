import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const classes = db.prepare(`
      SELECT * FROM course_live_classes WHERE course_id = ? ORDER BY class_date_and_time ASC
    `).all(courseId) as any[]

    return NextResponse.json({
      success: true,
      classes,
      total: classes.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch live classes error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve live classes.' }, { status: 500 })
  }
}
