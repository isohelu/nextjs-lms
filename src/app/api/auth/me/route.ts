import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ success: false, user: null })
    }

    const freshUser = userRepository.findById(session.id)
    if (!freshUser || freshUser.status === 0) {
      return NextResponse.json({ success: false, user: null })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        photo: freshUser.photo || null,
        instructor_id: freshUser.instructor_id || null
      }
    })
  } catch (error: unknown) {
    console.error('Auth me error:', error)
    return NextResponse.json({ success: false, user: null })
  }
}
