import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { paymentRepository } from '@/lib/repositories/paymentRepository'

export async function GET() {
  try {
    await requireRole(['admin'])
    const payments = paymentRepository.listOfflinePayments()

    return NextResponse.json({
      success: true,
      payments
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve offline payments.' }, { status: 500 })
  }
}
