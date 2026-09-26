import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const sectionSchema = z.object({
  title: z.preprocess((val) => String(val ?? '').trim(), z.string().min(1, 'Section title is required')),
  sort: z.coerce.number().int().optional()
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
    const parsed = sectionSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] || parsed.error.issues[0]?.message || 'Invalid section title'
      return NextResponse.json(
        { success: false, message: firstError, errors: fieldErrors },
        { status: 422 }
      )
    }

    const currentSectionsCount = (db.prepare(
      'SELECT COUNT(*) as c FROM course_sections WHERE course_id = ?'
    ).get(courseId) as { c: number }).c

    const sort = parsed.data.sort ?? (currentSectionsCount + 1)

    const stmt = db.prepare(`
      INSERT INTO course_sections (title, sort, course_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `)
    const result = stmt.run(parsed.data.title, sort, courseId)
    const newSectionId = Number(result.lastInsertRowid)

    return NextResponse.json({
      success: true,
      message: 'Section created successfully.',
      id: newSectionId,
      sectionId: newSectionId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create section error:', error)
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to create section.' }, { status: 500 })
  }
}
