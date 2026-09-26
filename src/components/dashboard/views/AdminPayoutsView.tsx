'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  ArrowUpRight,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AdminPayoutsProps {
  defaultStatus?: 'All' | 'pending' | 'completed'
  pageTitle?: string
}

export default function AdminPayoutsPage({
  defaultStatus = 'All',
  pageTitle = 'Instructor Payout Governance'
}: AdminPayoutsProps) {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'completed'>(defaultStatus)

  const loadPayouts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payouts')
      if (res.ok) {
        const data = await res.json()
        if (data.payouts) {
          setPayouts(data.payouts)
        }
      }
    } catch (err) {
      console.error('Error loading admin payouts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts()
  }, [])

  const handleComplete = async (id: number | string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (json.success) {
        setPayouts(prev =>
          prev.map(p => (p.id === id ? { ...p, status: 'completed' } : p))
        )
      } else {
        alert(json.message || 'Failed to process payout.')
      }
    } catch (err) {
      alert('Error processing payout transfer.')
    }
  }

  const filtered = payouts.filter((p) => {
    const instName = p.instructor_name || p.instructorName || ''
    const instEmail = p.instructor_email || p.instructorEmail || ''
    const matchesSearch =
      instName.toLowerCase().includes(search.toLowerCase()) ||
      instEmail.toLowerCase().includes(search.toLowerCase())

    const currentStatus = (p.status || 'pending').toLowerCase()
    const matchesStatus = filterStatus === 'All' || currentStatus === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review educator earnings withdrawal requests, verify tax accounts, and process bank wires.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search instructor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'pending', 'completed'] as const).map((tab) => (
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

        {/* Payouts List */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading payout requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No payout requests found</p>
            <p className="text-xs text-muted-foreground mt-1">Instructor withdrawal requests will appear here for governance.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const statusVal = (item.status || 'pending').toLowerCase()
              return (
                <Card key={item.id} className="p-6 border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {item.instructor_name || item.instructorName || 'Educator'}
                      </h3>
                      <span className={cn(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1',
                        statusVal === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      )}>
                        {statusVal === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {statusVal === 'completed' ? 'Paid / Completed' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Email: <strong className="text-foreground">{item.instructor_email || item.instructorEmail || 'instructor@example.com'}</strong></span>
                      <span>•</span>
                      <span>Method: <strong className="text-foreground">{item.payment_method || item.method || 'Bank Wire'}</strong></span>
                      <span>•</span>
                      <span>Requested: {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently')}</span>
                    </div>

                    {item.notes && (
                      <p className="text-xs font-mono text-muted-foreground bg-muted/20 p-2 rounded-md border border-border mt-1">
                        Wire Reference: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <p className="text-xs uppercase text-muted-foreground font-semibold">Transfer Total</p>
                      <p className="text-2xl font-black text-foreground">${Number(item.amount || 0).toFixed(2)}</p>
                    </div>

                    {statusVal === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Authorize & Mark Paid
                      </Button>
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
