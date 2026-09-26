import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userRepository } from '@/lib/repositories/userRepository'
import { hashPassword, setSessionCookie } from '@/lib/auth/session'
import db from '@/lib/db'

const registerSchema = z.object({
  name: z.string().min(1, 'The name field is required.').max(255),
  email: z.string().email('The email must be a valid email address.').max(255),
  password: z.string().min(8, 'The password must be at least 8 characters.'),
  password_confirmation: z.string().min(1, 'The password confirmation does not match.'),
  role: z.enum(['student', 'instructor']).default('student')
}).refine((data) => data.password === data.password_confirmation, {
  message: 'The password confirmation does not match.',
  path: ['password_confirmation']
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: parsed.error.issues[0]?.message },
        { status: 422 }
      )
    }

    const { name, email, password, role } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = userRepository.findByEmail(normalizedEmail)
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'The email has already been taken.' },
        { status: 422 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      status: 1
    })

    if (role === 'instructor') {
      const insStmt = db.prepare(`
        INSERT INTO instructors (
          skills, biography, resume, designation, status, payout_methods, user_id, created_at, updated_at
        ) VALUES (
          '[]', '', '', 'Instructor', 'pending', '[]', ?, datetime('now'), datetime('now')
        )
      `)
      const insRes = insStmt.run(user.id)
      userRepository.update(user.id, { instructor_id: Number(insRes.lastInsertRowid) })
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo || null
    }

    await setSessionCookie(sessionUser)

    const redirectUrl = role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      user: sessionUser,
      redirect: redirectUrl
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again later.' },
      { status: 500 }
    )
  }
}
