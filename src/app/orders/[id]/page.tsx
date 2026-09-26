'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2, Printer, ArrowRight, BookOpen, ShoppingBag, Award, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OrderData {
  id: number
  invoice: string
  transactionId: string
  status: string
  gateway: string
  totalAmount: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string | number
    type: string
    title: string
    price: number
  }>
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = (params?.id as string) || 'ORD-982143'

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const displayInvoice = order?.invoice || orderId
  const displayItems = order?.items || [
    {
      id: 1,
      type: 'course',
      title: 'Full-Stack Next.js 15 & Modern React Architecture',
      price: 69.0,
    },
  ]
  const subtotal = order ? order.items.reduce((sum, item) => sum + item.price, 0) : 69.0
  const tax = subtotal * 0.05
  const total = order?.totalAmount || subtotal + tax
  const gatewayName = order?.gateway
    ? order.gateway.charAt(0).toUpperCase() + order.gateway.slice(1)
    : 'Credit Card (Stripe)'
  const txnId = order?.transactionId || 'txn_3M6qYz2eZvKYlo2C05r'
  const dateStr = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  return (
    <div className="min-h-screen bg-muted/20 py-16">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Thank you for your order. A confirmation receipt and direct access details have been linked to your account.
          </p>
        </div>

        {/* Invoice Card */}
        <Card className="p-8 border-border/80 shadow-md space-y-8 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                Official Invoice Receipt
              </p>
              <h2 className="text-xl font-bold text-foreground mt-1">Invoice #{displayInvoice}</h2>
              <p className="text-xs text-muted-foreground">Date: {dateStr}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 text-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Invoice
              </Button>
            </div>
          </div>

          {/* Enrolled Courses / Purchased Items Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Purchased Items</h3>
            <div className="rounded-xl border divide-y divide-border/60 overflow-hidden">
              {displayItems.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.type === 'course' && <BookOpen className="h-5 w-5" />}
                      {item.type === 'exam' && <Award className="h-5 w-5" />}
                      {item.type === 'product' && <ShoppingBag className="h-5 w-5" />}
                      {!['course', 'exam', 'product'].includes(item.type) && (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type || 'Item'} • Instant Lifetime Access
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Tally Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">Payment Details</p>
              <p>
                Payment Method: <span className="text-foreground">{gatewayName}</span>
              </p>
              <p>
                Payment Status:{' '}
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />{' '}
                  {order?.status === 'pending' ? 'Pending Approval' : 'Paid & Confirmed'}
                </span>
              </p>
              <p>
                Transaction ID: <span className="text-foreground font-mono">{txnId}</span>
              </p>
            </div>

            <div className="space-y-2 text-xs border-t sm:border-t-0 sm:border-l border-border sm:pl-6 pt-4 sm:pt-0">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT / Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2">
                <span>Total Paid</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Next Actions */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/courses/all"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Browse More Courses
            </Link>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button asChild variant="outline" className="w-full sm:w-auto font-medium rounded-xl text-xs">
                <Link href="/student">Go to Student Portal</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto font-bold rounded-xl gap-2 shadow-md text-xs">
                <Link href="/courses/fullstack-nextjs-15-architecture/learn">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
