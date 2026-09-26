import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

const createLangSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  nativeName: z.string().min(2),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false)
})

export async function GET() {
  try {
    await requireAdmin()
    const languages = db.prepare('SELECT * FROM languages ORDER BY id ASC').all()
    return NextResponse.json({
      success: true,
      languages
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve languages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = createLangSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    if (parsed.data.is_default) {
      db.prepare('UPDATE languages SET is_default = 0').run()
    }

    const stmt = db.prepare(`
      INSERT INTO languages (name, code, nativeName, is_active, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const res = stmt.run(
      parsed.data.name,
      parsed.data.code,
      parsed.data.nativeName,
      parsed.data.is_active ? 1 : 0,
      parsed.data.is_default ? 1 : 0
    )

    return NextResponse.json({
      success: true,
      message: 'Language added successfully.',
      languageId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to add language' }, { status: 500 })
  }
}
