import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const lessonSchema = z.object({
  course_section_id: z.coerce.number().int().positive().optional(),
  section_id: z.coerce.number().int().positive().optional(),
  title: z.preprocess((val) => String(val ?? '').trim(), z.string().min(1, 'Lesson title is required')),
  lesson_type: z.preprocess(
    (val) => String(val ?? 'video').trim().toLowerCase(),
    z.string().default('video')
  ),
  lesson_src: z.preprocess(
    (val) => (val !== null && val !== undefined && String(val).trim() !== '' ? String(val).trim() : null),
    z.string().nullable().optional()
  ),
  duration: z.preprocess(
    (val) => (val !== null && val !== undefined && String(val).trim() !== '' ? String(val).trim() : null),
    z.string().nullable().optional()
  ),
  is_free: z.preprocess((val) => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'number') return val === 1
    if (typeof val === 'string') return val === '1' || val.toLowerCase() === 'true'
    return false
  }, z.boolean().default(false)),
  lesson_provider: z.preprocess(
    (val) => (val !== null && val !== undefined && String(val).trim() !== '' ? String(val).trim().toLowerCase() : null),
    z.string().nullable().optional()
  ),
  summary: z.preprocess(
    (val) => (val !== null && val !== undefined ? String(val) : null),
    z.string().nullable().optional()
  ),
  description: z.preprocess(
    (val) => (val !== null && val !== undefined ? String(val) : null),
    z.string().nullable().optional()
  )
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const course = courseRepository.findById(courseId)
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 })
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    if (process.env.NODE_ENV !== 'development' && user.role !== 'admin' && (!instructor || course.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this course.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = lessonSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] || parsed.error.issues[0]?.message || 'Invalid lesson data'
      return NextResponse.json(
        { success: false, message: firstError, errors: fieldErrors },
        { status: 422 }
      )
    }

    const data = parsed.data

    // Dynamically resolve section_id
    let targetSectionId = data.course_section_id || data.section_id

    if (!targetSectionId) {
      // Find the first section of this course as fallback
      const firstSection = db.prepare('SELECT id FROM course_sections WHERE course_id = ? ORDER BY sort ASC, id ASC LIMIT 1').get(courseId) as { id: number } | undefined
      if (firstSection) {
        targetSectionId = firstSection.id
      } else {
        // Create an initial default section if course has none
        const newSecRes = db.prepare(`
          INSERT INTO course_sections (title, sort, course_id, created_at, updated_at)
          VALUES ('General Module', 1, ?, datetime('now'), datetime('now'))
        `).run(courseId)
        targetSectionId = Number(newSecRes.lastInsertRowid)
      }
    }

    // Determine lesson provider
    let provider = data.lesson_provider || data.lesson_type
    if (data.lesson_src) {
      if (data.lesson_src.includes('youtube.com') || data.lesson_src.includes('youtu.be')) {
        provider = 'youtube'
      } else if (data.lesson_src.includes('vimeo.com')) {
        provider = 'vimeo'
      }
    }

    const lessonCount = (db.prepare(
      'SELECT COUNT(*) as c FROM section_lessons WHERE course_id = ?'
    ).get(courseId) as { c: number }).c + 1

    const stmt = db.prepare(`
      INSERT INTO section_lessons (
        title, sort, status, lesson_type, lesson_provider, lesson_src, duration,
        is_free, description, summary, lesson_number, course_id, course_section_id,
        created_at, updated_at
      ) VALUES (
        @title, @sort, 1, @lesson_type, @lesson_provider, @lesson_src, @duration,
        @is_free, @description, @summary, @lesson_number, @course_id, @course_section_id,
        datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run({
      title: data.title,
      sort: lessonCount,
      lesson_type: data.lesson_type,
      lesson_provider: provider,
      lesson_src: data.lesson_src,
      duration: data.duration,
      is_free: data.is_free ? 1 : 0,
      description: data.description,
      summary: data.summary,
      lesson_number: lessonCount,
      course_id: courseId,
      course_section_id: targetSectionId
    })

    const newLessonId = Number(res.lastInsertRowid)
    const newLesson = db.prepare('SELECT * FROM section_lessons WHERE id = ?').get(newLessonId)

    return NextResponse.json({
      success: true,
      message: 'Lesson added successfully.',
      id: newLessonId,
      lessonId: newLessonId,
      lesson: newLesson
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create lesson error:', error)
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to create lesson.' }, { status: 500 })
  }
}
