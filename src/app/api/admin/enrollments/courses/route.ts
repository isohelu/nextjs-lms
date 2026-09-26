import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin', 'instructor'])

    const enrollments = db.prepare(`
      SELECT 
        ce.id,
        ce.enrollment_type,
        ce.entry_date,
        ce.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.photo as user_photo,
        c.id as course_id,
        c.title as course_title,
        c.slug as course_slug
      FROM course_enrollments ce
      LEFT JOIN users u ON u.id = ce.user_id
      LEFT JOIN courses c ON c.id = ce.course_id
      ORDER BY ce.id DESC
      LIMIT 100
    `).all()

    return NextResponse.json({
      success: true,
      enrollments
    })
  } catch (error: unknown) {
    console.error('Fetch course enrollments error:', error)
    return NextResponse.json({ success: false, message: 'Failed to load course enrollments.' }, { status: 500 })
  }
}
