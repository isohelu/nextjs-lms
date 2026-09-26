import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import { dashboardRepository } from '@/lib/repositories/dashboardRepository'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['admin'])

    const dashboard = dashboardRepository.getDashboardData(user.id, 'admin')

    const totalRevenueRow = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payment_histories').get() as { total: number }
    const totalExamsRow = db.prepare('SELECT COUNT(*) as count FROM exams').get() as { count: number }
    const totalProductsRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }

    const recentPayments = db.prepare(`
      SELECT ph.id, ph.payment_type, ph.amount, ph.invoice, ph.transaction_id, ph.created_at,
             u.name as user_name, u.email as user_email
      FROM payment_histories ph
      LEFT JOIN users u ON ph.user_id = u.id
      ORDER BY ph.id DESC
      LIMIT 6
    `).all()

    return NextResponse.json({
      success: true,
      statistics: dashboard.statistics,
      revenueData: dashboard.revenueData,
      courseStatusDistribution: dashboard.courseStatusDistribution,
      pendingWithdrawals: dashboard.pendingWithdrawals,
      stats: {
        totalRevenue: totalRevenueRow?.total || 0,
        totalLearners: dashboard.statistics.students,
        verifiedInstructors: dashboard.statistics.instructors,
        activeCourses: dashboard.statistics.courses,
        activeExams: totalExamsRow?.count || 0,
        activeProducts: totalProductsRow?.count || 0,
      },
      recentPayments
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Admin dashboard stats error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve admin stats.' }, { status: 500 })
  }
}
