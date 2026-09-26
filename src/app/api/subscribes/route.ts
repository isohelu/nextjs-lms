import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/lib/db'

const subscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = subscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()

    const existing = db.prepare('SELECT id FROM subscribes WHERE email = ?').get(email)
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter.'
      })
    }

    const stmt = db.prepare(`
      INSERT INTO subscribes (email, created_at, updated_at)
      VALUES (?, datetime('now'), datetime('now'))
    `)
    stmt.run(email)

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!'
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { success: false, message: 'Subscription failed. Please try again later.' },
      { status: 500 }
    )
  }
}
