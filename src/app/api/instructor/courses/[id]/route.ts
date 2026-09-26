import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

export async function PUT(
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
    if (user.role !== 'admin' && (!instructor || course.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this course.' }, { status: 403 })
    }

    const body = await req.json()
    const updated = courseRepository.update(courseId, body)

    return NextResponse.json({
      success: updated,
      message: updated ? 'Course updated successfully.' : 'No fields updated.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Update course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update course.' }, { status: 500 })
  }
}

export async function DELETE(
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
    if (user.role !== 'admin' && (!instructor || course.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this course.' }, { status: 403 })
    }

    const deleted = courseRepository.delete(courseId)

    return NextResponse.json({
      success: deleted,
      message: 'Course deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Delete course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete course.' }, { status: 500 })
  }
}
