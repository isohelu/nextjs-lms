import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const courses = db.prepare(`
      SELECT c.id, c.title, c.slug, c.price, c.discount_price, c.thumbnail, 'course' as item_type
      FROM course_wishlists cw
      JOIN courses c ON cw.course_id = c.id
      WHERE cw.user_id = ?
    `).all(user.id)

    const exams = db.prepare(`
      SELECT e.id, e.title, e.slug, e.price, e.discount_price, e.thumbnail, 'exam' as item_type
      FROM exam_wishlists ew
      JOIN exams e ON ew.exam_id = e.id
      WHERE ew.user_id = ?
    `).all(user.id)

    const products = db.prepare(`
      SELECT p.id, p.title, p.slug, p.price, p.discount_price, p.thumbnail, 'product' as item_type
      FROM product_wishlists pw
      JOIN products p ON pw.product_id = p.id
      WHERE pw.user_id = ?
    `).all(user.id)

    return NextResponse.json({
      success: true,
      wishlist: {
        courses,
        exams,
        products,
        totalCount: courses.length + exams.length + products.length
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch wishlist error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch wishlist.' }, { status: 500 })
  }
}
