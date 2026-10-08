import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import db from '@/lib/db'

export async function GET() {
  try {
    await requireRole(['admin'])
    const raw = settingRepository.getByType('system', 'collaborative') || {}
    const navbars = db.prepare('SELECT * FROM navbars').all() as any[]
    const navbarItems = db.prepare('SELECT * FROM navbar_items WHERE active = 1 ORDER BY sort ASC').all() as any[]
    const footers = db.prepare('SELECT * FROM footers').all() as any[]
    const footerItems = db.prepare('SELECT * FROM footer_items WHERE active = 1 ORDER BY sort ASC').all() as any[]

    return NextResponse.json({
      success: true,
      settings: raw,
      navbars,
      navbarItems,
      footers,
      footerSections: footerItems,
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
      settings: settingRepository.getByType('system', 'collaborative') || {}
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
