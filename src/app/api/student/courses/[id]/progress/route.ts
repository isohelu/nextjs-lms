import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const progressSchema = z.object({
  lesson_id: z.number().int().positive(),
  section_id: z.number().int().positive().optional(),
  completed: z.boolean().default(true)
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = progressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { lesson_id, section_id, completed } = parsed.data

    // Check enrollment
    const isEnrolled = courseRepository.isEnrolled(user.id, courseId)
    if (user.role !== 'admin' && !isEnrolled) {
      return NextResponse.json(
        { success: false, message: 'Enrollment required.' },
        { status: 403 }
      )
    }

    // Retrieve or create watch history
    const watchHistory = db.prepare(`
      SELECT * FROM watch_histories WHERE user_id = ? AND course_id = ? LIMIT 1
    `).get(user.id, courseId) as { id: number; completed_watching: string } | undefined

    let completedList: number[] = []
    if (watchHistory?.completed_watching) {
      try {
        completedList = JSON.parse(watchHistory.completed_watching)
      } catch {
        completedList = []
      }
    }

    if (completed && !completedList.includes(lesson_id)) {
      completedList.push(lesson_id)
    } else if (!completed && completedList.includes(lesson_id)) {
      completedList = completedList.filter(id => id !== lesson_id)
    }

    const completedJson = JSON.stringify(completedList)

    if (watchHistory) {
      db.prepare(`
        UPDATE watch_histories SET
          current_watching_id = ?,
          current_section_id = COALESCE(?, current_section_id),
          completed_watching = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(String(lesson_id), section_id ? String(section_id) : null, completedJson, watchHistory.id)
    } else {
      db.prepare(`
        INSERT INTO watch_histories (
          current_section_id, current_watching_id, current_watching_type,
          completed_watching, user_id, course_id, created_at, updated_at
        ) VALUES (
          ?, ?, 'lesson', ?, ?, ?, datetime('now'), datetime('now')
        )
      `).run(section_id ? String(section_id) : '', String(lesson_id), completedJson, user.id, courseId)
    }

    // Calculate total lessons in course
    const countTotalLessons = (db.prepare(`
      SELECT COUNT(*) as c
      FROM section_lessons sl
      JOIN course_sections cs ON sl.course_section_id = cs.id
      WHERE cs.course_id = ?
    `).get(courseId) as { c: number }).c

    const completedCount = completedList.length
    const percentage = countTotalLessons > 0 ? Math.min(100, Math.round((completedCount / countTotalLessons) * 100)) : 100

    // Upsert course_progress table
    const existingProgress = db.prepare(`
      SELECT id FROM course_progress WHERE user_id = ? AND course_id = ? LIMIT 1
    `).get(user.id, courseId) as { id: number } | undefined

    if (existingProgress) {
      db.prepare(`
        UPDATE course_progress SET
          total_lessons = ?,
          completed_lessons = ?,
          progress_percentage = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(countTotalLessons, completedCount, percentage, existingProgress.id)
    } else {
      db.prepare(`
        INSERT INTO course_progress (
          total_lessons, completed_lessons, progress_percentage, user_id, course_id, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, datetime('now'), datetime('now')
        )
      `).run(countTotalLessons, completedCount, percentage, user.id, courseId)
    }

    // If completed 100%, automatically issue certificate into course_certificates table
    let certificateIssued = false
    let certificateIdentifier: string | null = null
    if (percentage >= 100) {
      const existingCert = db.prepare('SELECT id, identifier FROM course_certificates WHERE user_id = ? AND course_id = ? LIMIT 1').get(user.id, courseId) as { id: number; identifier: string } | undefined
      if (existingCert) {
        certificateIdentifier = existingCert.identifier
      } else {
        certificateIdentifier = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
        db.prepare(`
          INSERT INTO course_certificates (identifier, user_id, course_id, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `).run(certificateIdentifier, user.id, courseId)
        certificateIssued = true
      }
    }

    return NextResponse.json({
      success: true,
      progress: {
        totalLessons: countTotalLessons,
        completedLessons: completedCount,
        progressPercentage: percentage,
        completedList,
        certificate: certificateIdentifier ? {
          identifier: certificateIdentifier,
          issued: certificateIssued,
          verifyUrl: `/certificates/${certificateIdentifier}`
        } : null
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Progress update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update progress.' },
      { status: 500 }
    )
  }
}
