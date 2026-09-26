import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'
import db from '@/lib/db'

const productCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category_id: z.number().int().positive().optional(),
  pricing_type: z.enum(['free', 'paid']).default('free'),
  price: z.number().min(0).default(0),
  discount: z.number().default(0),
  discount_price: z.number().nullable().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional()
})

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : (user.role === 'admin' ? undefined : -1)

    const result = productRepository.listAll({
      instructorId,
      limit: 100
    })

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    console.error('Fetch instructor products error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve products.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = productCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : 1

    const data = parsed.data
    const productId = productRepository.create({
      title: data.title,
      slug: data.slug,
      product_category_id: data.category_id || 1,
      instructor_id: instructorId,
      pricing_type: data.pricing_type,
      price: data.price,
      discount: data.discount,
      discount_price: data.discount_price,
      summary: data.summary || null,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
      status: 'draft'
    })

    return NextResponse.json({
      success: true,
      message: 'Product created successfully.',
      productId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create product.' }, { status: 500 })
  }
}
