import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import db from '@/lib/db'

const applySchema = z.object({
  designation: z.string().min(2, 'Designation is required'),
  biography: z.string().min(10, 'Biography must be at least 10 characters'),
  skills: z.union([z.string(), z.array(z.string())]),
  resume: z.string().min(2, 'Resume or portfolio URL is required'),
  payout_methods: z.union([z.string(), z.record(z.string(), z.unknown())]).optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const parsed = applySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    // Check if user already applied
    const existing = db.prepare('SELECT id, status FROM instructors WHERE user_id = ?').get(session.id) as { id: number; status: string } | undefined
    if (existing) {
      return NextResponse.json({
        success: false,
        message: `You have already submitted an instructor application (Current status: ${existing.status}).`
      }, { status: 400 })
    }

    const skillsStr = typeof parsed.data.skills === 'string' ? parsed.data.skills : JSON.stringify(parsed.data.skills)
    const payoutStr = typeof parsed.data.payout_methods === 'string' ? parsed.data.payout_methods : JSON.stringify(parsed.data.payout_methods || { method: 'paypal' })

    const stmt = db.prepare(`
      INSERT INTO instructors (
        user_id, designation, biography, skills, resume,
        payout_methods, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, 'pending', datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(
      session.id,
      parsed.data.designation,
      parsed.data.biography,
      skillsStr,
      parsed.data.resume,
      payoutStr
    )

    return NextResponse.json({
      success: true,
      message: 'Your instructor application has been submitted successfully and is pending administrator review.',
      instructorId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to apply as an instructor.' }, { status: 401 })
    }
    console.error('Instructor application error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit instructor application.' }, { status: 500 })
  }
}
