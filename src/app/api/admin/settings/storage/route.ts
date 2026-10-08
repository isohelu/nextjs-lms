import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'
import { storageManager } from '@/lib/storage'
import { z } from 'zod'

const storageSchema = z.object({
  storage_driver: z.enum(['local', 's3', 'r2', 'bunny']),
  aws_access_key_id: z.string().optional().nullable(),
  aws_secret_access_key: z.string().optional().nullable(),
  aws_default_region: z.string().optional().nullable(),
  aws_bucket: z.string().optional().nullable(),
  r2_access_key_id: z.string().optional().nullable(),
  r2_secret_access_key: z.string().optional().nullable(),
  r2_bucket: z.string().optional().nullable(),
  r2_endpoint: z.string().optional().nullable(),
  r2_public_url: z.string().optional().nullable(),
  r2_region: z.string().optional().nullable(),
  bunny_library_id: z.string().optional().nullable(),
  bunny_api_key: z.string().optional().nullable(),
  bunny_token_auth_key: z.string().optional().nullable(),
})

export async function GET() {
  try {
    await requireRole(['admin', 'instructor'])
    const settings = storageManager.getSettings()
    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve storage settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['admin', 'instructor'])
    const body = await req.json()
    const parsed = storageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: parsed.error.format() },
        { status: 422 }
      )
    }

    const current = settingRepository.getByType('storage') || {}
    const updated = { ...current, ...parsed.data }
    settingRepository.updateByType('storage', null, updated)

    return NextResponse.json({
      success: true,
      message: 'Storage settings updated successfully.',
      settings: updated,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Storage settings update error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update storage settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return PUT(req)
}
