import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check payment_histories by invoice, id, or transaction_id
    const payment = db.prepare(`
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM payment_histories p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.invoice = ? OR p.id = ? OR p.transaction_id = ?
    `).get(id, isNaN(Number(id)) ? -1 : Number(id), id) as any

    if (payment) {
      let parsedMeta: any = {}
      try {
        parsedMeta = payment.meta ? JSON.parse(payment.meta) : {}
      } catch {}

      return NextResponse.json({
        success: true,
        order: {
          id: payment.id,
          invoice: payment.invoice,
          transactionId: payment.transaction_id,
          status: payment.status || parsedMeta.status || 'completed',
          gateway: payment.payment_type || payment.paid_type || parsedMeta.gateway || 'credit_card',
          totalAmount: Number(payment.amount ?? payment.paid_amount ?? 0),
          createdAt: payment.created_at,
          user: {
            name: payment.user_name || parsedMeta.billing?.firstName || 'Student',
            email: payment.user_email || parsedMeta.billing?.email || 'student@mentor.test',
          },
          items: parsedMeta.items || [
            {
              id: payment.purchase_id || payment.item_id || 1,
              type: payment.purchase_type || payment.item_type || 'course',
              title: (payment.purchase_type || payment.item_type) === 'product' ? 'Digital Store Product' : 'Enrolled Course',
              price: Number(payment.amount ?? payment.paid_amount ?? 0),
            },
          ],
        },
      })
    }

    // Check product_orders
    const prodOrder = db.prepare(`
      SELECT po.*, p.title as product_title, p.thumbnail as product_thumbnail,
             u.name as user_name, u.email as user_email
      FROM product_orders po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN users u ON po.user_id = u.id
      WHERE po.id = ?
    `).get(isNaN(Number(id)) ? -1 : Number(id)) as any

    if (prodOrder) {
      return NextResponse.json({
        success: true,
        order: {
          id: prodOrder.id,
          invoice: `ORD-${prodOrder.id}`,
          transactionId: `TXN-PROD-${prodOrder.id}`,
          status: 'completed',
          gateway: 'Credit Card',
          totalAmount: Number(prodOrder.total || prodOrder.unit_price || 0),
          createdAt: prodOrder.created_at,
          user: {
            name: prodOrder.user_name || 'Student',
            email: prodOrder.user_email || 'student@mentor.test',
          },
          items: [
            {
              id: prodOrder.product_id,
              type: 'product',
              title: prodOrder.product_title,
              price: Number(prodOrder.unit_price || 0),
            },
          ],
        },
      })
    }

    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
