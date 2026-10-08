import { NextRequest, NextResponse } from 'next/server'
import { settingRepository } from '@/lib/repositories/settingRepository'
import { DEFAULT_LEARNING_JOURNEY_DATA, LearningJourneyData } from '@/lib/data/learning-journey'

export async function GET() {
  try {
    const record = settingRepository.getByType('learning_journey')
    const data: LearningJourneyData = record
      ? { ...DEFAULT_LEARNING_JOURNEY_DATA, ...record }
      : DEFAULT_LEARNING_JOURNEY_DATA
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch learning journey settings:', error)
    return NextResponse.json(
      { success: false, data: DEFAULT_LEARNING_JOURNEY_DATA, error: 'Database error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }

    const success = settingRepository.updateByType('learning_journey', null, body)
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Learning Journey settings updated successfully',
        data: body,
      })
    }

    return NextResponse.json({ success: false, message: 'Failed to save settings' }, { status: 500 })
  } catch (error) {
    console.error('Failed to update learning journey settings:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
