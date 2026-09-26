'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowRight,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function AdminOfflinePaymentsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'completed' | 'rejected'>('All')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/offline-payments')
      if (res.ok) {
        const data = await res.json()
        if (data.payments) {
          setOrders(data.payments)
        }
      }
    } catch (err) {
      console.error('Error loading offline payments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleApprove = async (id: number | string) => {
    try {
      const res = await fetch(`/api/admin/offline-payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (json.success) {
        setOrders(prev =>
          prev.map(ord => (ord.id === id ? { ...ord, status: 'completed' } : ord))
        )
      } else {
        alert(json.message || 'Failed to verify payment.')
      }
    } catch (err) {
      alert('Error verifying offline payment.')
    }
  }

  const handleReject = async (id: number | string) => {
    if (!confirm('Are you sure you want to reject this offline bank wire payment?')) return

    try {
      setOrders(prev =>
        prev.map(ord => (ord.id === id ? { ...ord, status: 'rejected' } : ord))
      )
    } catch (err) {
      console.error('Error rejecting offline payment:', err)
    }
  }

  const filtered = orders.filter((o) => {
    const studentName = o.user_name || o.studentName || ''
    const invoiceNum = o.invoice_id || o.orderNumber || ''
    const bankRef = o.payment_id || o.bankReference || ''

    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      invoiceNum.toLowerCase().includes(search.toLowerCase()) ||
      bankRef.toLowerCase().includes(search.toLowerCase())

    const currentStatus = (o.status || 'pending').toLowerCase()
    const matchesStatus = filterStatus === 'All' || currentStatus === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Offline Bank Payments Verification</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review deposit slips, verify Swift/Wire references, and trigger automatic course enrollments.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reference, invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'pending', 'completed', 'rejected'] as const).map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={filterStatus === tab ? 'default' : 'outline'}
                onClick={() => setFilterStatus(tab)}
                className="text-xs font-semibold h-8 capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading bank wire receipts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No offline payment slips found</p>
            <p className="text-xs text-muted-foreground mt-1">Submitted bank wire proofs will appear here for verification.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((ord) => {
              const statusVal = (ord.status || 'pending').toLowerCase()
              return (
                <Card key={ord.id} className="p-6 border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {ord.invoice_id || ord.orderNumber || `ORD-${ord.id}`}
                      </span>
                      <span className={cn(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1',
                        statusVal === 'completed' || statusVal === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : statusVal === 'rejected'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      )}>
                        {statusVal === 'completed' || statusVal === 'approved' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : statusVal === 'rejected' ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {statusVal === 'completed' ? 'Approved & Enrolled' : statusVal}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {ord.item_name || ord.itemTitle || 'Learning Product / Course'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Payer: <strong className="text-foreground">{ord.user_name || ord.studentName || 'Student'}</strong> ({ord.user_email || ord.studentEmail || 'student@example.com'})</span>
                      <span>•</span>
                      <span>Amount: <strong className="text-foreground">${Number(ord.total_amount || ord.amount || 0).toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Bank Ref: <strong className="font-mono text-foreground">{ord.payment_id || ord.bankReference || 'WIRE-PENDING'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {statusVal === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(ord.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Verify & Enroll
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(ord.id)}
                          className="text-xs h-8 text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
