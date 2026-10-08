import { NextRequest, NextResponse } from 'next/server'
import { storageManager } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title } = body

    if (!title) {
      return NextResponse.json({ success: false, message: 'Video title is required' }, { status: 400 })
    }

    const res = await storageManager.initiateBunnyVideo(title)

    return NextResponse.json({
      success: true,
      upload_id: res.upload_id,
      video_id: res.video_id,
      library_id: res.library_id,
      signature: res.signature,
      expire: res.expire,
    })
  } catch (error: any) {
    console.error('Bunny initiate error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate Bunny Stream upload' },
      { status: 500 }
    )
  }
}
