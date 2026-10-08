import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await params
    const instructorId = Number(id)

    const instructor = db.prepare(`
      SELECT i.id, i.user_id, i.skills, i.biography, i.resume, i.designation, i.status, i.created_at,
             u.name, u.email, u.photo
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `).get(instructorId) as any

    if (!instructor) {
      return NextResponse.json({ success: false, message: 'Instructor not found.' }, { status: 404 })
    }

    let parsedSkills: string[] = []
    if (instructor.skills) {
      try {
        const parsed = JSON.parse(instructor.skills)
        parsedSkills = Array.isArray(parsed) ? parsed : typeof parsed === 'string' ? JSON.parse(parsed) : []
      } catch {
        parsedSkills = instructor.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    }

    return NextResponse.json({
      success: true,
      instructor: {
        ...instructor,
        skillsList: parsedSkills,
      },
    })
  } catch (error: unknown) {
    console.error('Get instructor error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve instructor.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await params
    const instructorId = Number(id)
    const body = await req.json()
    const { designation, skills, biography, resume, status } = body

    const existing = db.prepare('SELECT id, user_id FROM instructors WHERE id = ?').get(instructorId) as { id: number; user_id: number } | undefined
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Instructor not found.' }, { status: 404 })
    }

    const skillsJson = Array.isArray(skills)
      ? JSON.stringify(skills)
      : typeof skills === 'string'
      ? JSON.stringify(skills.split(',').map((s: string) => s.trim()).filter(Boolean))
      : '[]'

    db.prepare(`
      UPDATE instructors
      SET designation = ?, skills = ?, biography = ?, resume = COALESCE(?, resume), status = COALESCE(?, status), updated_at = datetime('now')
      WHERE id = ?
    `).run(designation ?? '', skillsJson, biography ?? '', resume ?? null, status ?? null, instructorId)

    return NextResponse.json({ success: true, message: 'Instructor updated successfully.' })
  } catch (error: unknown) {
    console.error('Update instructor error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update instructor.' }, { status: 500 })
  }
}
