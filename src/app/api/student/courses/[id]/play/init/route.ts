import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const course = courseRepository.findById(courseId)
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 })
    }

    // Role check: Instructor of course or enrolled student or admin
    const isOwnerInstructor = user.role === 'instructor' && course.instructor_id === user.id
    const isEnrolled = courseRepository.isEnrolled(user.id, courseId)

    if (user.role !== 'admin' && !isOwnerInstructor && !isEnrolled) {
      return NextResponse.json(
        { success: false, message: 'You must enroll in this course to access the player.' },
        { status: 403 }
      )
    }

    const curriculum = courseRepository.getCurriculum(courseId)
    const firstSection = curriculum[0]
    const firstLesson = firstSection?.lessons?.[0]

    let watchHistory = db.prepare(`
      SELECT * FROM watch_histories WHERE user_id = ? AND course_id = ? LIMIT 1
    `).get(user.id, courseId) as Record<string, unknown> | undefined

    if (!watchHistory) {
      const insertStmt = db.prepare(`
        INSERT INTO watch_histories (
          current_section_id, current_watching_id, current_watching_type,
          completed_watching, user_id, course_id, created_at, updated_at
        ) VALUES (
          ?, ?, 'lesson', '[]', ?, ?, datetime('now'), datetime('now')
        )
      `)
      const res = insertStmt.run(
        firstSection ? String(firstSection.id) : '',
        firstLesson ? String(firstLesson.id) : '',
        user.id,
        courseId
      )
      watchHistory = db.prepare('SELECT * FROM watch_histories WHERE id = ?').get(res.lastInsertRowid) as Record<string, unknown>
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail
      },
      watchHistory,
      curriculum
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Course player init error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to initialize player.' },
      { status: 500 }
    )
  }
}
