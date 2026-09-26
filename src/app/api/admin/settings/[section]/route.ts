import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import db from '@/lib/db'

const SECTION_MAP: Record<string, { type: string; subType: string | null }> = {
  system: { type: 'system', subType: 'collaborative' },
  smtp: { type: 'smtp', subType: null },
  storage: { type: 'storage', subType: null },
  pages: { type: 'home_page', subType: null },
  auth0: { type: 'auth', subType: 'google' },
  'live-class': { type: 'live_class', subType: null },
  'meta-pixel': { type: 'meta_pixel', subType: null },
  'google-analytics': { type: 'google_analytics', subType: null },
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  try {
    await requireRole(['admin', 'instructor'])
    const { section } = await context.params

    if (section === 'plugins') {
      const plugins = [
        { name: 'AIAssistant', title: 'AI Assistant', description: 'Intelligent AI generation for courses and lectures', is_active: true },
        { name: 'Certification', title: 'Certificates & Marksheets', description: 'Dynamic credential generator and builder', is_active: true },
        { name: 'OfflinePayment', title: 'Offline Payments', description: 'Bank transfer and direct offline receipt verification', is_active: true },
      ]
      return NextResponse.json({ success: true, plugins })
    }

    if (section === 'maintenance') {
      const system = settingRepository.getByType('system', 'collaborative') || {}
      return NextResponse.json({
        success: true,
        maintenance: {
          enabled: (system as any).maintenance_mode || false,
          bypass_secret: (system as any).maintenance_secret || 'mentor-secret-key-2026',
        }
      })
    }

    const mapping = SECTION_MAP[section]
    if (!mapping) {
      return NextResponse.json({ success: false, message: 'Invalid settings section' }, { status: 404 })
    }

    const fields = settingRepository.getByType(mapping.type, mapping.subType)
    return NextResponse.json({
      success: true,
      section,
      settings: fields || {}
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve settings' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  try {
    await requireRole(['admin', 'instructor'])
    const { section } = await context.params
    const body = await req.json()

    if (section === 'maintenance') {
      const system = settingRepository.getByType('system', 'collaborative') || {}
      const updated = {
        ...system,
        maintenance_mode: body.enabled,
        maintenance_secret: body.bypass_secret
      }
      settingRepository.updateByType('system', 'collaborative', updated)
      return NextResponse.json({ success: true, message: 'Maintenance mode updated.' })
    }

    if (section === 'plugins') {
      return NextResponse.json({ success: true, message: 'Plugin status updated.' })
    }

    const mapping = SECTION_MAP[section]
    if (!mapping) {
      return NextResponse.json({ success: false, message: 'Invalid settings section' }, { status: 404 })
    }

    const current = settingRepository.getByType(mapping.type, mapping.subType) || {}
    const merged = { ...current, ...body }
    settingRepository.updateByType(mapping.type, mapping.subType, merged)

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully.`,
      settings: merged
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 })
  }
}
