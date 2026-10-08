import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser, setSessionCookie, hashPassword, SessionUser } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'
import db from '@/lib/db'

const directProductOrderSchema = z.object({
  productId: z.number().int().positive(),
  unitPrice: z.number().nonnegative().optional(),
  billing: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = directProductOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: 'Invalid product purchase parameters.' },
        { status: 422 }
      )
    }

    const { productId, unitPrice, billing } = parsed.data
    const product = productRepository.findById(productId)

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
    }

    // Resolve User (Must be authenticated)
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to purchase or claim products.' },
        { status: 401 }
      )
    }
    const userId = user.id

    const priceToPay = unitPrice !== undefined ? unitPrice : (product.discount_price ?? product.price ?? 0)

    const orderId = productRepository.createOrder({
      userId,
      productId,
      instructorId: product.instructor_id || 1,
      unitPrice: priceToPay,
      total: priceToPay,
    })

    // Decrement product inventory if not unlimited
    try {
      db.prepare('UPDATE products SET inventory = MAX(0, inventory - 1) WHERE id = ? AND (unlimited_inventory = 0 OR unlimited_inventory IS NULL)').run(productId)
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Product purchased successfully!',
      orderId,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Direct product order error:', error)
    return NextResponse.json({ success: false, message: 'Failed to complete product purchase.' }, { status: 500 })
  }
}
