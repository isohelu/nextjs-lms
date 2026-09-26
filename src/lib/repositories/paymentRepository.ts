import db from '@/lib/db'
import { courseRepository } from './courseRepository'
import { examRepository } from './examRepository'
import { productRepository } from './productRepository'

export interface PaymentHistoryRecord {
  id: number
  payment_type: string
  amount: number
  admin_revenue: number
  instructor_revenue: number
  tax: number
  coupon?: string | null
  invoice?: string | null
  transaction_id?: string | null
  session_id?: string | null
  user_id: number
  course_id?: number | null
  purchase_type?: string | null
  purchase_id?: number | null
  meta?: string | null
  created_at: string
  updated_at: string
  // Virtual
  user_name?: string
  user_email?: string
  item_title?: string
}

export const paymentRepository = {
  submitOfflinePayment(data: {
    userId: number
    itemType: 'course' | 'exam' | 'product'
    itemId: number
    amount: number
    paymentInfo: string
    paymentDate: string
  }): number {
    const transactionId = 'OFFLINE-' + Math.random().toString(36).substring(2, 14).toUpperCase()
    const invoice = 'INV-' + Date.now()

    const meta = JSON.stringify({
      status: 'pending',
      item_type: data.itemType,
      item_id: data.itemId,
      payment_info: data.paymentInfo,
      payment_date: data.paymentDate,
      submitted_at: new Date().toISOString()
    })

    const stmt = db.prepare(`
      INSERT INTO payment_histories (
        payment_type, amount, admin_revenue, instructor_revenue, tax,
        coupon, invoice, transaction_id, session_id, user_id, course_id,
        purchase_type, purchase_id, meta, created_at, updated_at
      ) VALUES (
        'offline', ?, ?, 0, 0,
        null, ?, ?, null, ?, ?,
        ?, ?, ?, datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(
      data.amount,
      data.amount,
      invoice,
      transactionId,
      data.userId,
      data.itemType === 'course' ? data.itemId : null,
      data.itemType,
      data.itemId,
      meta
    )

    return Number(res.lastInsertRowid)
  },

  listOfflinePayments(): (PaymentHistoryRecord & { parsedMeta: Record<string, unknown> })[] {
    const stmt = db.prepare(`
      SELECT ph.*, u.name as user_name, u.email as user_email
      FROM payment_histories ph
      JOIN users u ON ph.user_id = u.id
      WHERE ph.payment_type = 'offline'
      ORDER BY ph.id DESC
    `)
    const rows = stmt.all() as PaymentHistoryRecord[]

    return rows.map(r => {
      let parsedMeta: Record<string, unknown> = {}
      try {
        if (r.meta) parsedMeta = JSON.parse(r.meta)
      } catch {
        parsedMeta = {}
      }
      return { ...r, parsedMeta }
    })
  },

  verifyOfflinePayment(paymentId: number, status: 'approved' | 'rejected', adminNotes?: string): boolean {
    const payment = db.prepare('SELECT * FROM payment_histories WHERE id = ?').get(paymentId) as PaymentHistoryRecord | undefined
    if (!payment) return false

    let meta: Record<string, unknown> = {}
    try {
      if (payment.meta) meta = JSON.parse(payment.meta)
    } catch {
      meta = {}
    }

    meta.status = status
    meta.verified_at = new Date().toISOString()
    if (adminNotes) meta.admin_notes = adminNotes

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE payment_histories SET meta = ?, updated_at = datetime('now') WHERE id = ?
      `).run(JSON.stringify(meta), paymentId)

      // Automatically enroll user upon approval (1:1 with Laravel PaymentReportController@verify)
      if (status === 'approved') {
        if (Array.isArray(meta.items) && meta.items.length > 0) {
          for (const itm of meta.items as any[]) {
            const rawId = String(itm.id).replace(/^(course-|exam-|product-)/, '')
            const numId = parseInt(rawId, 10)
            if (!isNaN(numId)) {
              if (itm.type === 'course') {
                courseRepository.enroll(payment.user_id, numId, 'paid')
              } else if (itm.type === 'exam') {
                examRepository.enroll(payment.user_id, numId, 'paid')
              } else if (itm.type === 'product') {
                const prod = productRepository.findById(numId)
                if (prod) {
                  productRepository.createOrder({
                    userId: payment.user_id,
                    productId: numId,
                    instructorId: prod.instructor_id || 1,
                    unitPrice: itm.price || 0,
                    total: itm.price || 0
                  })
                }
              }
            }
          }
        } else if (payment.purchase_id) {
          const itemType = (payment.purchase_type || meta.item_type) as string
          const itemId = payment.purchase_id

          if (itemType === 'course') {
            courseRepository.enroll(payment.user_id, itemId, 'paid')
          } else if (itemType === 'exam') {
            examRepository.enroll(payment.user_id, itemId, 'paid')
          } else if (itemType === 'product') {
            const prod = productRepository.findById(itemId)
            if (prod) {
              productRepository.createOrder({
                userId: payment.user_id,
                productId: itemId,
                instructorId: prod.instructor_id || 1,
                unitPrice: payment.amount,
                total: payment.amount
              })
            }
          }
        }
      }
    })

    transaction()
    return true
  }
}
