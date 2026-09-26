import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { paymentRepository } from '@/lib/repositories/paymentRepository'

const offlineSubmitSchema = z.object({
  item_type: z.enum(['course', 'exam', 'product']),
  item_id: z.number().int().positive(),
  amount: z.number().positive(),
  payment_info: z.string().min(3, 'Payment reference details are required'),
  payment_date: z.string().min(1, 'Payment date is required')
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin'])
    const body = await req.json()
    const parsed = offlineSubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const paymentId = paymentRepository.submitOfflinePayment({
      userId: user.id,
      itemType: parsed.data.item_type,
      itemId: parsed.data.item_id,
      amount: parsed.data.amount,
      paymentInfo: parsed.data.payment_info,
      paymentDate: parsed.data.payment_date
    })

    return NextResponse.json({
      success: true,
      message: 'Offline payment submitted successfully. Your enrollment will be activated upon admin review.',
      paymentId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Offline payment submit error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit payment.' }, { status: 500 })
  }
}
