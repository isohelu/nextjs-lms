import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const payouts = db.prepare(`
      SELECT * FROM payout_histories WHERE user_id = ? ORDER BY id DESC
    `).all(user.id)

    return NextResponse.json({
      success: true,
      payouts
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve payouts.' }, { status: 500 })
  }
}
