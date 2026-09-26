import db from '@/lib/db'

export interface DashboardStatistics {
  courses: number
  lessons: number
  enrollments: number
  students: number
  instructors: number
}

export interface DashboardData {
  statistics: DashboardStatistics
  revenueData: Record<string, number>
  courseStatusDistribution: Record<string, number>
  pendingWithdrawals: Array<{
    id: number
    user_id: number
    amount: number
    status: string
    payout_method: string
    created_at: string
    updated_at: string
    user?: {
      id: number
      name: string
      email: string
      photo?: string | null
    }
  }>
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const dashboardRepository = {
  getDashboardData(userId: number, role: 'admin' | 'instructor' | 'student', currentYear: number = new Date().getFullYear()): DashboardData {
    const isAdmin = role === 'admin'
    const isInstructor = role === 'instructor'

    // 1. Fetch courses IDs scoped to instructor if applicable
    let courseIds: number[] = []
    if (isInstructor) {
      const instructorRow = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(userId) as { id: number } | undefined
      if (instructorRow) {
        const rows = db.prepare('SELECT id FROM courses WHERE instructor_id = ?').all(instructorRow.id) as { id: number }[]
        courseIds = rows.map(r => r.id)
      }
    } else {
      const rows = db.prepare('SELECT id FROM courses').all() as { id: number }[]
      courseIds = rows.map(r => r.id)
    }

    // 2. Compute statistics
    let lessonsCount = 0
    let enrollmentsCount = 0
    let distinctStudentsCount = 0

    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(',')
      const lessonsRow = db.prepare(`SELECT COUNT(*) as count FROM section_lessons WHERE course_section_id IN (SELECT id FROM course_sections WHERE course_id IN (${placeholders}))`).get(...courseIds) as { count: number }
      lessonsCount = lessonsRow?.count || 0

      const enrollmentsRow = db.prepare(`SELECT COUNT(*) as count FROM course_enrollments WHERE course_id IN (${placeholders})`).get(...courseIds) as { count: number }
      enrollmentsCount = enrollmentsRow?.count || 0

      const studentsRow = db.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM course_enrollments WHERE course_id IN (${placeholders})`).get(...courseIds) as { count: number }
      distinctStudentsCount = studentsRow?.count || 0
    }

    let instructorsCount = 0
    if (isAdmin) {
      const instructorsRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'instructor'").get() as { count: number }
      instructorsCount = instructorsRow?.count || 0
    }

    const statistics: DashboardStatistics = {
      courses: courseIds.length,
      lessons: lessonsCount,
      enrollments: enrollmentsCount,
      students: distinctStudentsCount,
      instructors: instructorsCount
    }

    // 3. Compute 12-month revenue breakdown for currentYear
    const revenueColumn = isAdmin ? 'admin_revenue' : 'instructor_revenue'
    const revenueData: Record<string, number> = {}
    for (const m of MONTH_NAMES) {
      revenueData[m] = 0
    }

    const revenueRows = db.prepare(`
      SELECT strftime('%m', created_at) as month_num, SUM(${revenueColumn}) as revenue
      FROM payment_histories
      WHERE strftime('%Y', created_at) = ?
      GROUP BY strftime('%m', created_at)
    `).all(String(currentYear)) as { month_num: string; revenue: number }[]

    for (const r of revenueRows) {
      const mIndex = parseInt(r.month_num, 10) - 1
      if (mIndex >= 0 && mIndex < 12) {
        revenueData[MONTH_NAMES[mIndex]] = Math.round(Number(r.revenue || 0) * 100) / 100
      }
    }

    // 4. Compute Course Status Distribution
    const courseStatusDistribution: Record<string, number> = {
      Approved: 0,
      Upcoming: 0,
      Pending: 0,
      Private: 0,
      Draft: 0
    }

    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(',')
      const statusRows = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM courses
        WHERE id IN (${placeholders})
        GROUP BY status
      `).all(...courseIds) as { status: string; count: number }[]

      for (const r of statusRows) {
        const rawStatus = (r.status || '').toLowerCase()
        if (rawStatus === 'approved' || rawStatus === 'published' || rawStatus === 'active') {
          courseStatusDistribution['Approved'] += r.count
        } else if (rawStatus === 'upcoming') {
          courseStatusDistribution['Upcoming'] += r.count
        } else if (rawStatus === 'pending') {
          courseStatusDistribution['Pending'] += r.count
        } else if (rawStatus === 'private') {
          courseStatusDistribution['Private'] += r.count
        } else {
          courseStatusDistribution['Draft'] += r.count
        }
      }
    }

    // 5. Fetch Pending Withdrawals
    let pendingWithdrawalsQuery = `
      SELECT ph.id, ph.user_id, ph.amount, ph.status, ph.payout_method, ph.created_at, ph.updated_at,
             u.id as u_id, u.name as u_name, u.email as u_email, u.photo as u_photo
      FROM payout_histories ph
      LEFT JOIN users u ON ph.user_id = u.id
      WHERE ph.status = 'pending'
    `
    const pendingParams: any[] = []
    if (isInstructor) {
      pendingWithdrawalsQuery += ' AND ph.user_id = ?'
      pendingParams.push(userId)
    }
    pendingWithdrawalsQuery += ' ORDER BY ph.created_at DESC LIMIT 5'

    const withdrawalRows = db.prepare(pendingWithdrawalsQuery).all(...pendingParams) as any[]
    const pendingWithdrawals = withdrawalRows.map(w => ({
      id: w.id,
      user_id: w.user_id,
      amount: w.amount,
      status: w.status,
      payout_method: w.payout_method || 'PayPal',
      created_at: w.created_at,
      updated_at: w.updated_at,
      user: w.u_id ? {
        id: w.u_id,
        name: w.u_name,
        email: w.u_email,
        photo: w.u_photo
      } : undefined
    }))

    return {
      statistics,
      revenueData,
      courseStatusDistribution,
      pendingWithdrawals
    }
  }
}
