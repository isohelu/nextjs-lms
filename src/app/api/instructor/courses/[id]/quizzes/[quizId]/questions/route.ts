import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const { quizId } = await params
    const qid = parseInt(quizId, 10)
    if (isNaN(qid)) {
      return NextResponse.json({ success: false, message: 'Invalid quiz ID' }, { status: 400 })
    }

    const questions = courseRepository.getQuizQuestions(qid)
    return NextResponse.json({ success: true, questions })
  } catch (error: unknown) {
    console.error('Get quiz questions error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve questions' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    const { quizId } = await params
    const qid = parseInt(quizId, 10)
    if (isNaN(qid)) {
      return NextResponse.json({ success: false, message: 'Invalid quiz ID' }, { status: 400 })
    }

    const body = await req.json()
    const { title, options, answer, sort } = body
    const finalType = body.type || body.question_type || 'single'

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })
    }

    const created = courseRepository.addQuizQuestion({
      title,
      type: finalType,
      options: typeof options === 'string' ? options : JSON.stringify(options || []),
      answer: typeof answer === 'string' ? answer : JSON.stringify(answer || ''),
      sort: sort || 1,
      section_quiz_id: qid,
    })

    return NextResponse.json({
      success: true,
      message: 'Question added successfully',
      question: created,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Create quiz question error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create question' }, { status: 500 })
  }
}
