import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'

const orderSchema = z.object({
  product_id: z.number().int().positive(),
  coupon_code: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin'])
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { product_id, coupon_code } = parsed.data
    const product = productRepository.findById(product_id)
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
    }

    const alreadyPurchased = productRepository.isPurchased(user.id, product_id)
    if (alreadyPurchased) {
      return NextResponse.json({
        success: true,
        message: 'You already own this product.',
        purchased: true
      })
    }

    const unitPrice = product.price || 0
    const finalPrice = product.discount && product.discount_price != null ? product.discount_price : unitPrice

    const orderId = productRepository.createOrder({
      userId: user.id,
      productId: product.id,
      instructorId: product.instructor_id || 1,
      unitPrice,
      total: finalPrice,
      discount: unitPrice - finalPrice,
      couponCode: coupon_code || null
    })

    return NextResponse.json({
      success: true,
      message: 'Product order created successfully.',
      orderId,
      purchased: true
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Product order error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to complete order.' },
      { status: 500 }
    )
  }
}
