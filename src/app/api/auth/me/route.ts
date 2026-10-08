import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ success: false, user: null })
    }

    let freshUser = session.id ? userRepository.findById(Number(session.id)) : undefined
    if (!freshUser && session.email) {
      freshUser = userRepository.findByEmail(session.email)
    }

    if (freshUser) {
      if (freshUser.status === 0) {
        return NextResponse.json({ success: false, user: null })
      }
      return NextResponse.json({
        success: true,
        user: {
          id: freshUser.id,
          name: freshUser.name,
          email: freshUser.email,
          role: freshUser.role,
          photo: freshUser.photo || session.photo || null,
          instructor_id: freshUser.instructor_id || null
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        photo: session.photo || null,
        instructor_id: null
      }
    })
  } catch (error: unknown) {
    console.error('Auth me error:', error)
    return NextResponse.json({ success: false, user: null })
  }
}
