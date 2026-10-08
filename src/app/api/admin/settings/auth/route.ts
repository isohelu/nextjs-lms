import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'

export async function GET() {
  try {
    await requireRole(['admin'])
    const google = settingRepository.getByType('auth', 'google') || { active: true, client_id: '', client_secret: '', redirect: 'http://localhost:3000/api/auth/callback/google' }
    const recaptcha = settingRepository.getByType('auth', 'recaptcha') || { active: false, site_key: '', secret_key: '' }

    return NextResponse.json({
      success: true,
      google,
      recaptcha
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch auth settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const body = await req.json()
    const { sub_type, fields } = body

    if (!sub_type || !fields) {
      return NextResponse.json({ success: false, message: 'sub_type and fields are required' }, { status: 400 })
    }

    settingRepository.updateByType('auth', sub_type, fields)
    return NextResponse.json({
      success: true,
      message: `${sub_type === 'google' ? 'Google Auth' : 'reCAPTCHA'} settings updated successfully.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update auth settings' }, { status: 500 })
  }
}
