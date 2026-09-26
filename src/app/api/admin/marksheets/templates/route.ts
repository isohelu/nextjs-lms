import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

const createTemplateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['course', 'exam']).default('course'),
  template_data: z.record(z.string(), z.unknown()),
  logo_path: z.string().optional().nullable(),
  is_active: z.boolean().default(false)
})

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    let sql = 'SELECT * FROM marksheet_templates'
    const params: string[] = []
    if (type) {
      sql += ' WHERE type = ?'
      params.push(type)
    }
    sql += ' ORDER BY id ASC'

    const rows = db.prepare(sql).all(...params) as { template_data: string; [key: string]: unknown }[]
    const templates = rows.map(r => {
      let parsed = {}
      try {
        parsed = JSON.parse(r.template_data)
      } catch {
        parsed = {}
      }
      return { ...r, template_data: parsed }
    })

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve marksheet templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = createTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const templateDataStr = JSON.stringify(parsed.data.template_data)
    const stmt = db.prepare(`
      INSERT INTO marksheet_templates (name, type, template_data, logo_path, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const res = stmt.run(
      parsed.data.name,
      parsed.data.type,
      templateDataStr,
      parsed.data.logo_path || null,
      parsed.data.is_active ? 1 : 0
    )

    return NextResponse.json({
      success: true,
      message: 'Marksheet template created successfully.',
      templateId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to create marksheet template' }, { status: 500 })
  }
}
