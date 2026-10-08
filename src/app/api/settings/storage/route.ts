import { NextResponse } from 'next/server'
import { storageManager } from '@/lib/storage'

export async function GET() {
  try {
    const settings = storageManager.getSettings()
    // Exclude private secrets from public response
    return NextResponse.json({
      success: true,
      storage_driver: settings.storage_driver,
      r2_public_url: settings.r2_public_url || null,
      bunny_library_id: settings.bunny_library_id || null,
    })
  } catch (err: unknown) {
    console.error('Public storage info error:', err)
    return NextResponse.json({ success: false, message: 'Failed to get public storage info' }, { status: 500 })
  }
}
