import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    // Verify course exists
    const course = db.prepare(`
      SELECT c.*, u.name as instructor_name, u.photo as instructor_photo, inst.designation as instructor_designation
      FROM courses c
      LEFT JOIN instructors inst ON c.instructor_id = inst.id
      LEFT JOIN users u ON inst.user_id = u.id
      WHERE c.id = ?
    `).get(courseId) as any

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 })
    }

    // Verify student is enrolled (admins and instructors bypass)
    const enrollment = db.prepare(`
      SELECT * FROM course_enrollments WHERE course_id = ? AND user_id = ?
    `).get(courseId, user.id) as any

    if (!enrollment && user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ success: false, message: 'You are not enrolled in this course.' }, { status: 403 })
    }

    // Get watch history for progress calculation
    const watchHistoryRow = db.prepare(`
      SELECT completed_watching FROM watch_histories WHERE course_id = ? AND user_id = ?
    `).get(courseId, user.id) as { completed_watching?: string } | undefined

    let completedLessonIds: number[] = []
    if (watchHistoryRow?.completed_watching) {
      try {
        const parsed = JSON.parse(watchHistoryRow.completed_watching)
        if (Array.isArray(parsed)) completedLessonIds = parsed.map(Number)
      } catch {}
    }

    // 1. Get Course Sections with Lessons and Quizzes
    const sections = db.prepare(`
      SELECT * FROM course_sections WHERE course_id = ? ORDER BY sort ASC, id ASC
    `).all(courseId) as any[]

    let totalLessonsCount = 0

    const populatedSections = sections.map((sec) => {
      const lessons = db.prepare(`
        SELECT * FROM section_lessons WHERE course_section_id = ? ORDER BY sort ASC, id ASC
      `).all(sec.id) as any[]

      totalLessonsCount += lessons.length

      const populatedLessons = lessons.map((l) => ({
        ...l,
        is_completed: completedLessonIds.includes(l.id)
      }))

      const quizzes = db.prepare(`
        SELECT * FROM section_quizzes WHERE course_section_id = ? ORDER BY id ASC
      `).all(sec.id) as any[]

      const populatedQuizzes = quizzes.map((q) => {
        const submission = db.prepare(`
          SELECT * FROM quiz_submissions WHERE section_quiz_id = ? AND user_id = ? ORDER BY total_marks DESC LIMIT 1
        `).get(q.id, user.id) as any

        return {
          ...q,
          submission: submission || null,
          is_passed: submission ? Boolean(submission.is_passed) : false
        }
      })

      return {
        ...sec,
        lessons: populatedLessons,
        quizzes: populatedQuizzes
      }
    })

    const completionPercent = totalLessonsCount > 0
      ? Math.min(100, Math.round((completedLessonIds.length / totalLessonsCount) * 100))
      : 0

    // 2. Get Live Classes
    const liveClasses = db.prepare(`
      SELECT * FROM course_live_classes WHERE course_id = ? ORDER BY class_date_and_time ASC
    `).all(courseId) as any[]

    // 3. Get Course Assignments with Student's Submissions
    const assignments = db.prepare(`
      SELECT * FROM course_assignments WHERE course_id = ? ORDER BY deadline ASC
    `).all(courseId) as any[]

    let totalAssignmentMarks = 0
    let obtainedAssignmentMarks = 0

    const populatedAssignments = assignments.map((a) => {
      totalAssignmentMarks += Number(a.total_mark || 0)

      const submission = db.prepare(`
        SELECT * FROM assignment_submissions
        WHERE course_assignment_id = ? AND user_id = ?
        ORDER BY marks_obtained DESC LIMIT 1
      `).get(a.id, user.id) as any

      if (submission && submission.status === 'graded') {
        obtainedAssignmentMarks += Number(submission.marks_obtained || 0)
      }

      return {
        ...a,
        submission: submission || null
      }
    })

    // 4. Get Quizzes summary for marks calculation
    const allQuizzes = db.prepare(`
      SELECT * FROM section_quizzes WHERE course_id = ?
    `).all(courseId) as any[]

    let totalQuizMarks = 0
    let obtainedQuizMarks = 0

    const populatedAllQuizzes = allQuizzes.map((q) => {
      totalQuizMarks += Number(q.total_mark || 0)

      const bestSub = db.prepare(`
        SELECT * FROM quiz_submissions
        WHERE section_quiz_id = ? AND user_id = ?
        ORDER BY total_marks DESC LIMIT 1
      `).get(q.id, user.id) as any

      if (bestSub) {
        obtainedQuizMarks += Number(bestSub.total_marks || 0)
      }

      return {
        ...q,
        best_submission: bestSub || null
      }
    })

    // Calculate overall grade according to Laravel's StudentService::calculateStudentMarks
    const assignmentPercentage = totalAssignmentMarks > 0
      ? Math.round((obtainedAssignmentMarks / totalAssignmentMarks) * 100)
      : 0

    const quizPercentage = totalQuizMarks > 0
      ? Math.round((obtainedQuizMarks / totalQuizMarks) * 100)
      : 0

    let overallPercentage = 0
    if (totalAssignmentMarks > 0 && totalQuizMarks > 0) {
      overallPercentage = Math.round((assignmentPercentage + quizPercentage) / 2)
    } else if (totalAssignmentMarks > 0) {
      overallPercentage = assignmentPercentage
    } else if (totalQuizMarks > 0) {
      overallPercentage = quizPercentage
    } else {
      overallPercentage = completionPercent
    }

    let grade = 'F'
    if (overallPercentage >= 80) grade = 'A+'
    else if (overallPercentage >= 70) grade = 'A'
    else if (overallPercentage >= 60) grade = 'B'
    else if (overallPercentage >= 50) grade = 'C'
    else if (overallPercentage >= 40) grade = 'D'

    // 5. Get Downloadable Resources
    const resources = db.prepare(`
      SELECT lr.*, sl.title as lesson_title
      FROM lesson_resources lr
      JOIN section_lessons sl ON lr.section_lesson_id = sl.id
      JOIN course_sections cs ON sl.course_section_id = cs.id
      WHERE cs.course_id = ?
      ORDER BY lr.id DESC
    `).all(courseId) as any[]

    // 6. Active Certificate & Marksheet template
    const certificateTemplate = db.prepare(`
      SELECT * FROM certificate_templates WHERE is_active = 1 LIMIT 1
    `).get() as any

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        level: course.level,
        price: course.price,
        short_description: course.short_description,
        description: course.description,
        instructor: {
          name: course.instructor_name || 'Senior Instructor',
          photo: course.instructor_photo || '/assets/avatars/avatar-1.png',
          designation: course.instructor_designation || 'Lead Educator'
        }
      },
      completion: {
        completed_lessons: completedLessonIds.length,
        total_lessons: totalLessonsCount,
        percent: completionPercent
      },
      sections: populatedSections,
      live_classes: liveClasses,
      assignments: populatedAssignments,
      quizzes: populatedAllQuizzes,
      resources,
      student_marks: {
        assignment: {
          total: totalAssignmentMarks,
          obtained: obtainedAssignmentMarks,
          percentage: assignmentPercentage
        },
        quiz: {
          total: totalQuizMarks,
          obtained: obtainedQuizMarks,
          percentage: quizPercentage
        },
        overall: {
          percentage: overallPercentage,
          grade
        }
      },
      certificate_template: certificateTemplate || null
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student course overview error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve course overview.' }, { status: 500 })
  }
}
