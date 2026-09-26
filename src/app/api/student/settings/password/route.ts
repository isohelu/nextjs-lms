import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your new password')
}).refine(data => data.new_password === data.confirm_password, {
  message: 'New passwords do not match',
  path: ['confirm_password']
})

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await requireRole(['student', 'admin', 'instructor'])

    const body = await req.json()
    const validated = passwordChangeSchema.parse(body)

    const userRecord = db.prepare('SELECT id, password FROM users WHERE id = ?').get(sessionUser.id) as { id: number; password: string } | undefined

    if (!userRecord) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(validated.current_password, userRecord.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Incorrect current password.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validated.new_password, 10)

    db.prepare(`
      UPDATE users
      SET password = ?, updated_at = ?
      WHERE id = ?
    `).run(hashedPassword, new Date().toISOString(), sessionUser.id)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully!'
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || 'Validation error.' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Password change error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update password.' }, { status: 500 })
  }
}
