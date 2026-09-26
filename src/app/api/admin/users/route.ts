import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const result = userRepository.listAll({
      role,
      search,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      users: result.users,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Admin users list error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve users.' }, { status: 500 })
  }
}
