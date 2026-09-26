import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { paymentRepository } from '@/lib/repositories/paymentRepository'

const verifySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().optional()
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await context.params
    const paymentId = parseInt(id, 10)

    if (isNaN(paymentId)) {
      return NextResponse.json({ success: false, message: 'Invalid payment ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { status, admin_notes } = parsed.data
    const success = paymentRepository.verifyOfflinePayment(paymentId, status, admin_notes)

    if (!success) {
      return NextResponse.json({ success: false, message: 'Payment record not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Offline payment marked as ${status}. Student enrollment status synchronized.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Verify payment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to verify payment.' }, { status: 500 })
  }
}
