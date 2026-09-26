import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawCourseId, sectionId: rawSectionId } = await params
    const courseId = parseInt(rawCourseId, 10)
    const sectionId = parseInt(rawSectionId, 10)

    if (isNaN(courseId) || isNaN(sectionId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const section = db.prepare('SELECT id FROM course_sections WHERE id = ? AND course_id = ?').get(sectionId, courseId)
    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found.' }, { status: 404 })
    }

    const runTransaction = db.transaction(() => {
      db.prepare('DELETE FROM section_lessons WHERE course_section_id = ?').run(sectionId)
      db.prepare('DELETE FROM course_sections WHERE id = ?').run(sectionId)
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Delete section error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete section.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawCourseId, sectionId: rawSectionId } = await params
    const courseId = parseInt(rawCourseId, 10)
    const sectionId = parseInt(rawSectionId, 10)

    if (isNaN(courseId) || isNaN(sectionId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const body = await req.json()
    const { title, sort } = body

    const section = db.prepare('SELECT id FROM course_sections WHERE id = ? AND course_id = ?').get(sectionId, courseId)
    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found.' }, { status: 404 })
    }

    db.prepare(`
      UPDATE course_sections SET
        title = COALESCE(?, title),
        sort = COALESCE(?, sort),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(title, sort, sectionId)

    return NextResponse.json({
      success: true,
      message: 'Section updated successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Update section error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update section.' }, { status: 500 })
  }
}
