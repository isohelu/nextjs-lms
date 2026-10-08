import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    const defaultUser = db.prepare("SELECT id, name, email, role FROM users WHERE role = 'student' OR id = 12 LIMIT 1").get() as { id: number; name: string; email: string; role: string } | undefined
    const userId = sessionUser?.id || defaultUser?.id || 12

    const body = await req.json()
    
    let item_type: 'course' | 'exam' | 'product' = 'course'
    let item_id: number = 0

    if (body.item_type && body.item_id) {
      item_type = body.item_type
      item_id = Number(body.item_id)
    } else if (body.course_id) {
      item_type = 'course'
      item_id = Number(body.course_id)
    } else if (body.exam_id) {
      item_type = 'exam'
      item_id = Number(body.exam_id)
    } else if (body.product_id) {
      item_type = 'product'
      item_id = Number(body.product_id)
    }

    if (!item_id) {
      return NextResponse.json(
        { success: false, message: 'Valid item_id is required.' },
        { status: 422 }
      )
    }

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
    const existing = checkStmt.get(userId, item_id) as { id: number } | undefined

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
      `).run(userId, item_id)
      return NextResponse.json({
        success: true,
        wishlisted: true,
        message: 'Added to wishlist.'
      }, { status: 201 })
    }
  } catch (error: unknown) {
    console.error('Toggle wishlist error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update wishlist.' }, { status: 500 })
  }
}
