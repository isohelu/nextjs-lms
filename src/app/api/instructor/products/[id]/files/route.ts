import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'
import db from '@/lib/db'

const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  file_name: z.string().min(1, 'Original file name is required'),
  mime_type: z.string().default('application/octet-stream'),
  size: z.number().int().min(1).default(1000)
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id } = await context.params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID.' }, { status: 400 })
    }

    const product = productRepository.findById(productId)
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    if (user.role !== 'admin' && (!instructor || product.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this product.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = fileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const data = parsed.data

    const stmt = db.prepare(`
      INSERT INTO media (
        model_type, model_id, collection_name, name, file_name, mime_type, disk, size,
        manipulations, custom_properties, generated_conversions, responsive_images, created_at, updated_at
      ) VALUES (
        'Modules\\\\Store\\\\Models\\\\Product', ?, 'downloadable-files', ?, ?, ?, 'local', ?,
        '[]', '[]', '[]', '[]', datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(productId, data.name, data.file_name, data.mime_type, data.size)

    return NextResponse.json({
      success: true,
      message: 'Downloadable file added successfully.',
      fileId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Add product file error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add file.' }, { status: 500 })
  }
}
