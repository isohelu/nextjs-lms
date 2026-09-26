import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    await requireRole(['admin'])

    const payouts = db.prepare(`
      SELECT p.id, p.payout_method, p.amount, p.status, p.transaction_id, p.created_at,
             u.id as user_id, u.name as instructor_name, u.email as instructor_email
      FROM payout_histories p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `).all()

    return NextResponse.json({
      success: true,
      payouts
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Fetch admin payouts error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve payouts.' }, { status: 500 })
  }
}
