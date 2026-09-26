import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    const cert = db.prepare(`
      SELECT cc.identifier, cc.created_at as issue_date,
             u.name as student_name,
             c.title as course_title,
             inst_user.name as instructor_name
      FROM course_certificates cc
      JOIN users u ON cc.user_id = u.id
      JOIN courses c ON cc.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      LEFT JOIN users inst_user ON inst.user_id = inst_user.id
      WHERE cc.identifier = ?
      LIMIT 1
    `).get(code) as Record<string, unknown> | undefined

    if (!cert) {
      return NextResponse.json({
        success: false,
        message: 'No certificate found with this verification identifier.'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      certificate: cert
    })
  } catch (error: unknown) {
    console.error('Certificate verification error:', error)
    return NextResponse.json({ success: false, message: 'Failed to verify certificate.' }, { status: 500 })
  }
}
