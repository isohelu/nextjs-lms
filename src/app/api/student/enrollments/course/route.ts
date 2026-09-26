import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'

const enrollSchema = z.object({
  course_id: z.number().int().positive()
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin'])
    const body = await req.json()
    const parsed = enrollSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { course_id } = parsed.data
    const course = courseRepository.findById(course_id)
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found.' },
        { status: 404 }
      )
    }

    const alreadyEnrolled = courseRepository.isEnrolled(user.id, course_id)
    if (alreadyEnrolled) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this course.',
        enrolled: true
      })
    }

    const success = courseRepository.enroll(user.id, course_id, course.pricing_type || 'free')

    return NextResponse.json({
      success,
      message: 'Successfully enrolled in course.',
      enrolled: true
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please log in.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Students only.' }, { status: 403 })
    }
    console.error('Course enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to enroll in course.' },
      { status: 500 }
    )
  }
}
