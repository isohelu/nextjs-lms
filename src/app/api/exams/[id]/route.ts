import { NextRequest, NextResponse } from 'next/server'
import { examRepository } from '@/lib/repositories/examRepository'
import { saveBase64Image } from '@/lib/upload-utils'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const exam = examRepository.findById(id)
    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 })
    }

    const questions = examRepository.getQuestions(id, true)
    const resources = db.prepare('SELECT * FROM exam_resources WHERE exam_id = ? ORDER BY id ASC').all(id)
    const faqs = db.prepare('SELECT * FROM exam_faqs WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)
    const requirements = db.prepare('SELECT * FROM exam_requirements WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)
    const outcomes = db.prepare('SELECT * FROM exam_outcomes WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        questions,
        resources,
        faqs,
        requirements,
        outcomes,
      },
    })
  } catch (error: unknown) {
    console.error('Get exam error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve exam' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const existing = examRepository.findById(id)
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 })
    }

    const body = await req.json()
    if (body.thumbnail) {
      body.thumbnail = saveBase64Image(body.thumbnail, 'exam')
    }
    if (body.banner) {
      body.banner = saveBase64Image(body.banner, 'exam_banner')
    }
    examRepository.update(id, body)

    // Sync resources
    if (Array.isArray(body.resources)) {
      db.prepare('DELETE FROM exam_resources WHERE exam_id = ?').run(id)
      const insRes = db.prepare(
        "INSERT INTO exam_resources (exam_id, title, type, resource, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
      )
      body.resources.forEach((r: any) => {
        if (r && r.title && r.resource) {
          insRes.run(id, r.title, r.type || 'file', r.resource)
        }
      })
    }

    // Sync faqs
    if (Array.isArray(body.faqs)) {
      db.prepare('DELETE FROM exam_faqs WHERE exam_id = ?').run(id)
      const insFaq = db.prepare(
        "INSERT INTO exam_faqs (exam_id, question, answer, sort, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
      )
      body.faqs.forEach((f: any, idx: number) => {
        if (f && f.question && f.answer) {
          insFaq.run(id, f.question, f.answer, f.sort ?? idx)
        }
      })
    }

    // Sync requirements
    if (Array.isArray(body.requirements)) {
      db.prepare('DELETE FROM exam_requirements WHERE exam_id = ?').run(id)
      const insReq = db.prepare(
        "INSERT INTO exam_requirements (exam_id, requirement, sort, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
      )
      body.requirements.forEach((r: any, idx: number) => {
        const text = typeof r === 'string' ? r : r?.requirement
        if (text) {
          insReq.run(id, text, r?.sort ?? idx)
        }
      })
    }

    // Sync outcomes
    if (Array.isArray(body.outcomes)) {
      db.prepare('DELETE FROM exam_outcomes WHERE exam_id = ?').run(id)
      const insOut = db.prepare(
        "INSERT INTO exam_outcomes (exam_id, outcome, sort, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
      )
      body.outcomes.forEach((o: any, idx: number) => {
        const text = typeof o === 'string' ? o : o?.outcome
        if (text) {
          insOut.run(id, text, o?.sort ?? idx)
        }
      })
    }

    const exam = examRepository.findById(id)
    const questions = examRepository.getQuestions(id, true)
    const resources = db.prepare('SELECT * FROM exam_resources WHERE exam_id = ? ORDER BY id ASC').all(id)
    const faqs = db.prepare('SELECT * FROM exam_faqs WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)
    const requirements = db.prepare('SELECT * FROM exam_requirements WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)
    const outcomes = db.prepare('SELECT * FROM exam_outcomes WHERE exam_id = ? ORDER BY sort ASC, id ASC').all(id)

    return NextResponse.json({
      success: true,
      message: 'Exam updated successfully',
      exam: {
        ...exam,
        questions,
        resources,
        faqs,
        requirements,
        outcomes,
      },
    })
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
    console.error('Update exam error:', errorDetails)
    return NextResponse.json({ success: false, message: 'Failed to update exam', error: errorDetails }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const deleted = examRepository.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Exam not found or delete failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete exam error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete exam' }, { status: 500 })
  }
}
