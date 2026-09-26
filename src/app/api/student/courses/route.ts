import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const rows = db.prepare(`
      SELECT c.id, c.title, c.slug, c.thumbnail, c.level, c.price,
             ce.id as enrollment_id, ce.entry_date, ce.enrollment_type,
             u.name as instructor_name,
             wh.completed_watching,
             (SELECT COUNT(*) FROM section_lessons sl
              JOIN course_sections cs ON sl.course_section_id = cs.id
              WHERE cs.course_id = c.id) as total_lessons
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      LEFT JOIN watch_histories wh ON wh.course_id = c.id AND wh.user_id = ce.user_id
      WHERE ce.user_id = ?
      ORDER BY ce.id DESC
    `).all(user.id) as any[]

    const courses = rows.map((r) => {
      let completedCount = 0
      if (r.completed_watching) {
        try {
          const arr = JSON.parse(r.completed_watching)
          if (Array.isArray(arr)) completedCount = arr.length
        } catch {}
      }

      const totalLessons = r.total_lessons || 1
      const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100))

      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        thumbnail: r.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        instructor_name: r.instructor_name || 'Dr. Angela Yu',
        progress_percent: progressPercent,
        total_lessons: r.total_lessons || 10,
        completed_lessons: completedCount,
        last_accessed: r.entry_date || 'Recently',
        enrollment_date: r.entry_date,
        enrollment_type: r.enrollment_type,
      }
    })

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student courses error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch courses.' }, { status: 500 })
  }
}
