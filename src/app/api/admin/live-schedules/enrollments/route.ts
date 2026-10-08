import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_LIVE_SCHEDULES_DATA,
  LiveSchedulesSectionData,
} from '@/lib/data/live-schedules-section'

export async function GET() {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Get all enrollments / reservations
    const enrollments = db
      .prepare(`
        SELECT r.id, r.item_id, r.item_type, r.item_title, r.student_name, r.student_email,
               r.user_id, r.access_type, r.amount_paid, r.payment_status, r.payment_method,
               r.transaction_id, r.note, r.created_at, u.photo as student_photo
        FROM schedule_reservations r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.id DESC
      `)
      .all()

    // Get all students for the dropdown
    const students = db
      .prepare(`
        SELECT id, name, email, photo
        FROM users
        WHERE role = 'student'
        ORDER BY name ASC
      `)
      .all()

    return NextResponse.json({
      success: true,
      enrollments,
      students,
    })
  } catch (error) {
    console.error('Fetch enrollments error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, itemId, itemType, itemTitle, note } = body

    if (!userId || !itemId) {
      return NextResponse.json(
        { success: false, message: 'Student and Session are required.' },
        { status: 400 }
      )
    }

    // Lookup user
    const student = db
      .prepare('SELECT id, name, email FROM users WHERE id = ?')
      .get(userId) as { id: number; name: string; email: string } | undefined

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Selected student not found.' },
        { status: 404 }
      )
    }

    // Check if already assigned
    const existing = db
      .prepare(`
        SELECT id FROM schedule_reservations
        WHERE item_id = ? AND (user_id = ? OR LOWER(student_email) = LOWER(?))
        LIMIT 1
      `)
      .get(itemId, student.id, student.email)

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'This student already has access to this class!' },
        { status: 400 }
      )
    }

    // Insert admin assigned enrollment
    db.prepare(`
      INSERT INTO schedule_reservations (
        item_id, item_type, item_title, student_name, student_email,
        user_id, access_type, amount_paid, payment_status, payment_method, note
      )
      VALUES (?, ?, ?, ?, ?, ?, 'admin_assigned', 0, 'completed', 'membership', ?)
    `).run(
      itemId,
      itemType || 'schedule',
      itemTitle || '',
      student.name,
      student.email,
      student.id,
      note || 'Granted by Admin (Student Membership / Enrolled Rule)'
    )

    // Decrement seatsLeft in live_schedules_section
    try {
      const record = settingRepository.getByType('live_schedules_section')
      const currentData: LiveSchedulesSectionData = record
        ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...record }
        : { ...DEFAULT_LIVE_SCHEDULES_DATA }

      if (itemType === 'event') {
        currentData.liveEvents = currentData.liveEvents.map((evt) =>
          evt.id === itemId
            ? { ...evt, seatsLeft: Math.max(0, (evt.seatsLeft || 1) - 1) }
            : evt
        )
      } else {
        currentData.schedules = currentData.schedules.map((sch) =>
          sch.id === itemId
            ? { ...sch, seatsLeft: Math.max(0, (sch.seatsLeft || 1) - 1) }
            : sch
        )
      }

      settingRepository.updateByType(
        'live_schedules_section',
        null,
        currentData as unknown as Record<string, unknown>
      )
    } catch (err) {
      console.error('Failed to decrement seats for admin assigned enrollment:', err)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully granted enrolled access to ${student.name}!`,
    })
  } catch (error) {
    console.error('Admin grant enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to assign student to class' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const reservationId = searchParams.get('id')

    if (!reservationId) {
      return NextResponse.json(
        { success: false, message: 'Enrollment ID is required' },
        { status: 400 }
      )
    }

    // Find reservation to know which item it belongs to
    const target = db
      .prepare('SELECT id, item_id, item_type FROM schedule_reservations WHERE id = ?')
      .get(reservationId) as { id: number; item_id: string; item_type: string } | undefined

    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Delete reservation
    db.prepare('DELETE FROM schedule_reservations WHERE id = ?').run(reservationId)

    // Increment seatsLeft back by 1
    try {
      const record = settingRepository.getByType('live_schedules_section')
      const currentData: LiveSchedulesSectionData = record
        ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...record }
        : { ...DEFAULT_LIVE_SCHEDULES_DATA }

      if (target.item_type === 'event') {
        currentData.liveEvents = currentData.liveEvents.map((evt) =>
          evt.id === target.item_id ? { ...evt, seatsLeft: (evt.seatsLeft || 0) + 1 } : evt
        )
      } else {
        currentData.schedules = currentData.schedules.map((sch) =>
          sch.id === target.item_id ? { ...sch, seatsLeft: (sch.seatsLeft || 0) + 1 } : sch
        )
      }

      settingRepository.updateByType(
        'live_schedules_section',
        null,
        currentData as unknown as Record<string, unknown>
      )
    } catch (err) {
      console.error('Failed to increment seats back:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Student enrollment revoked and seat released.',
    })
  } catch (error) {
    console.error('Revoke enrollment error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to revoke enrollment' },
      { status: 500 }
    )
  }
}
