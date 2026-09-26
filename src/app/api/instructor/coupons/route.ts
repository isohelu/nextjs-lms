import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discount: z.number().positive(),
  discount_type: z.enum(['percentage', 'fixed']).default('percentage'),
  course_id: z.number().int().positive().nullable().optional(),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const isAdmin = user.role === 'admin'

    const query = `
      SELECT c.*, crs.title as course_title
      FROM course_coupons c
      LEFT JOIN courses crs ON c.course_id = crs.id
      ${isAdmin ? '' : 'WHERE c.user_id = ?'}
      ORDER BY c.id DESC
    `

    const coupons = isAdmin
      ? db.prepare(query).all()
      : db.prepare(query).all(user.id)

    return NextResponse.json({
      success: true,
      coupons,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch coupons.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = couponSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { code, discount, discount_type, course_id, valid_from, valid_to } = parsed.data

    const existing = db.prepare('SELECT id FROM course_coupons WHERE code = ?').get(code)
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists.' }, { status: 409 })
    }

    const stmt = db.prepare(`
      INSERT INTO course_coupons (
        code, discount, discount_type, course_id, user_id, is_active,
        used_count, valid_from, valid_to, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, 1, 0, ?, ?, datetime('now'), datetime('now')
      )
    `)
    const res = stmt.run(
      code,
      discount,
      discount_type,
      course_id || null,
      user.id,
      valid_from || null,
      valid_to || null
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon created successfully.',
        couponId: Number(res.lastInsertRowid),
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create coupon error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create coupon.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon ID required' }, { status: 400 })
    }

    if (user.role === 'admin') {
      db.prepare('DELETE FROM course_coupons WHERE id = ?').run(Number(id))
    } else {
      db.prepare('DELETE FROM course_coupons WHERE id = ? AND user_id = ?').run(Number(id), user.id)
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete coupon' }, { status: 500 })
  }
}
