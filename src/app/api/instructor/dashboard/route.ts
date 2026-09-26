import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { dashboardRepository } from '@/lib/repositories/dashboardRepository'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])

    const dashboard = dashboardRepository.getDashboardData(user.id, 'instructor')

    // Also get instructor courses list
    let instructorId: number | null = null
    const instRow = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    if (instRow) instructorId = instRow.id

    const recentCourses = instructorId
      ? db.prepare(`
          SELECT c.id, c.title, c.slug, c.status, c.price, c.discount_price,
                 (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as enrollments_count,
                 (SELECT COALESCE(SUM(ph.instructor_revenue), 0) FROM payment_histories ph WHERE ph.course_id = c.id) as course_revenue
          FROM courses c
          WHERE c.instructor_id = ?
          ORDER BY c.id DESC
          LIMIT 5
        `).all(instructorId)
      : []

    return NextResponse.json({
      success: true,
      statistics: dashboard.statistics,
      revenueData: dashboard.revenueData,
      courseStatusDistribution: dashboard.courseStatusDistribution,
      pendingWithdrawals: dashboard.pendingWithdrawals,
      recentCourses
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructor access required.' }, { status: 403 })
    }
    console.error('Instructor dashboard stats error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve instructor stats.' }, { status: 500 })
  }
}
