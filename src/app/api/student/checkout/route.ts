import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import { examRepository } from '@/lib/repositories/examRepository'
import { productRepository } from '@/lib/repositories/productRepository'
import db from '@/lib/db'

const checkoutItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.enum(['course', 'exam', 'product']),
  title: z.string(),
  price: z.number().nonnegative(),
})

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  gateway: z.enum(['stripe', 'paypal', 'offline']),
  billing: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
  offlineInfo: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { items, gateway, billing, offlineInfo } = parsed.data
    const totalAmount = items.reduce((acc, item) => acc + item.price, 0)
    const tax = Math.round(totalAmount * 0.05 * 100) / 100
    const grandTotal = Math.round((totalAmount + tax) * 100) / 100

    const invoice = Math.floor(10000000 + Math.random() * 90000000).toString()
    const transactionId = `${gateway.toUpperCase()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`

    const isOnline = gateway !== 'offline'
    const status = isOnline ? 'completed' : 'pending'

    // Retrieve instructor revenue share configuration from system settings (matching Laravel PaymentService)
    const sysSetting = db.prepare("SELECT fields FROM system_settings WHERE type = 'system'").get() as { fields: string } | undefined
    let instructorRevenuePercent = 80
    if (sysSetting?.fields) {
      try {
        const parsedFields = JSON.parse(sysSetting.fields)
        if (parsedFields.instructor_revenue) {
          instructorRevenuePercent = Number(parsedFields.instructor_revenue)
        }
      } catch {}
    }

    // Determine primary instructor role for revenue calculation
    let isInstructorAdmin = false
    const firstItem = items[0]
    const firstNumId = parseInt(String(firstItem.id).replace(/^(course-|exam-|product-)/, ''), 10)
    if (!isNaN(firstNumId)) {
      let instRow: { role: string } | undefined
      if (firstItem.type === 'course') {
        instRow = db.prepare('SELECT u.role FROM courses c JOIN instructors ins ON c.instructor_id = ins.id JOIN users u ON ins.user_id = u.id WHERE c.id = ?').get(firstNumId) as any
      } else if (firstItem.type === 'exam') {
        instRow = db.prepare('SELECT u.role FROM exams e JOIN instructors ins ON e.instructor_id = ins.id JOIN users u ON ins.user_id = u.id WHERE e.id = ?').get(firstNumId) as any
      } else if (firstItem.type === 'product') {
        instRow = db.prepare('SELECT u.role FROM products p JOIN instructors ins ON p.instructor_id = ins.id JOIN users u ON ins.user_id = u.id WHERE p.id = ?').get(firstNumId) as any
      }
      if (instRow?.role === 'admin') {
        isInstructorAdmin = true
      }
    }

    // Calculate revenue split matching Laravel PaymentService@coursesBuy
    let adminRevenue = grandTotal
    let instructorRevenue = 0
    if (!isInstructorAdmin) {
      const instructorRevenueAmount = (grandTotal * instructorRevenuePercent) / 100
      instructorRevenue = Math.max(0, Math.round((instructorRevenueAmount - tax) * 100) / 100)
      adminRevenue = Math.round(((grandTotal - instructorRevenueAmount) + tax) * 100) / 100
    }

    const primaryPurchaseType = items.length === 1 ? items[0].type : 'cart_checkout'
    const primaryPurchaseId = items.length === 1 ? firstNumId : null

    const meta = JSON.stringify({
      status,
      gateway,
      billing,
      items,
      offlineInfo: offlineInfo || null,
      created_at: new Date().toISOString()
    })

    const transaction = db.transaction(() => {
      // 1. Insert into payment_histories
      const paymentStmt = db.prepare(`
        INSERT INTO payment_histories (
          payment_type, amount, admin_revenue, instructor_revenue, tax,
          coupon, invoice, transaction_id, session_id, user_id,
          purchase_type, purchase_id, meta, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          null, ?, ?, null, ?,
          ?, ?, ?, datetime('now'), datetime('now')
        )
      `)

      paymentStmt.run(
        gateway,
        grandTotal,
        adminRevenue,
        instructorRevenue,
        tax,
        invoice,
        transactionId,
        user.id,
        primaryPurchaseType,
        primaryPurchaseId,
        meta
      )

      // 2. If online payment, immediately fulfill purchases
      if (isOnline) {
        for (const item of items) {
          const rawId = String(item.id).replace(/^(course-|exam-|product-)/, '')
          const numId = parseInt(rawId, 10)

          if (!isNaN(numId)) {
            if (item.type === 'course') {
              courseRepository.enroll(user.id, numId, 'paid')
            } else if (item.type === 'exam') {
              examRepository.enroll(user.id, numId, 'paid')
            } else if (item.type === 'product') {
              const prod = productRepository.findById(numId)
              if (prod) {
                productRepository.createOrder({
                  userId: user.id,
                  productId: numId,
                  instructorId: prod.instructor_id || 1,
                  unitPrice: item.price,
                  total: item.price,
                })
                // Decrement inventory if limited (1:1 with Laravel PaymentService)
                db.prepare('UPDATE products SET inventory = MAX(0, inventory - 1) WHERE id = ? AND (unlimited_inventory = 0 OR unlimited_inventory IS NULL)').run(numId)
              }
            }
          }
        }
      }
    })

    transaction()

    return NextResponse.json({
      success: true,
      message: isOnline
        ? 'Payment processed and enrollment confirmed!'
        : 'Offline payment submitted successfully. Your enrollment will be active upon review.',
      orderId: invoice,
      transactionId,
      status,
      grandTotal
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to complete checkout.' }, { status: 401 })
    }
    console.error('Checkout error:', error)
    return NextResponse.json({ success: false, message: 'Checkout processing failed.' }, { status: 500 })
  }
}
