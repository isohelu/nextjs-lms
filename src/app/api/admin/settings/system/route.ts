import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'

export async function GET() {
  try {
    await requireRole(['admin'])
    const settings = settingRepository.getSystemSettings()
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve settings.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const body = await req.json()
    const updated = settingRepository.updateByType('system', 'collaborative', body)

    return NextResponse.json({
      success: updated,
      message: 'System settings updated successfully.',
      settings: settingRepository.getSystemSettings()
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update system settings error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update system settings.' }, { status: 500 })
  }
}
