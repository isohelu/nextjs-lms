import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const isNum = !isNaN(parseInt(id, 10))

    let job: { skills_required?: string; [key: string]: unknown } | undefined

    if (isNum) {
      job = db.prepare('SELECT * FROM job_circulars WHERE id = ?').get(parseInt(id, 10)) as { skills_required?: string; [key: string]: unknown } | undefined
    } else {
      job = db.prepare('SELECT * FROM job_circulars WHERE slug = ? OR uuid = ?').get(id, id) as { skills_required?: string; [key: string]: unknown } | undefined
    }

    if (!job) {
      return NextResponse.json({ success: false, message: 'Job opening not found.' }, { status: 404 })
    }

    let skills: string[] = []
    try {
      if (job.skills_required) skills = JSON.parse(job.skills_required)
    } catch {
      skills = []
    }

    return NextResponse.json({
      success: true,
      job: { ...job, skills }
    })
  } catch (error: unknown) {
    console.error('Fetch job opening error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve job details.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { requireAdmin } = await import('@/lib/auth/session')
    await requireAdmin()
    const { id } = await context.params
    const isNum = !isNaN(parseInt(id, 10))

    const body = await req.json()
    const fields: string[] = []
    const values: (string | number | null)[] = []

    for (const key of ['title', 'description', 'experience_level', 'location', 'salary_min', 'salary_max', 'salary_currency', 'salary_negotiable', 'application_deadline', 'contact_email', 'positions_available', 'job_type', 'work_type', 'status']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`)
        values.push(body[key])
      }
    }

    if (body.skills_required) {
      fields.push('skills_required = ?')
      values.push(JSON.stringify(body.skills_required))
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update.' }, { status: 400 })
    }

    fields.push("updated_at = datetime('now')")

    let sql = `UPDATE job_circulars SET ${fields.join(', ')} WHERE `
    if (isNum) {
      sql += 'id = ?'
      values.push(parseInt(id, 10))
    } else {
      sql += '(slug = ? OR uuid = ?)'
      values.push(id, id)
    }

    db.prepare(sql).run(...values)

    return NextResponse.json({
      success: true,
      message: 'Job circular updated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    console.error('Update job error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update job circular.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { requireAdmin } = await import('@/lib/auth/session')
    await requireAdmin()
    const { id } = await context.params
    const isNum = !isNaN(parseInt(id, 10))

    let result
    if (isNum) {
      result = db.prepare('DELETE FROM job_circulars WHERE id = ?').run(parseInt(id, 10))
    } else {
      result = db.prepare('DELETE FROM job_circulars WHERE slug = ? OR uuid = ?').run(id, id)
    }

    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Job circular not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job circular deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    console.error('Delete job error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete job circular.' }, { status: 500 })
  }
}
