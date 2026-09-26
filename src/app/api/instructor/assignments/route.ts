import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])

    let instructorId: number | undefined
    if (user.role !== 'admin') {
      const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
      instructorId = instructor?.id
    }

    let query = `
      SELECT asub.id, asub.course_assignment_id, asub.user_id, asub.attachment_type,
             asub.attachment_path, asub.comment, asub.submitted_at, asub.marks_obtained,
             asub.instructor_feedback, asub.status, asub.attempt_number,
             ca.title as assignment_title, ca.total_mark, ca.pass_mark, ca.deadline,
             c.id as course_id, c.title as course_title,
             u.name as student_name, u.email as student_email, u.photo as student_photo
      FROM assignment_submissions asub
      JOIN course_assignments ca ON asub.course_assignment_id = ca.id
      JOIN courses c ON ca.course_id = c.id
      JOIN users u ON asub.user_id = u.id
    `

    const params: any[] = []
    if (instructorId) {
      query += ` WHERE c.instructor_id = ?`
      params.push(instructorId)
    }

    query += ` ORDER BY asub.id DESC LIMIT 100`

    const rows = db.prepare(query).all(...params) as any[]

    const submissions = rows.map((r) => ({
      id: String(r.id),
      studentName: r.student_name || 'Student',
      studentEmail: r.student_email || 'student@example.com',
      studentPhoto: r.student_photo || '/assets/avatars/avatar-1.png',
      courseTitle: r.course_title,
      assignmentTitle: r.assignment_title,
      submittedAt: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'Recently',
      repoUrl: r.attachment_path || '#',
      notes: r.comment || '',
      status: r.status === 'graded' ? 'Graded' : 'Pending',
      score: r.marks_obtained !== null ? Number(r.marks_obtained) : undefined,
      totalMark: r.total_mark,
      feedback: r.instructor_feedback || ''
    }))

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch instructor submissions error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve submissions.' }, { status: 500 })
  }
}
