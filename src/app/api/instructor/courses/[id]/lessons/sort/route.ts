import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const sortLessonsSchema = z.object({
  lessons: z.array(z.object({
    id: z.number().int().positive(),
    sort: z.number().int().min(0)
  })).optional(),
  lesson_ids: z.array(z.number().int().positive()).optional(),
  sortedData: z.array(z.any()).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const courseId = parseInt(rawId, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    if (user.role !== 'admin') {
      const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
      const course = db.prepare('SELECT id, instructor_id FROM courses WHERE id = ?').get(courseId) as { id: number; instructor_id: number } | undefined
      if (!course || !instructor || course.instructor_id !== instructor.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized course access.' }, { status: 403 })
      }
    }

    const body = await req.json()
    const validated = sortLessonsSchema.parse(body)

    const updateStmt = db.prepare('UPDATE section_lessons SET sort = ?, updated_at = ? WHERE id = ? AND course_id = ?')

    const runTransaction = db.transaction(() => {
      const now = new Date().toISOString()
      if (validated.sortedData && validated.sortedData.length > 0) {
        validated.sortedData.forEach((item: any, index: number) => {
          const lid = typeof item === 'object' ? item.id : item
          if (lid) updateStmt.run(index + 1, now, Number(lid), courseId)
        })
      } else if (validated.lessons && validated.lessons.length > 0) {
        for (const item of validated.lessons) {
          updateStmt.run(item.sort, now, item.id, courseId)
        }
      } else if (validated.lesson_ids && validated.lesson_ids.length > 0) {
        validated.lesson_ids.forEach((id, index) => {
          updateStmt.run(index + 1, now, id, courseId)
        })
      }
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Lessons reordered successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Sort lessons error:', error)
    return NextResponse.json({ success: false, message: 'Failed to reorder lessons.' }, { status: 500 })
  }
}
