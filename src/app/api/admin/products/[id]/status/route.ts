import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'

const statusSchema = z.object({
  status: z.enum(['approved', 'pending', 'rejected', 'draft'])
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await context.params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const updated = productRepository.update(productId, { status: parsed.data.status })

    return NextResponse.json({
      success: updated,
      message: `Product status updated to ${parsed.data.status}.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update product status error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update product status.' }, { status: 500 })
  }
}
