import { NextRequest, NextResponse } from 'next/server'
import { settingRepository } from '@/lib/repositories/settingRepository'
import { DEFAULT_HERO_DATA, HeroSectionData } from '@/lib/data/hero-section'

export async function GET() {
  try {
    const record = settingRepository.getByType('hero_section')
    const data: HeroSectionData = record ? { ...DEFAULT_HERO_DATA, ...record } : DEFAULT_HERO_DATA
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch hero section settings:', error)
    return NextResponse.json({ success: false, data: DEFAULT_HERO_DATA, error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }

    const success = settingRepository.updateByType('hero_section', null, body)
    if (success) {
      return NextResponse.json({ success: true, message: 'Hero section settings updated successfully', data: body })
    }

    return NextResponse.json({ success: false, message: 'Failed to save settings' }, { status: 500 })
  } catch (error) {
    console.error('Failed to update hero section settings:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
