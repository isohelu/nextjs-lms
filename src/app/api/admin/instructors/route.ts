import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin'])

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    let whereClause = `WHERE (i.status = 'approved' OR i.status = 'active' OR i.status = 1)`
    const params: any[] = []

    if (search.trim()) {
      whereClause += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      params.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }

    const countRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      ${whereClause}
    `).get(...params) as { count: number } | undefined

    const total = countRow?.count ?? 0

    const listQuery = `
      SELECT i.id, i.user_id, i.skills, i.biography, i.resume, i.designation, i.status, i.created_at,
             u.name, u.email, u.photo,
             (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = i.id OR c.user_id = i.user_id) as courses_count
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      ${whereClause}
      ORDER BY i.id DESC
      LIMIT ? OFFSET ?
    `

    const instructors = db.prepare(listQuery).all(...params, limit, offset)

    return NextResponse.json({
      success: true,
      instructors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Fetch admin instructors error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve instructors.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: 'Valid Instructor ID is required.' }, { status: 400 })
    }

    const instructorId = Number(id)
    const inst = db.prepare('SELECT id, user_id FROM instructors WHERE id = ?').get(instructorId) as { user_id: number } | undefined
    if (!inst) {
      return NextResponse.json({ success: false, message: 'Instructor not found.' }, { status: 404 })
    }

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM instructors WHERE id = ?').run(instructorId)
      db.prepare(`UPDATE users SET role = 'student', updated_at = datetime('now') WHERE id = ?`).run(inst.user_id)
    })
    tx()

    return NextResponse.json({ success: true, message: 'Instructor deleted successfully.' })
  } catch (error: unknown) {
    console.error('Delete instructor error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete instructor.' }, { status: 500 })
  }
}
