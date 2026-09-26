import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'

export async function GET() {
  try {
    const user = await requireRole(['student', 'admin'])
    const purchases = productRepository.getUserPurchases(user.id)

    return NextResponse.json({
      success: true,
      purchases
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Fetch purchases error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve purchases.' },
      { status: 500 }
    )
  }
}
