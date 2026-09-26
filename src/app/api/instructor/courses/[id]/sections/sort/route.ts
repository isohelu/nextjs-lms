import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const sortSchema = z.object({
  sections: z.array(z.object({
    id: z.number().int().positive(),
    sort: z.number().int().min(0)
  })).optional(),
  section_ids: z.array(z.number().int().positive()).optional(),
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

    // Instructor ownership check
    if (user.role !== 'admin') {
      const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
      const course = db.prepare('SELECT id, instructor_id FROM courses WHERE id = ?').get(courseId) as { id: number; instructor_id: number } | undefined
      if (!course || !instructor || course.instructor_id !== instructor.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized course access.' }, { status: 403 })
      }
    }

    const body = await req.json()
    const validated = sortSchema.parse(body)

    const updateStmt = db.prepare('UPDATE course_sections SET sort = ?, updated_at = ? WHERE id = ? AND course_id = ?')

    const runTransaction = db.transaction(() => {
      const now = new Date().toISOString()
      if (validated.sortedData && validated.sortedData.length > 0) {
        validated.sortedData.forEach((item: any, index: number) => {
          const sid = typeof item === 'object' ? item.id : item
          if (sid) updateStmt.run(index + 1, now, Number(sid), courseId)
        })
      } else if (validated.sections && validated.sections.length > 0) {
        for (const item of validated.sections) {
          updateStmt.run(item.sort, now, item.id, courseId)
        }
      } else if (validated.section_ids && validated.section_ids.length > 0) {
        validated.section_ids.forEach((id, index) => {
          updateStmt.run(index + 1, now, id, courseId)
        })
      }
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Sort sections error:', error)
    return NextResponse.json({ success: false, message: 'Failed to reorder sections.' }, { status: 500 })
  }
}
