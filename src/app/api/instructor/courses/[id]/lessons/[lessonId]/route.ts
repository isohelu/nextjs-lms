import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawCourseId, lessonId: rawLessonId } = await params
    const courseId = parseInt(rawCourseId, 10)
    const lessonId = parseInt(rawLessonId, 10)

    if (isNaN(courseId) || isNaN(lessonId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const lesson = db.prepare('SELECT id FROM section_lessons WHERE id = ? AND course_id = ?').get(lessonId, courseId)
    if (!lesson) {
      return NextResponse.json({ success: false, message: 'Lesson not found.' }, { status: 404 })
    }

    db.prepare('DELETE FROM section_lessons WHERE id = ?').run(lessonId)

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Delete lesson error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete lesson.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { id: rawCourseId, lessonId: rawLessonId } = await params
    const courseId = parseInt(rawCourseId, 10)
    const lessonId = parseInt(rawLessonId, 10)

    if (isNaN(courseId) || isNaN(lessonId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const body = await req.json()
    const { title, lesson_type, lesson_provider, lesson_src, duration, is_free, description, summary } = body

    const lesson = db.prepare('SELECT id FROM section_lessons WHERE id = ? AND course_id = ?').get(lessonId, courseId)
    if (!lesson) {
      return NextResponse.json({ success: false, message: 'Lesson not found.' }, { status: 404 })
    }

    let isFreeValue: number | null = null
    if (is_free !== undefined && is_free !== null) {
      if (typeof is_free === 'boolean') isFreeValue = is_free ? 1 : 0
      else if (typeof is_free === 'number') isFreeValue = is_free === 1 ? 1 : 0
      else if (typeof is_free === 'string') isFreeValue = (is_free === '1' || is_free.toLowerCase() === 'true') ? 1 : 0
    }

    let provider: string | null = lesson_provider ? String(lesson_provider).toLowerCase() : (lesson_type ? String(lesson_type).toLowerCase() : null)
    if (lesson_src) {
      if (lesson_src.includes('youtube.com') || lesson_src.includes('youtu.be')) {
        provider = 'youtube'
      } else if (lesson_src.includes('vimeo.com')) {
        provider = 'vimeo'
      }
    }

    db.prepare(`
      UPDATE section_lessons SET
        title = COALESCE(?, title),
        lesson_type = COALESCE(?, lesson_type),
        lesson_provider = COALESCE(?, lesson_provider),
        lesson_src = COALESCE(?, lesson_src),
        duration = COALESCE(?, duration),
        is_free = COALESCE(?, is_free),
        description = COALESCE(?, description),
        summary = COALESCE(?, summary),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title ? String(title).trim() : null,
      lesson_type ? String(lesson_type).toLowerCase() : null,
      provider,
      lesson_src !== undefined ? (lesson_src ? String(lesson_src).trim() : null) : null,
      duration !== undefined ? (duration ? String(duration).trim() : null) : null,
      isFreeValue,
      description !== undefined ? description : null,
      summary !== undefined ? summary : null,
      lessonId
    )

    return NextResponse.json({
      success: true,
      message: 'Lesson updated successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Update lesson error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update lesson.' }, { status: 500 })
  }
}
