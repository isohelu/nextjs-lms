import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id } = await context.params
    const examId = parseInt(id, 10)

    if (isNaN(examId)) {
      return NextResponse.json({ success: false, message: 'Invalid exam ID' }, { status: 400 })
    }

    const examRow = db.prepare(`
      SELECT e.id, e.title, e.slug, e.thumbnail, e.level, e.price,
             e.duration_hours, e.duration_minutes, e.pass_mark, e.total_marks,
             e.total_questions, e.short_description, e.description,
             ee.id as enrollment_id, ee.entry_date, ee.enrollment_type,
             u.name as instructor_name, u.photo as instructor_photo
      FROM exams e
      LEFT JOIN exam_enrollments ee ON ee.exam_id = e.id AND ee.user_id = ?
      LEFT JOIN instructors inst ON e.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      WHERE e.id = ?
    `).get(user.id, examId) as any

    if (!examRow) {
      return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 })
    }

    // Attempts
    const attempts = db.prepare(`
      SELECT id, attempt_number, start_time, end_time, total_marks, obtained_marks, is_passed, status
      FROM exam_attempts
      WHERE exam_id = ? AND user_id = ?
      ORDER BY id DESC
    `).all(examId, user.id) as any[]

    const bestAttempt = attempts.reduce((best: any, current: any) => {
      if (!best || (current.obtained_marks > best.obtained_marks)) {
        return current
      }
      return best
    }, null)

    // Downloadable resources
    const resources = [
      {
        id: 1,
        title: `${examRow.title} - Candidate Study Guide & Exam Blueprint`,
        type: 'PDF',
        file_size: '2.4 MB',
        download_url: '#'
      },
      {
        id: 2,
        title: `${examRow.title} - Sample Practice Questions & Explanation Notes`,
        type: 'PDF',
        file_size: '1.8 MB',
        download_url: '#'
      },
      {
        id: 3,
        title: `${examRow.title} - Quick Reference Cheatsheet & Key Formulas`,
        type: 'DOCX',
        file_size: '850 KB',
        download_url: '#'
      }
    ]

    const totalMarks = examRow.total_marks || 60
    const durationMinutes = (Number(examRow.duration_hours || 0) * 60) + Number(examRow.duration_minutes || 30)

    return NextResponse.json({
      success: true,
      exam: {
        id: examRow.id,
        title: examRow.title,
        slug: examRow.slug,
        thumbnail: examRow.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        instructor_name: examRow.instructor_name || 'Senior LMS Examiner',
        instructor_photo: examRow.instructor_photo || null,
        level: examRow.level || 'Intermediate',
        duration_minutes: durationMinutes,
        total_questions: examRow.total_questions || 7,
        pass_mark: examRow.pass_mark || 70,
        total_marks: totalMarks,
        short_description: examRow.short_description || 'Master key enterprise development concepts and demonstrate technical proficiency.',
        description: examRow.description || 'Comprehensive evaluation covering Next.js architecture, state management, security principles, and backend persistence patterns.',
      },
      attempts,
      bestAttempt,
      resources,
      isEnrolled: !!examRow.enrollment_id
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Fetch student exam error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
