import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin', 'instructor'])

    const enrollments = db.prepare(`
      SELECT 
        ee.id,
        ee.entry_date,
        ee.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.photo as user_photo,
        e.id as exam_id,
        e.title as exam_title,
        e.slug as exam_slug
      FROM exam_enrollments ee
      LEFT JOIN users u ON u.id = ee.user_id
      LEFT JOIN exams e ON e.id = ee.exam_id
      ORDER BY ee.id DESC
      LIMIT 100
    `).all()

    return NextResponse.json({
      success: true,
      enrollments
    })
  } catch (error: unknown) {
    console.error('Fetch exam enrollments error:', error)
    return NextResponse.json({ success: false, message: 'Failed to load exam enrollments.' }, { status: 500 })
  }
}
