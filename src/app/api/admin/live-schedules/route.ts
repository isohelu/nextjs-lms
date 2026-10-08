import { NextRequest, NextResponse } from 'next/server'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_LIVE_SCHEDULES_DATA,
  LiveSchedulesSectionData,
} from '@/lib/data/live-schedules-section'

export async function GET() {
  try {
    const record = settingRepository.getByType('live_schedules_section')
    const data: LiveSchedulesSectionData = record
      ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...record }
      : DEFAULT_LIVE_SCHEDULES_DATA
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch live schedules settings:', error)
    return NextResponse.json(
      { success: false, data: DEFAULT_LIVE_SCHEDULES_DATA, error: 'Database error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const success = settingRepository.updateByType('live_schedules_section', null, body)
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Live masterclasses & schedules section updated successfully',
        data: body,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Failed to update live schedules settings:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
