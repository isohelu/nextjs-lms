import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string; questionId: string }> }
) {
  try {
    const { questionId } = await params
    const qid = parseInt(questionId, 10)
    if (isNaN(qid)) {
      return NextResponse.json({ success: false, message: 'Invalid question ID' }, { status: 400 })
    }

    const deleted = courseRepository.deleteQuizQuestion(qid)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Question deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete question' }, { status: 500 })
  }
}
