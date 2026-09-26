import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const reorderSchema = z.object({
  questions: z.array(z.object({
    id: z.number().int().positive(),
    sort: z.number().int().min(0)
  })).optional(),
  question_ids: z.array(z.number().int().positive()).optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id: rawId } = await params
    const examId = parseInt(rawId, 10)

    if (isNaN(examId)) {
      return NextResponse.json({ success: false, message: 'Invalid exam ID.' }, { status: 400 })
    }

    const body = await req.json()
    const validated = reorderSchema.parse(body)

    const updateStmt = db.prepare('UPDATE exam_questions SET sort = ?, updated_at = ? WHERE id = ? AND exam_id = ?')

    const runTransaction = db.transaction(() => {
      const now = new Date().toISOString()
      if (validated.questions && validated.questions.length > 0) {
        for (const item of validated.questions) {
          updateStmt.run(item.sort, now, item.id, examId)
        }
      } else if (validated.question_ids && validated.question_ids.length > 0) {
        validated.question_ids.forEach((qId, index) => {
          updateStmt.run(index + 1, now, qId, examId)
        })
      }
    })

    runTransaction()

    return NextResponse.json({
      success: true,
      message: 'Questions reordered successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Reorder questions error:', error)
    return NextResponse.json({ success: false, message: 'Failed to reorder questions.' }, { status: 500 })
  }
}
