import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

function getCompanyInvoiceSettings() {
  try {
    const row = db.prepare("SELECT fields FROM settings WHERE type = 'system'").get() as { fields: string } | undefined
    if (row?.fields) {
      const parsed = JSON.parse(row.fields)
      return {
        name: parsed.invoice_company_name || parsed.name || 'Mentor Learning Management System',
        logo: parsed.invoice_company_logo || parsed.logo_dark || '/assets/icons/logo-dark.png',
        email: parsed.invoice_company_email || parsed.email || 'billing@mentorlms.com',
        phone: parsed.invoice_company_phone || parsed.phone || '+1 (555) 234-5678',
        address: parsed.invoice_company_address || '100 Innovation Way, Suite 400, San Francisco, CA 94105, USA',
        taxNumber: parsed.invoice_tax_number || 'US-EIN 84-2918392',
        prefix: parsed.invoice_prefix || 'INV-',
        footerNote: parsed.invoice_footer_note || 'Thank you for learning with Mentor LMS. This receipt confirms your official registration and lifetime enrollment.',
        terms: parsed.invoice_terms || 'All purchases are subject to our 30-day money-back guarantee. Credentials and course materials are non-transferable.',
      }
    }
  } catch {}

  return {
    name: 'Mentor Learning Management System',
    logo: '/assets/icons/logo-dark.png',
    email: 'billing@mentorlms.com',
    phone: '+1 (555) 234-5678',
    address: '100 Innovation Way, Suite 400, San Francisco, CA 94105, USA',
    taxNumber: 'US-EIN 84-2918392',
    prefix: 'INV-',
    footerNote: 'Thank you for learning with Mentor LMS. This receipt confirms your official registration and lifetime enrollment.',
    terms: 'All purchases are subject to our 30-day money-back guarantee. Credentials and course materials are non-transferable.',
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const company = getCompanyInvoiceSettings()

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

      const billing = parsedMeta.billing || {}
      const customerName = (billing.firstName || billing.lastName)
        ? `${billing.firstName || ''} ${billing.lastName || ''}`.trim()
        : (payment.user_name || 'Student')

      return NextResponse.json({
        success: true,
        company,
        order: {
          id: payment.id,
          invoice: payment.invoice,
          transactionId: payment.transaction_id,
          status: payment.status || parsedMeta.status || 'completed',
          gateway: payment.payment_type || payment.paid_type || parsedMeta.gateway || 'credit_card',
          totalAmount: Number(payment.amount ?? payment.paid_amount ?? 0),
          tax: Number(payment.tax ?? 0),
          createdAt: payment.created_at,
          user: {
            name: customerName,
            email: billing.email || payment.user_email || 'student@mentor.test',
            phone: billing.phone || '',
            country: billing.country || 'United States',
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
        company,
        order: {
          id: prodOrder.id,
          invoice: `ORD-${prodOrder.id}`,
          transactionId: `TXN-PROD-${prodOrder.id}`,
          status: 'completed',
          gateway: 'Credit Card',
          totalAmount: Number(prodOrder.total || prodOrder.unit_price || 0),
          tax: Number(prodOrder.tax || 0),
          createdAt: prodOrder.created_at,
          user: {
            name: prodOrder.user_name || 'Student',
            email: prodOrder.user_email || 'student@mentor.test',
            phone: '',
            country: 'United States',
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
