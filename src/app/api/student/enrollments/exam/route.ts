import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'

const enrollSchema = z.object({
  exam_id: z.number().int().positive()
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

    const { exam_id } = parsed.data
    const exam = examRepository.findById(exam_id)
    if (!exam) {
      return NextResponse.json(
        { success: false, message: 'Exam not found.' },
        { status: 404 }
      )
    }

    const alreadyEnrolled = examRepository.isEnrolled(user.id, exam_id)
    if (alreadyEnrolled) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this exam.',
        enrolled: true
      })
    }

    const success = examRepository.enroll(user.id, exam_id, exam.pricing_type || 'free')

    return NextResponse.json({
      success,
      message: 'Successfully enrolled in exam.',
      enrolled: true
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Exam enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to enroll in exam.' },
      { status: 500 }
    )
  }
}
