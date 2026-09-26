import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const rows = db.prepare(`
      SELECT clc.id, clc.class_topic, clc.provider, clc.class_date_and_time,
             clc.class_note, clc.additional_info,
             c.id as course_id, c.title as course_title,
             u.name as instructor_name
      FROM course_live_classes clc
      JOIN courses c ON clc.course_id = c.id
      JOIN course_enrollments ce ON ce.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      WHERE ce.user_id = ?
      ORDER BY clc.class_date_and_time ASC
    `).all(user.id) as any[]

    const classes = rows.map((r) => {
      const classDate = r.class_date_and_time ? new Date(r.class_date_and_time) : new Date()
      return {
        id: r.id,
        courseId: r.course_id,
        courseTitle: r.course_title,
        title: r.class_topic,
        instructor: r.instructor_name || 'Senior Educator',
        date: classDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
        time: classDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: classDate > new Date() ? 'Scheduled' : 'Past Session',
        platform: r.provider || 'Zoom Video Conferencing',
        joinUrl: r.additional_info || 'https://zoom.us',
        note: r.class_note
      }
    })

    return NextResponse.json({
      success: true,
      classes,
      total: classes.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student live classes error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve live classes.' }, { status: 500 })
  }
}
