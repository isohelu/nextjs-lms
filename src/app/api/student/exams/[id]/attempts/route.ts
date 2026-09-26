import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin'])
    const { id } = await context.params
    const examId = parseInt(id, 10)

    if (isNaN(examId)) {
      return NextResponse.json({ success: false, message: 'Invalid exam ID.' }, { status: 400 })
    }

    const attempts = examRepository.getAttempts(user.id, examId)

    return NextResponse.json({
      success: true,
      attempts
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch attempts error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve attempts.' },
      { status: 500 }
    )
  }
}
