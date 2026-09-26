import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const rows = db.prepare(`
      SELECT cc.id, cc.identifier, cc.created_at,
             c.id as course_id, c.title as course_title, c.slug as course_slug,
             u.name as instructor_name
      FROM course_certificates cc
      JOIN courses c ON cc.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      WHERE cc.user_id = ?
      ORDER BY cc.id DESC
    `).all(user.id) as any[]

    const certificates = rows.map((r) => ({
      id: r.id,
      identifier: r.identifier,
      course_id: r.course_id,
      course_title: r.course_title,
      course_slug: r.course_slug,
      instructor_name: r.instructor_name || 'System Instructor',
      issue_date: r.created_at
        ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'September 2026',
      verify_url: `/certificates/${r.identifier}`
    }))

    return NextResponse.json({
      success: true,
      certificates
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student certificates error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch certificates.' }, { status: 500 })
  }
}
