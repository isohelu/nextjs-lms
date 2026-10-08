import { NextRequest, NextResponse } from 'next/server'
import { settingRepository } from '@/lib/repositories/settingRepository'
import {
  DEFAULT_BLOG_SECTION_DATA,
  BlogSectionData,
} from '@/lib/data/blog-section'

export async function GET() {
  try {
    const record = settingRepository.getByType('blog_section')
    const data: BlogSectionData = record
      ? { ...DEFAULT_BLOG_SECTION_DATA, ...record }
      : DEFAULT_BLOG_SECTION_DATA
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch blog section settings:', error)
    return NextResponse.json(
      { success: false, data: DEFAULT_BLOG_SECTION_DATA, error: 'Database error' },
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

    const success = settingRepository.updateByType('blog_section', null, body)
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Blog section settings updated successfully',
        data: body,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Failed to update blog section settings:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
