import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/repositories/productRepository'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const pricingType = searchParams.get('pricing_type') || undefined
    const featuredParam = searchParams.get('featured')
    const featured = featuredParam !== null ? featuredParam === 'true' || featuredParam === '1' : undefined
    const statusParam = searchParams.get('status')
    const status = statusParam === 'all' ? undefined : (statusParam || 'approved')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit
    const instructorId = searchParams.get('instructor_id') ? parseInt(searchParams.get('instructor_id')!, 10) : undefined

    const result = productRepository.listAll({
      categorySlug: category,
      search,
      pricingType,
      featured,
      status,
      limit,
      offset,
      instructorId
    })

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    console.error('Fetch products error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products.' },
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

  const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined
  const uid = firstUser?.id || 1
  const created = db.prepare(`
    INSERT INTO instructors (user_id, status, created_at, updated_at)
    VALUES (?, 'approved', datetime('now'), datetime('now'))
  `).run(uid)
  return Number(created.lastInsertRowid)
}

function getProductCategoryId(catId?: number | string | null): number {
  if (catId) {
    const exists = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(Number(catId))
    if (exists) return Number(catId)
  }
  const first = db.prepare('SELECT id FROM product_categories ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined
  if (first?.id) return first.id

  const created = db.prepare(`
    INSERT INTO product_categories (title, slug, status, sort, created_at, updated_at)
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
        { success: false, message: 'Product title is required.' },
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

    const instructorId = body.instructor_id ? Number(body.instructor_id) : getInstructorId(user?.id)
    const categoryId = getProductCategoryId(body.product_category_id)
    const finalThumbnail = saveBase64Image(body.thumbnail, 'product')

    const productId = productRepository.create({
      title: body.title.trim(),
      slug,
      summary: body.summary || body.short_description || null,
      description: body.description || null,
      product_category_id: categoryId,
      product_category_child_id: body.product_category_child_id ? Number(body.product_category_child_id) : null,
      price: body.pricing_type === 'free' ? 0 : Number(body.price || 0),
      discount: body.discount ? 1 : 0,
      discount_price: body.discount && body.discount_price ? Number(body.discount_price) : null,
      pricing_type: body.pricing_type || 'paid',
      inventory: body.inventory ? Number(body.inventory) : 999,
      unlimited_inventory: body.unlimited_inventory ? 1 : 0,
      thumbnail: finalThumbnail,
      status: 'approved',
      instructor_id: instructorId,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully.',
        id: productId,
        productId,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create product.' },
      { status: 500 }
    )
  }
}
