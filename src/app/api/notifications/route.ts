import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { notificationRepository } from '@/lib/repositories/notificationRepository'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true' || searchParams.get('unread') === '1'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = notificationRepository.getForUser(session.id, {
      unreadOnly,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PUT() {
  try {
    const session = await requireAuth()
    const updatedCount = notificationRepository.markAllAsRead(session.id)

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to update notifications' }, { status: 500 })
  }
}
