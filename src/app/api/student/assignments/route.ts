import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const rows = db.prepare(`
      SELECT ca.id, ca.title as assignment_title, ca.total_mark, ca.pass_mark, ca.deadline, ca.summary,
             c.id as course_id, c.title as course_title, c.slug as course_slug,
             sub.id as submission_id, sub.status, sub.marks_obtained, sub.submitted_at,
             sub.instructor_feedback, sub.attempt_number, sub.attachment_path
      FROM course_assignments ca
      JOIN courses c ON ca.course_id = c.id
      JOIN course_enrollments ce ON ce.course_id = c.id
      LEFT JOIN assignment_submissions sub ON sub.course_assignment_id = ca.id AND sub.user_id = ce.user_id
      WHERE ce.user_id = ?
      ORDER BY ca.deadline ASC
    `).all(user.id) as any[]

    const assignments = rows.map((r) => {
      let statusLabel = 'Pending Submission'
      let scoreLabel = '—'

      if (r.status === 'graded') {
        statusLabel = 'Graded'
        scoreLabel = `${r.marks_obtained} / ${r.total_mark}`
      } else if (r.status === 'pending') {
        statusLabel = 'Submitted (Reviewing)'
      }

      return {
        id: r.id,
        courseId: r.course_id,
        courseTitle: r.course_title,
        courseSlug: r.course_slug,
        assignmentTitle: r.assignment_title,
        deadline: r.deadline ? new Date(r.deadline).toLocaleDateString() : 'Flexible',
        status: statusLabel,
        score: scoreLabel,
        marksObtained: r.marks_obtained,
        totalMark: r.total_mark,
        submissionId: r.submission_id,
        feedback: r.instructor_feedback,
        attachmentPath: r.attachment_path,
        attemptNumber: r.attempt_number || 1
      }
    })

    return NextResponse.json({
      success: true,
      assignments,
      total: assignments.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student assignments error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve assignments.' }, { status: 500 })
  }
}
