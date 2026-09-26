import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const categoryCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  icon: z.string().optional(),
  description: z.string().optional()
})

const categoryUpdateSchema = z.object({
  id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  status: z.union([z.number(), z.boolean(), z.string()]).optional()
})

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await context.params

    let table = 'course_categories'
    let childTable = 'course_category_children'
    let foreignKey = 'course_category_id'
    let titleCol = 'title'

    if (type === 'exam') {
      table = 'exam_categories'
      childTable = ''
    } else if (type === 'product') {
      table = 'product_categories'
      childTable = 'product_category_children'
      foreignKey = 'product_category_id'
    } else if (type === 'blog') {
      table = 'blog_categories'
      childTable = ''
      titleCol = 'name'
    }

    let countSql = '0 as count'
    if (type === 'course') {
      countSql = `(SELECT COUNT(*) FROM courses WHERE course_category_id = ${table}.id) as courses_count`
    } else if (type === 'exam') {
      countSql = `(SELECT COUNT(*) FROM exams WHERE exam_category_id = ${table}.id) as exams_count`
    } else if (type === 'product' || type === 'store') {
      countSql = `(SELECT COUNT(*) FROM products WHERE product_category_id = ${table}.id) as products_count`
    } else if (type === 'blog') {
      countSql = `(SELECT COUNT(*) FROM blogs WHERE blog_category_id = ${table}.id) as blogs_count`
    }

    const categories = db.prepare(`
      SELECT id, ${titleCol} as title, slug, icon, sort, status, description, created_at, ${countSql}
      FROM ${table}
      ORDER BY sort ASC, id ASC
    `).all() as any[]

    if (childTable) {
      try {
        const children = db.prepare(`
          SELECT id, title, slug, icon, sort, status, description, ${foreignKey} as parent_id
          FROM ${childTable}
          ORDER BY sort ASC, id ASC
        `).all() as any[]

        const childMap = new Map<number, any[]>()
        for (const child of children) {
          if (!childMap.has(child.parent_id)) {
            childMap.set(child.parent_id, [])
          }
          childMap.get(child.parent_id)!.push({
            ...child,
            [foreignKey]: child.parent_id,
          })
        }

        for (const cat of categories) {
          cat.category_children = childMap.get(cat.id) || []
        }
      } catch (err) {
        console.error('Error fetching child categories:', err)
      }
    }

    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error: unknown) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve categories.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    await requireRole(['admin'])
    const { type } = await context.params

    let table = 'course_categories'
    let childTable = 'course_category_children'
    let foreignKey = 'course_category_id'
    let titleCol = 'title'

    if (type === 'exam') {
      table = 'exam_categories'
      childTable = ''
    } else if (type === 'product') {
      table = 'product_categories'
      childTable = 'product_category_children'
      foreignKey = 'product_category_id'
    } else if (type === 'blog') {
      table = 'blog_categories'
      childTable = ''
      titleCol = 'name'
    }

    const body = await req.json()

    // Handle sort order update
    if (body.action === 'sort' && Array.isArray(body.sortedData)) {
      const isChild = Boolean(body.is_child)
      const targetTable = isChild && childTable ? childTable : table
      const updateStmt = db.prepare(`UPDATE ${targetTable} SET sort = ? WHERE id = ?`)
      const transaction = db.transaction((items: any[]) => {
        items.forEach((item, index) => {
          updateStmt.run(index, item.id)
        })
      })
      transaction(body.sortedData)
      return NextResponse.json({ success: true, message: 'Sort order updated successfully.' })
    }

    // Check if creating a child subcategory
    const parentId = body.parent_id || body.course_category_id || body.product_category_id
    if (parentId && childTable) {
      const title = (body.title || '').trim()
      const slug = (body.slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).trim()
      const icon = body.icon || 'tag'
      const description = body.description || ''
      const status = body.status !== undefined ? (Number(body.status) || 1) : 1

      if (!title) {
        return NextResponse.json({ success: false, message: 'Title is required' }, { status: 422 })
      }

      const stmt = db.prepare(`
        INSERT INTO ${childTable} (title, slug, icon, sort, status, description, ${foreignKey}, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      const res = stmt.run(title, slug, icon, status, description, parentId)
      return NextResponse.json({
        success: true,
        message: 'Subcategory created successfully.',
        id: Number(res.lastInsertRowid)
      }, { status: 201 })
    }

    const parsed = categoryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { title, slug, icon, description } = parsed.data

    const stmt = db.prepare(`
      INSERT INTO ${table} (${titleCol}, slug, icon, sort, status, description, created_at, updated_at)
      VALUES (?, ?, ?, 0, 1, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(title, slug, icon || 'tag', description || null)

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      categoryId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.toLowerCase().includes('forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Create category error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create category.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    await requireRole(['admin'])
    const { type } = await context.params

    let table = 'course_categories'
    let childTable = 'course_category_children'
    let titleCol = 'title'

    if (type === 'exam') {
      table = 'exam_categories'
      childTable = ''
    } else if (type === 'product') {
      table = 'product_categories'
      childTable = 'product_category_children'
    } else if (type === 'blog') {
      table = 'blog_categories'
      childTable = ''
      titleCol = 'name'
    }

    const body = await req.json()

    // Child update
    if (body.is_child && childTable) {
      const id = Number(body.id)
      const fields: string[] = []
      const values: any[] = []

      if (body.title !== undefined) {
        fields.push('title = ?')
        values.push(body.title)
      }
      if (body.slug !== undefined) {
        fields.push('slug = ?')
        values.push(body.slug)
      }
      if (body.icon !== undefined) {
        fields.push('icon = ?')
        values.push(body.icon)
      }
      if (body.description !== undefined) {
        fields.push('description = ?')
        values.push(body.description)
      }
      if (body.status !== undefined) {
        fields.push('status = ?')
        values.push(Number(body.status) || 1)
      }

      fields.push(`updated_at = datetime('now')`)
      values.push(id)

      db.prepare(`UPDATE ${childTable} SET ${fields.join(', ')} WHERE id = ?`).run(...values)
      return NextResponse.json({ success: true, message: 'Subcategory updated successfully.' })
    }

    const parsed = categoryUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { id, title, slug, icon, description, status } = parsed.data

    const fields: string[] = []
    const values: any[] = []

    if (title !== undefined) {
      fields.push(`${titleCol} = ?`)
      values.push(title)
    }
    if (slug !== undefined) {
      fields.push(`slug = ?`)
      values.push(slug)
    }
    if (icon !== undefined) {
      fields.push(`icon = ?`)
      values.push(icon)
    }
    if (description !== undefined) {
      fields.push(`description = ?`)
      values.push(description)
    }
    if (status !== undefined) {
      fields.push(`status = ?`)
      if (type === 'blog') {
        values.push(typeof status === 'string' ? status : (status ? 'active' : 'inactive'))
      } else {
        values.push(typeof status === 'boolean' ? (status ? 1 : 0) : status)
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: true, message: 'No fields to update.' })
    }

    fields.push(`updated_at = datetime('now')`)
    values.push(id)

    const updateQuery = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`
    const result = db.prepare(updateQuery).run(...values)

    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.toLowerCase().includes('forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update category error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update category.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    await requireRole(['admin'])
    const { type } = await context.params

    let table = 'course_categories'
    let childTable = 'course_category_children'
    if (type === 'exam') {
      table = 'exam_categories'
      childTable = ''
    } else if (type === 'product') {
      table = 'product_categories'
      childTable = 'product_category_children'
    } else if (type === 'blog') {
      table = 'blog_categories'
      childTable = ''
    }

    const isChild = req.nextUrl.searchParams.get('child') === '1'
    let id: number | null = null
    const queryId = req.nextUrl.searchParams.get('id')
    if (queryId) {
      id = parseInt(queryId, 10)
    }

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Category ID is required.' }, { status: 400 })
    }

    if (type === 'blog' && !isChild) {
      const cat = db.prepare(`SELECT slug FROM blog_categories WHERE id = ?`).get(id) as any
      if (cat?.slug === 'default') {
        return NextResponse.json({ success: false, message: 'Default category is protected and cannot be deleted.' }, { status: 400 })
      }
      const defaultCat = db.prepare(`SELECT id FROM blog_categories WHERE slug = 'default'`).get() as any
      if (defaultCat) {
        db.prepare(`UPDATE blogs SET blog_category_id = ? WHERE blog_category_id = ?`).run(defaultCat.id, id)
      }
    }

    const targetTable = isChild && childTable ? childTable : table
    const result = db.prepare(`DELETE FROM ${targetTable} WHERE id = ?`).run(id)
    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.toLowerCase().includes('forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Delete category error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete category.' }, { status: 500 })
  }
}

