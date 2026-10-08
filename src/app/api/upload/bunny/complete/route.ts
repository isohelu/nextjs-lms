import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { video_id, title } = body

    if (!video_id) {
      return NextResponse.json({ success: false, message: 'video_id is required' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Bunny Stream video upload marked as completed',
      upload_id: video_id,
      file_path: video_id,
      file_url: `https://iframe.mediadelivery.net/embed/${video_id}`,
      mime_type: 'video/mp4',
      file_name: title || video_id,
    })
  } catch (error: any) {
    console.error('Bunny complete error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to complete Bunny Stream upload' },
      { status: 500 }
    )
  }
}
