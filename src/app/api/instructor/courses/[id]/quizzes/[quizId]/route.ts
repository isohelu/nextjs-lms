import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { quizId } = await params
    const qId = parseInt(quizId, 10)

    if (isNaN(qId)) {
      return NextResponse.json({ success: false, message: 'Invalid quiz ID.' }, { status: 400 })
    }

    const result = db.prepare('DELETE FROM section_quizzes WHERE id = ?').run(qId)
    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Quiz not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Quiz deleted successfully.' })
  } catch (error: unknown) {
    console.error('Delete quiz error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete quiz.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> }
) {
  try {
    await requireRole(['instructor', 'admin'])
    const { quizId } = await params
    const qId = parseInt(quizId, 10)

    if (isNaN(qId)) {
      return NextResponse.json({ success: false, message: 'Invalid quiz ID.' }, { status: 400 })
    }

    const body = await req.json()
    const now = new Date().toISOString()

    const fields: string[] = ['updated_at = ?']
    const values: (string | number)[] = [now]

    if (body.title) {
      fields.push('title = ?')
      values.push(body.title)
    }
    if (body.total_marks !== undefined) {
      fields.push('total_mark = ?')
      values.push(body.total_marks)
    }
    if (body.pass_mark !== undefined) {
      fields.push('pass_mark = ?')
      values.push(body.pass_mark)
    }
    if (body.hours !== undefined) {
      fields.push('hours = ?')
      values.push(body.hours)
    }
    if (body.minutes !== undefined) {
      fields.push('minutes = ?')
      values.push(body.minutes)
    }
    if (body.seconds !== undefined) {
      fields.push('seconds = ?')
      values.push(body.seconds)
    }
    if (body.retake !== undefined) {
      fields.push('retake = ?')
      values.push(body.retake)
    }
    if (body.summary !== undefined) {
      fields.push('summary = ?')
      values.push(body.summary)
    }

    values.push(qId)
    const result = db.prepare(`UPDATE section_quizzes SET ${fields.join(', ')} WHERE id = ?`).run(...values)

    return NextResponse.json({ success: result.changes > 0, message: 'Quiz updated.' })
  } catch (error: unknown) {
    console.error('Update quiz error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update quiz.' }, { status: 500 })
  }
}
