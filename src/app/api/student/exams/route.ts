import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const rows = db.prepare(`
      SELECT e.id, e.title, e.slug, e.thumbnail, e.level, e.price,
             e.duration_hours, e.duration_minutes, e.pass_mark, e.total_marks,
             e.total_questions, e.short_description,
             ee.id as enrollment_id, ee.entry_date, ee.enrollment_type,
             u.name as instructor_name,
             (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.exam_id = e.id AND ea.user_id = ee.user_id) as total_attempts,
             (SELECT MAX(ea.obtained_marks) FROM exam_attempts ea WHERE ea.exam_id = e.id AND ea.user_id = ee.user_id) as best_marks,
             (SELECT ea.is_passed FROM exam_attempts ea WHERE ea.exam_id = e.id AND ea.user_id = ee.user_id ORDER BY ea.obtained_marks DESC LIMIT 1) as best_is_passed
      FROM exam_enrollments ee
      JOIN exams e ON ee.exam_id = e.id
      LEFT JOIN instructors inst ON e.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      WHERE ee.user_id = ?
      ORDER BY ee.id DESC
    `).all(user.id) as any[]

    const exams = rows.map((r) => {
      const totalMarks = r.total_marks || 100
      const bestMarks = r.best_marks !== null ? Number(r.best_marks) : null
      const bestPercent = bestMarks !== null ? Math.round((bestMarks / totalMarks) * 100) : null
      const durationTotalMin = (Number(r.duration_hours || 0) * 60) + Number(r.duration_minutes || 0)

      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        thumbnail: r.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        instructor_name: r.instructor_name || 'Senior Examiner',
        level: r.level || 'Intermediate',
        duration_minutes: durationTotalMin || 60,
        total_questions: r.total_questions || 50,
        pass_mark: r.pass_mark || 60,
        total_marks: totalMarks,
        total_attempts: r.total_attempts || 0,
        best_marks: bestMarks,
        best_percent: bestPercent,
        is_passed: r.best_is_passed === 1 || r.best_is_passed === true,
        short_description: r.short_description || '',
        enrollment_date: r.entry_date || 'Recently',
        enrollment_type: r.enrollment_type || 'standard'
      }
    })

    return NextResponse.json({
      success: true,
      exams,
      total: exams.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student enrolled exams error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve enrolled exams.' }, { status: 500 })
  }
}
