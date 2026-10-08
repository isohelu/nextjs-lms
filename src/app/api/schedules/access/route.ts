import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_LIVE_SCHEDULES_DATA,
  LiveSchedulesSectionData,
} from '@/lib/data/live-schedules-section'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'itemId is required' },
        { status: 400 }
      )
    }

    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        hasAccess: false,
        user: null,
        liveRoomUrl: null,
      })
    }

    // Check if user has an active reservation or enrollment in this item
    const reservation = db
      .prepare(`
        SELECT id, item_id, item_type, item_title, access_type, amount_paid, payment_status, created_at
        FROM schedule_reservations
        WHERE item_id = ? AND (user_id = ? OR LOWER(student_email) = LOWER(?))
        ORDER BY id DESC
        LIMIT 1
      `)
      .get(itemId, sessionUser.id, sessionUser.email) as
      | {
          id: number
          item_id: string
          item_type: string
          item_title: string
          access_type: string
          amount_paid: number
          payment_status: string
          created_at: string
        }
      | undefined

    if (!reservation) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        hasAccess: false,
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role: sessionUser.role,
        },
        liveRoomUrl: null,
      })
    }

    // User HAS access! Retrieve the actual protected liveRoomUrl from settings
    const settingsRecord = settingRepository.getByType('live_schedules_section')
    const currentData: LiveSchedulesSectionData = settingsRecord
      ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...settingsRecord }
      : DEFAULT_LIVE_SCHEDULES_DATA

    let liveRoomUrl: string | null = null
    const matchedEvent = currentData.liveEvents.find((e) => e.id === itemId)
    if (matchedEvent) {
      liveRoomUrl = matchedEvent.liveRoomUrl || 'https://meet.google.com/live-room'
    } else {
      const matchedSchedule = currentData.schedules.find((s) => s.id === itemId)
      if (matchedSchedule) {
        liveRoomUrl = matchedSchedule.liveRoomUrl || 'https://meet.google.com/live-room'
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      hasAccess: true,
      accessType: reservation.access_type || 'free_reserved',
      amountPaid: reservation.amount_paid || 0,
      enrolledAt: reservation.created_at,
      liveRoomUrl,
      user: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      },
    })
  } catch (error) {
    console.error('Check schedule access error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify schedule access' },
      { status: 500 }
    )
  }
}
