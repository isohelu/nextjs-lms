import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const payoutId = parseInt(id, 10)
    if (isNaN(payoutId)) {
      return NextResponse.json({ success: false, message: 'Invalid payout ID.' }, { status: 400 })
    }

    const res = db.prepare(`
      UPDATE payout_histories SET
        status = 'completed',
        updated_at = datetime('now')
      WHERE id = ?
    `).run(payoutId)

    if (res.changes === 0) {
      return NextResponse.json({ success: false, message: 'Payout request not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Payout processed and marked completed.' })
  } catch (error: unknown) {
    console.error('Process payout error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process payout.' }, { status: 500 })
  }
}
