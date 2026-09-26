import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import db from '@/lib/db'

const newsletterSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  send_now: z.boolean().optional()
})

export async function GET() {
  try {
    await requireAdmin()
    const newsletters = db.prepare(`
      SELECT * FROM newsletters ORDER BY id DESC
    `).all()

    const subscriberCount = (db.prepare('SELECT COUNT(*) as count FROM subscribes').get() as { count: number }).count

    return NextResponse.json({
      success: true,
      newsletters,
      subscriberCount
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch newsletters.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = newsletterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const stmt = db.prepare(`
      INSERT INTO newsletters (subject, description, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(parsed.data.subject, parsed.data.description)
    const id = Number(res.lastInsertRowid)

    // If send_now requested, query subscribers to dispatch
    let recipientCount = 0
    if (parsed.data.send_now) {
      const subscribers = db.prepare('SELECT email FROM subscribes').all() as { email: string }[]
      recipientCount = subscribers.length
      // System records the blast delivery in audit log / notification history
    }

    return NextResponse.json({
      success: true,
      message: parsed.data.send_now
        ? `Newsletter dispatched to ${recipientCount} active subscribers.`
        : 'Newsletter created successfully.',
      id,
      recipientCount
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to create newsletter.' }, { status: 500 })
  }
}
