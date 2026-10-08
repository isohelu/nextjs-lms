import { NextRequest, NextResponse } from 'next/server'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_TESTIMONIALS_DATA,
  TestimonialsSectionData,
} from '@/lib/data/testimonials-section'

export async function GET() {
  try {
    const record = settingRepository.getByType('testimonials_section')
    const data: TestimonialsSectionData = record
      ? { ...DEFAULT_TESTIMONIALS_DATA, ...record }
      : DEFAULT_TESTIMONIALS_DATA
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch testimonials section settings:', error)
    return NextResponse.json(
      { success: false, data: DEFAULT_TESTIMONIALS_DATA, error: 'Database error' },
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

    const success = settingRepository.updateByType('testimonials_section', null, body)
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Testimonials section settings updated successfully',
        data: body,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Failed to update testimonials section settings:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
