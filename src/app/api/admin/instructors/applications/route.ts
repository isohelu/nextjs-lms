import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    await requireRole(['admin'])

    const applications = db.prepare(`
      SELECT ins.id as instructor_id, ins.designation, ins.biography, ins.skills, ins.resume,
             ins.status, ins.created_at,
             u.id as user_id, u.name, u.email, u.photo
      FROM instructors ins
      JOIN users u ON ins.user_id = u.id
      ORDER BY ins.id DESC
    `).all()

    return NextResponse.json({
      success: true,
      applications
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Fetch instructor applications error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve applications.' }, { status: 500 })
  }
}
