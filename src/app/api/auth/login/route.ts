import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userRepository } from '@/lib/repositories/userRepository'
import { comparePassword, setSessionCookie } from '@/lib/auth/session'

// In-memory rate limiting store for login attempts (5 attempts, 60s lockout)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()

const loginSchema = z.object({
  email: z.string().email('The email must be a valid email address.'),
  password: z.string().min(1, 'The password field is required.'),
  remember: z.boolean().optional().default(false)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: parsed.error.issues[0]?.message },
        { status: 422 }
      )
    }

    const { email, password, remember } = parsed.data
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const throttleKey = `${email.toLowerCase()}|${ip}`

    // Check rate limit (5 attempts, 60 seconds lockout)
    const now = Date.now()
    const throttle = loginAttempts.get(throttleKey)
    if (throttle && throttle.lockedUntil > now) {
      const remainingSeconds = Math.ceil((throttle.lockedUntil - now) / 1000)
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${remainingSeconds} seconds.`
        },
        { status: 429 }
      )
    }

    const user = userRepository.findByEmail(email)
    if (!user || !user.password) {
      // Record failed attempt
      const currentCount = (throttle?.count || 0) + 1
      const isLocked = currentCount >= 5
      loginAttempts.set(throttleKey, {
        count: currentCount,
        lockedUntil: isLocked ? now + 60 * 1000 : 0
      })

      return NextResponse.json(
        { success: false, message: 'These credentials do not match our records.' },
        { status: 401 }
      )
    }

    if (user.status === 0) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      // Record failed attempt
      const currentCount = (throttle?.count || 0) + 1
      const isLocked = currentCount >= 5
      loginAttempts.set(throttleKey, {
        count: currentCount,
        lockedUntil: isLocked ? now + 60 * 1000 : 0
      })

      return NextResponse.json(
        { success: false, message: 'These credentials do not match our records.' },
        { status: 401 }
      )
    }

    // Clear throttle upon successful authentication
    loginAttempts.delete(throttleKey)

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo || null
    }

    await setSessionCookie(sessionUser, remember)

    // Compute role-specific redirect route
    let defaultRedirect = '/student/dashboard'
    if (user.role === 'admin') {
      defaultRedirect = '/admin/dashboard'
    } else if (user.role === 'instructor') {
      defaultRedirect = '/instructor/dashboard'
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: sessionUser,
      redirect: defaultRedirect
    })
  } catch (error: unknown) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during login.' },
      { status: 500 }
    )
  }
}
