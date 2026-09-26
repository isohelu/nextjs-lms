import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const courseCreateSchema = z.object({
  title: z.preprocess((val) => String(val ?? '').trim(), z.string().min(1, 'Title is required')),
  slug: z.preprocess((val) => (val ? String(val).trim() : ''), z.string().optional()),
  category_id: z.coerce.number().int().positive().optional(),
  course_category_id: z.coerce.number().int().positive().optional(),
  level: z.preprocess((val) => String(val ?? 'beginner').toLowerCase(), z.enum(['beginner', 'intermediate', 'advanced'])).default('beginner'),
  pricing_type: z.preprocess((val) => String(val ?? 'free').toLowerCase(), z.enum(['free', 'paid'])).default('free'),
  price: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().default(0),
  discount_price: z.preprocess((val) => (val === '' || val === null || val === undefined ? null : Number(val)), z.number().nullable().optional()),
  short_description: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  description: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  thumbnail: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional())
})

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : (user.role === 'admin' ? undefined : -1)

    const result = courseRepository.listAll({
      instructorId,
      limit: 100
    })

    return NextResponse.json({
      success: true,
      courses: result.courses,
      total: result.total
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    console.error('Fetch instructor courses error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve courses.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = courseCreateSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Invalid course data provided.'
      return NextResponse.json(
        { success: false, message: firstError, errors: fieldErrors },
        { status: 422 }
      )
    }

    const data = parsed.data
    const generatedSlug = data.slug || (data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now())

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : 1

    const courseId = courseRepository.create({
      title: data.title,
      slug: generatedSlug,
      course_category_id: data.course_category_id || data.category_id || 1,
      instructor_id: instructorId,
      level: data.level,
      pricing_type: data.pricing_type,
      price: data.price,
      discount: data.discount,
      discount_price: data.discount_price,
      short_description: data.short_description || null,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
      status: 'draft'
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully.',
      courseId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create course.' }, { status: 500 })
  }
}
