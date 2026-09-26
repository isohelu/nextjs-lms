import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/lib/db'

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, email, subject, message } = parsed.data

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    stmt.run(name, email, subject || null, message)

    return NextResponse.json({
      success: true,
      message: 'Your message has been received! Our support team will get back to you shortly.'
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Contact inquiry error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
