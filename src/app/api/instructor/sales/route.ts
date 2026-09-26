import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : (user.role === 'admin' ? 1 : -1)

    // Course enrollments for instructor's courses
    const courseEnrollments = db.prepare(`
      SELECT ce.id, ce.enrollment_type, ce.created_at, c.title as course_title, u.name as student_name, u.email as student_email
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      JOIN users u ON ce.user_id = u.id
      WHERE c.instructor_id = ?
      ORDER BY ce.id DESC
      LIMIT 50
    `).all(instructorId)

    // Product orders for instructor's products
    const productSales = db.prepare(`
      SELECT po.id, po.unit_price, po.total, po.created_at, p.title as product_title, u.name as student_name, u.email as student_email
      FROM product_orders po
      JOIN products p ON po.product_id = p.id
      JOIN users u ON po.user_id = u.id
      WHERE po.instructor_id = ?
      ORDER BY po.id DESC
      LIMIT 50
    `).all(instructorId)

    const totalProductRevenue = (db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total FROM product_orders WHERE instructor_id = ?
    `).get(instructorId) as { total: number }).total

    return NextResponse.json({
      success: true,
      analytics: {
        totalEnrollments: courseEnrollments.length,
        totalProductSales: productSales.length,
        totalProductRevenue,
        recentEnrollments: courseEnrollments,
        recentSales: productSales
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    console.error('Fetch sales analytics error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve sales.' }, { status: 500 })
  }
}
