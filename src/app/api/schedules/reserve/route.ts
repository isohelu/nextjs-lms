import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_LIVE_SCHEDULES_DATA,
  LiveSchedulesSectionData,
} from '@/lib/data/live-schedules-section'

// Ensure table exists with separate atomic statements
try {
  db.exec(`CREATE TABLE IF NOT EXISTS schedule_reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_title TEXT,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    user_id INTEGER,
    access_type TEXT DEFAULT 'free_reserved',
    amount_paid REAL DEFAULT 0,
    payment_status TEXT DEFAULT 'completed',
    payment_method TEXT DEFAULT 'free',
    transaction_id TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sched_res_email ON schedule_reservations(student_email);`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sched_res_item ON schedule_reservations(item_id);`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sched_res_user ON schedule_reservations(user_id);`)
} catch (err) {
  console.error('Failed to initialize schedule_reservations table:', err)
}

export async function POST(req: NextRequest) {
  try {
    // 1. MUST BE LOGGED IN
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          message: 'You must be logged in to join or reserve a seat in this class.',
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { itemId, itemType, itemTitle, price = 0, note, paymentMethod = 'card' } = body

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Invalid session selection.' },
        { status: 400 }
      )
    }

    // 2. Fetch current class configuration to find liveRoomUrl and verify price
    const settingsRecord = settingRepository.getByType('live_schedules_section')
    const currentData: LiveSchedulesSectionData = settingsRecord
      ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...settingsRecord }
      : { ...DEFAULT_LIVE_SCHEDULES_DATA }

    let actualLiveRoomUrl = 'https://meet.google.com/live-room'
    let configuredPrice = Number(price) || 0
    let seatsRemaining = 10

    if (itemType === 'event') {
      const foundEvt = currentData.liveEvents.find((e) => e.id === itemId)
      if (foundEvt) {
        if (foundEvt.liveRoomUrl) actualLiveRoomUrl = foundEvt.liveRoomUrl
        seatsRemaining = foundEvt.seatsLeft ?? 10
      }
    } else {
      const foundSch = currentData.schedules.find((s) => s.id === itemId)
      if (foundSch) {
        if (foundSch.liveRoomUrl) actualLiveRoomUrl = foundSch.liveRoomUrl
        configuredPrice = foundSch.price ?? configuredPrice
        seatsRemaining = foundSch.seatsLeft ?? 10
      }
    }

    // 3. Check if user already has active access (either already paid, free reserved, or admin assigned)
    const existing = db
      .prepare(`
        SELECT id, access_type, created_at FROM schedule_reservations
        WHERE item_id = ? AND (user_id = ? OR LOWER(student_email) = LOWER(?))
        LIMIT 1
      `)
      .get(itemId, sessionUser.id, sessionUser.email) as
      | { id: number; access_type: string; created_at: string }
      | undefined

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You already have confirmed access to this session!',
        accessType: existing.access_type,
        liveRoomUrl: actualLiveRoomUrl,
        remainingSeats: seatsRemaining,
      })
    }

    // 4. Determine Access Type and Transaction details
    const isPaid = configuredPrice > 0
    const accessType = isPaid ? 'paid' : 'free_reserved'
    const transactionId = isPaid ? `TXN-LMS-${Date.now()}-${Math.floor(Math.random() * 1000)}` : null
    const finalPaymentMethod = isPaid ? paymentMethod : 'free'

    // 5. Save reservation to database
    db.prepare(`
      INSERT INTO schedule_reservations (
        item_id, item_type, item_title, student_name, student_email,
        user_id, access_type, amount_paid, payment_status, payment_method, transaction_id, note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemId,
      itemType || 'schedule',
      itemTitle || '',
      sessionUser.name,
      sessionUser.email,
      sessionUser.id,
      accessType,
      configuredPrice,
      'completed',
      finalPaymentMethod,
      transactionId,
      note || ''
    )

    // 6. Decrement seatsLeft in live_schedules_section settings
    let updatedSeatsLeft = Math.max(0, seatsRemaining - 1)
    try {
      if (itemType === 'event') {
        currentData.liveEvents = currentData.liveEvents.map((evt) => {
          if (evt.id === itemId) {
            const nextSeats = Math.max(0, (evt.seatsLeft || 1) - 1)
            updatedSeatsLeft = nextSeats
            return { ...evt, seatsLeft: nextSeats }
          }
          return evt
        })
      } else {
        currentData.schedules = currentData.schedules.map((sch) => {
          if (sch.id === itemId) {
            const nextSeats = Math.max(0, (sch.seatsLeft || 1) - 1)
            updatedSeatsLeft = nextSeats
            return { ...sch, seatsLeft: nextSeats }
          }
          return sch
        })
      }

      settingRepository.updateByType(
        'live_schedules_section',
        null,
        currentData as unknown as Record<string, unknown>
      )
    } catch (settingsErr) {
      console.error('Failed to update live_schedules_section seat count:', settingsErr)
    }

    return NextResponse.json({
      success: true,
      message: isPaid
        ? `Payment of $${configuredPrice} successful! Your seat is secured.`
        : `Congratulations ${sessionUser.name}! Your free seat is confirmed.`,
      accessType,
      amountPaid: configuredPrice,
      transactionId,
      liveRoomUrl: actualLiveRoomUrl,
      remainingSeats: updatedSeatsLeft,
    })
  } catch (error) {
    console.error('Seat reservation error:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to complete reservation. Please try again.',
      },
      { status: 500 }
    )
  }
}
