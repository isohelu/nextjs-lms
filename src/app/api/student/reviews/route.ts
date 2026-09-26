import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const reviewSchema = z.object({
  item_type: z.enum(['course', 'exam', 'product']),
  item_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(3, 'Review must be at least 3 characters')
})

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])

    const courseReviews = db.prepare(`
      SELECT cr.id, cr.rating, cr.review, cr.created_at, 'course' as item_type,
             c.id as item_id, c.title as item_title, c.slug as item_slug, c.thumbnail
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.user_id = ?
      ORDER BY cr.id DESC
    `).all(user.id)

    const examReviews = db.prepare(`
      SELECT er.id, er.rating, er.review, er.created_at, 'exam' as item_type,
             e.id as item_id, e.title as item_title, e.slug as item_slug, e.thumbnail
      FROM exam_reviews er
      JOIN exams e ON er.exam_id = e.id
      WHERE er.user_id = ?
      ORDER BY er.id DESC
    `).all(user.id)

    const productReviews = db.prepare(`
      SELECT pr.id, pr.rating, pr.review, pr.created_at, 'product' as item_type,
             p.id as item_id, p.title as item_title, p.slug as item_slug, p.thumbnail
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      WHERE pr.user_id = ?
      ORDER BY pr.id DESC
    `).all(user.id)

    const allReviews = [...courseReviews, ...examReviews, ...productReviews].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      reviews: allReviews,
      totalCount: allReviews.length
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch student reviews error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { item_type, item_id, rating, review } = parsed.data

    if (item_type === 'course') {
      const stmt = db.prepare(`
        INSERT INTO course_reviews (user_id, course_id, rating, review, likes, dislikes, created_at, updated_at)
        VALUES (?, ?, ?, ?, '[]', '[]', datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    } else if (item_type === 'exam') {
      const stmt = db.prepare(`
        INSERT INTO exam_reviews (user_id, exam_id, rating, review, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    } else if (item_type === 'product') {
      const stmt = db.prepare(`
        INSERT INTO product_reviews (user_id, product_id, rating, review, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully.'
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Submit review error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit review.' }, { status: 500 })
  }
}
