import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const toggleSchema = z.object({
  item_type: z.enum(['course', 'exam', 'product']),
  item_id: z.number().int().positive()
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const body = await req.json()
    const parsed = toggleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { item_type, item_id } = parsed.data
    let table = 'course_wishlists'
    let col = 'course_id'

    if (item_type === 'exam') {
      table = 'exam_wishlists'
      col = 'exam_id'
    } else if (item_type === 'product') {
      table = 'product_wishlists'
      col = 'product_id'
    }

    const checkStmt = db.prepare(`SELECT id FROM ${table} WHERE user_id = ? AND ${col} = ? LIMIT 1`)
    const existing = checkStmt.get(user.id, item_id) as { id: number } | undefined

    if (existing) {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(existing.id)
      return NextResponse.json({
        success: true,
        wishlisted: false,
        message: 'Removed from wishlist.'
      })
    } else {
      db.prepare(`
        INSERT INTO ${table} (user_id, ${col}, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `).run(user.id, item_id)
      return NextResponse.json({
        success: true,
        wishlisted: true,
        message: 'Added to wishlist.'
      }, { status: 201 })
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Toggle wishlist error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update wishlist.' }, { status: 500 })
  }
}
