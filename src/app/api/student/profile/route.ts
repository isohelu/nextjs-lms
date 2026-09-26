import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'
import db from '@/lib/db'

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  photo: z.string().optional().nullable(),
  social_links: z.union([z.record(z.string(), z.any()), z.string()]).optional().nullable(),
  designation: z.string().optional().nullable(),
  biography: z.string().optional().nullable(),
  skills: z.union([z.array(z.string()), z.string()]).optional().nullable()
})

export async function GET() {
  try {
    const session = await requireAuth()
    const user = userRepository.findById(session.id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    // Check if instructor record exists
    const instructor = db.prepare(`
      SELECT id, designation, biography, skills
      FROM instructors
      WHERE user_id = ?
      LIMIT 1
    `).get(user.id) as { id: number; designation?: string; biography?: string; skills?: string } | undefined

    let parsedSocialLinks = {}
    if (user.social_links) {
      try {
        parsedSocialLinks = typeof user.social_links === 'string' ? JSON.parse(user.social_links) : user.social_links
      } catch {}
    }

    let parsedSkills: string[] = []
    if (instructor?.skills) {
      try {
        parsedSkills = typeof instructor.skills === 'string' ? JSON.parse(instructor.skills) : instructor.skills
      } catch {}
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        social_links: parsedSocialLinks,
        created_at: user.created_at
      },
      instructor: instructor ? {
        id: instructor.id,
        designation: instructor.designation || '',
        biography: instructor.biography || '',
        skills: parsedSkills
      } : null
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch profile.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, photo, social_links, designation, biography, skills } = parsed.data

    const userUpdates: Record<string, any> = {}
    if (name !== undefined) userUpdates.name = name.trim()
    if (photo !== undefined) userUpdates.photo = photo
    if (social_links !== undefined) {
      userUpdates.social_links = typeof social_links === 'object' && social_links !== null
        ? JSON.stringify(social_links)
        : social_links
    }

    let updated = userRepository.findById(session.id)
    if (Object.keys(userUpdates).length > 0) {
      updated = userRepository.update(session.id, userUpdates)
    }

    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    // Persist instructor-related details if supplied
    if (designation !== undefined || biography !== undefined || skills !== undefined) {
      const existingInstructor = db.prepare('SELECT id FROM instructors WHERE user_id = ? LIMIT 1').get(session.id) as { id: number } | undefined
      const skillsStr = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]')

      if (existingInstructor) {
        db.prepare(`
          UPDATE instructors SET
            designation = COALESCE(?, designation),
            biography = COALESCE(?, biography),
            skills = COALESCE(?, skills),
            updated_at = datetime('now')
          WHERE id = ?
        `).run(designation ?? null, biography ?? null, skillsStr, existingInstructor.id)
      } else {
        const insRes = db.prepare(`
          INSERT INTO instructors (
            skills, biography, resume, designation, status, payout_methods, user_id, created_at, updated_at
          ) VALUES (?, ?, '', ?, 'approved', '[]', ?, datetime('now'), datetime('now'))
        `).run(skillsStr, biography || '', designation || 'Instructor', session.id)

        userRepository.update(session.id, { instructor_id: Number(insRes.lastInsertRowid) })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        photo: updated.photo
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 })
  }
}
