import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const user = userRepository.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, user })
  } catch (error: unknown) {
    console.error('Get user error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve user.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const body = await req.json()

    const updated = userRepository.update(userId, {
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status !== undefined ? Number(body.status) : undefined,
      photo: body.photo
    })

    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    if (body.role === 'instructor') {
      const existing = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(userId)
      if (!existing) {
        db.prepare(`
          INSERT INTO instructors (user_id, headline, bio, skills, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(userId, body.headline || 'Course Instructor', body.bio || null, body.skills || null)
      } else {
        db.prepare(`
          UPDATE instructors SET
            headline = COALESCE(?, headline),
            bio = COALESCE(?, bio),
            updated_at = datetime('now')
          WHERE user_id = ?
        `).run(body.headline || null, body.bio || null, userId)
      }
    }

    return NextResponse.json({ success: true, message: 'User updated successfully.', user: updated })
  } catch (error: unknown) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update user.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const deleted = userRepository.delete(userId)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'User not found or delete failed.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'User deleted successfully.' })
  } catch (error: unknown) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete user.' }, { status: 500 })
  }
}
