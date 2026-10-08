'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  Award,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ShieldCheck,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CompanyInfo {
  name: string
  logo: string
  email: string
  phone: string
  address: string
  taxNumber: string
  prefix: string
  footerNote: string
  terms: string
}

interface OrderData {
  id: number
  invoice: string
  transactionId: string
  status: string
  gateway: string
  totalAmount: number
  tax?: number
  createdAt: string
  user: {
    name: string
    email: string
    phone?: string
    country?: string
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
  const orderId = (params?.id as string) || '93151802'

  const [order, setOrder] = useState<OrderData | null>(null)
  const [company, setCompany] = useState<CompanyInfo>({
    name: 'Mentor Learning Management System',
    logo: '/assets/icons/logo-dark.png',
    email: 'billing@mentorlms.com',
    phone: '+1 (555) 234-5678',
    address: '100 Innovation Way, Suite 400, San Francisco, CA 94105, USA',
    taxNumber: 'US-EIN 84-2918392',
    prefix: 'INV-',
    footerNote: 'Thank you for learning with Mentor LMS. This receipt confirms your official course enrollment.',
    terms: 'All purchases are subject to our 30-day money-back guarantee. Credentials and course materials are non-transferable.',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order)
          if (data.company) {
            setCompany(data.company)
          }
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
      title: 'Advanced Full Stack Masterclass 2026',
      price: 19.99,
    },
  ]
  const subtotal = order ? order.items.reduce((sum, item) => sum + item.price, 0) : 19.99
  const tax = order?.tax ?? subtotal * 0.05
  const total = order?.totalAmount || subtotal + tax
  const gatewayName = order?.gateway
    ? order.gateway.charAt(0).toUpperCase() + order.gateway.slice(1)
    : 'Credit Card (Stripe)'
  const txnId = order?.transactionId || 'TXN-982143-STRIPE'
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

  const isPending = order?.status === 'pending'

  return (
    <>
      {/* ─── PRINT-ONLY DEDICATED INVOICE DOCUMENT ─────────────────── */}
      <div className="hidden print:block print-invoice-root w-full p-4 bg-white text-black font-sans text-xs">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-6">
          <div>
            <img
              src={company.logo || '/assets/icons/logo-dark.png'}
              alt={company.name}
              className="h-10 max-w-[200px] object-contain mb-3"
            />
            <h1 className="text-base font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 max-w-sm mt-0.5">{company.address}</p>
            <p className="text-gray-600 mt-0.5">
              Email: {company.email} | Tel: {company.phone}
            </p>
            {company.taxNumber && (
              <p className="text-gray-600 mt-0.5 font-mono text-xs">
                Tax Reg / EIN: {company.taxNumber}
              </p>
            )}
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-wider">INVOICE</h2>
            <p className="text-sm font-bold font-mono text-gray-800 mt-1">
              #{company.prefix || ''}{displayInvoice}
            </p>
            <p className="text-gray-600 mt-1">Date Issued: {dateStr}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${
                  isPending
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isPending ? 'PENDING APPROVAL' : 'PAID & CONFIRMED'}
              </span>
            </div>
          </div>
        </div>

        {/* Billing Info Grid */}
        <div className="grid grid-cols-2 gap-8 my-6 py-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Billed From:
            </p>
            <p className="font-bold text-gray-900">{company.name}</p>
            <p className="text-gray-700">{company.address}</p>
            <p className="text-gray-700">{company.email}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Billed To:
            </p>
            <p className="font-bold text-gray-900">{order?.user?.name || 'Customer'}</p>
            <p className="text-gray-700">{order?.user?.email || 'customer@example.com'}</p>
            {order?.user?.phone && <p className="text-gray-700">{order.user.phone}</p>}
            {order?.user?.country && <p className="text-gray-700">{order.user.country}</p>}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="my-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-800 text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3 font-bold w-12">#</th>
                <th className="py-2.5 px-3 font-bold">Item Description</th>
                <th className="py-2.5 px-3 font-bold w-32">Type</th>
                <th className="py-2.5 px-3 font-bold w-28 text-right">Price</th>
                <th className="py-2.5 px-3 font-bold w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">Instant Lifetime Access & Certificate</p>
                  </td>
                  <td className="py-3 px-3 capitalize text-gray-700">{item.type || 'Course'}</td>
                  <td className="py-3 px-3 text-right font-mono text-gray-800">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold font-mono text-gray-900">
                    ${Number(item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Summary Grid */}
        <div className="flex justify-between items-start my-6 pt-4 border-t border-gray-200">
          <div className="w-1/2 space-y-2 text-gray-700 pr-6">
            <p className="font-bold text-gray-900">Payment Summary</p>
            <p>
              Payment Method: <strong className="text-gray-900">{gatewayName}</strong>
            </p>
            <p>
              Transaction Reference:{' '}
              <span className="font-mono text-gray-900">{txnId}</span>
            </p>
            <p>
              Status:{' '}
              <strong className={isPending ? 'text-amber-700' : 'text-emerald-700'}>
                {isPending ? 'Pending Review' : 'Verified & Completed'}
              </strong>
            </p>
          </div>

          <div className="w-1/2 max-w-xs space-y-2 border-l border-gray-200 pl-6 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT / Estimated Tax (5%)</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-extrabold text-gray-900">
              <span>Total Paid</span>
              <span className="font-mono text-base">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Notes */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200 text-gray-500 text-xs space-y-2">
          <p className="font-semibold text-gray-700">{company.footerNote}</p>
          <p>{company.terms}</p>
          <p className="pt-2 text-gray-400">
            This is an official computer-generated invoice receipt issued by {company.name}.
          </p>
        </div>
      </div>

      {/* ─── WEB BROWSER INTERACTIVE SCREEN VIEW ────────────────────── */}
      <div className="print:hidden min-h-screen bg-muted/20 py-16">
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
                <h2 className="text-xl font-bold text-foreground mt-1">Invoice #{company.prefix || ''}{displayInvoice}</h2>
                <p className="text-xs text-muted-foreground">Date: {dateStr}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-2 text-xs cursor-pointer shadow-xs hover:bg-primary/5"
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
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isPending ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />{' '}
                    {isPending ? 'Pending Approval' : 'Paid & Confirmed'}
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
                  <Link href="/student">
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
