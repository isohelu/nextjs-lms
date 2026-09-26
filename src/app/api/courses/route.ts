import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit
    const instructorId = searchParams.get('instructor_id') ? parseInt(searchParams.get('instructor_id')!, 10) : undefined
    const statusParam = searchParams.get('status')
    const status = statusParam === 'all' ? undefined : (statusParam || undefined)

    const result = courseRepository.listAll({
      categorySlug: category,
      search,
      status,
      limit,
      offset,
      instructorId
    })

    return NextResponse.json({
      success: true,
      courses: result.courses,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    console.error('Fetch courses error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve courses.' },
      { status: 500 }
    )
  }
}

import db from '@/lib/db'
import { saveBase64Image } from '@/lib/upload-utils'

function getInstructorId(userId?: number): number {
  if (userId) {
    const inst = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(userId) as { id: number } | undefined
    if (inst?.id) return inst.id

    // Check if user exists in users table before auto-creating instructor profile
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (userExists) {
      try {
        const res = db.prepare(`
          INSERT INTO instructors (user_id, status, created_at, updated_at)
          VALUES (?, 'approved', datetime('now'), datetime('now'))
        `).run(userId)
        return Number(res.lastInsertRowid)
      } catch {}
    }
  }

  const firstInst = db.prepare('SELECT id FROM instructors ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined
  if (firstInst?.id) return firstInst.id

  // If no instructor exists at all in the DB, create a default one
  const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined
  const uid = firstUser?.id || 1
  const created = db.prepare(`
    INSERT INTO instructors (user_id, status, created_at, updated_at)
    VALUES (?, 'approved', datetime('now'), datetime('now'))
  `).run(uid)
  return Number(created.lastInsertRowid)
}

function getCourseCategoryId(catId?: number | string | null): number {
  if (catId) {
    const exists = db.prepare('SELECT id FROM course_categories WHERE id = ?').get(Number(catId))
    if (exists) return Number(catId)
  }
  const first = db.prepare('SELECT id FROM course_categories ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined
  if (first?.id) return first.id

  const created = db.prepare(`
    INSERT INTO course_categories (title, slug, status, sort, created_at, updated_at)
    VALUES ('General', 'general', 1, 1, datetime('now'), datetime('now'))
  `).run()
  return Number(created.lastInsertRowid)
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Course title is required.' },
        { status: 422 }
      )
    }

    const baseSlug = body.slug
      ? body.slug
      : body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
    const slug = `${baseSlug}-${Date.now()}`

    // If admin or instructor provides a specific instructor_id, use it
    let instructorId: number
    if (body.instructor_id && (user?.role === 'admin' || user?.role === 'instructor')) {
      instructorId = Number(body.instructor_id)
    } else {
      instructorId = getInstructorId(user?.id)
    }

    const categoryId = getCourseCategoryId(body.course_category_id)
    const childCategoryId = body.course_category_child_id ? Number(body.course_category_child_id) : null
    const finalThumbnail = saveBase64Image(body.thumbnail, 'course')

    const newCourse = courseRepository.create({
      title: body.title.trim(),
      slug,
      short_description: body.short_description || '',
      description: body.description || '',
      course_category_id: categoryId,
      course_category_child_id: childCategoryId,
      level: body.level || 'Beginner',
      language: body.language || 'English',
      pricing_type: body.pricing_type || 'paid',
      price: body.pricing_type === 'free' ? 0 : Number(body.price || 0),
      discount: body.discount ? 1 : 0,
      discount_price: body.discount && body.discount_price ? Number(body.discount_price) : null,
      thumbnail: finalThumbnail,
      status: 'approved',
      instructor_id: instructorId,
      expiry_type: body.expiry_type || 'lifetime',
      expiry_duration: body.expiry_duration || null,
      drip_content: body.drip_content === '1' || body.drip_content === 1 ? 1 : 0,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Course created successfully.',
        id: newCourse.id,
        courseId: newCourse.id,
        course: newCourse,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course.' },
      { status: 500 }
    )
  }
}
