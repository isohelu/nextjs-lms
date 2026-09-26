'use client'

import React, { useState, useEffect } from 'react'
import {
  CircleDollarSign,
  Wallet,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function PayoutsView() {
  const [balance, setBalance] = useState(8450)
  const [totalEarnings, setTotalEarnings] = useState(12800)
  const [totalPayouts, setTotalPayouts] = useState(4350)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('500')
  const [method, setMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [notes, setNotes] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const loadPayouts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/payouts')
      if (res.ok) {
        const data = await res.json()
        if (data.balance !== undefined) setBalance(data.balance)
        if (data.totalEarnings !== undefined) setTotalEarnings(data.totalEarnings)
        if (data.totalPayouts !== undefined) setTotalPayouts(data.totalPayouts)
        if (data.pendingAmount !== undefined) setPendingAmount(data.pendingAmount)
        if (data.payouts) setPayouts(data.payouts)
      }
    } catch (err) {
      console.error('Error loading instructor payouts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRequesting(true)
    try {
      const res = await fetch('/api/instructor/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method,
          notes,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        loadPayouts()
      }
    } catch (err) {
      console.error('Error submitting payout request:', err)
    } finally {
      setIsRequesting(false)
    }
  }

  const filtered = payouts.filter((p) =>
    (p.method || p.status || String(p.amount))
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Withdraw"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Withdraw' },
        ]}
        action={
          <>
            <Button onClick={() => setDialogOpen(true)} className="h-9 px-4">
              <Plus className="mr-2 h-4 w-4" />
              Withdraw Request
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout Withdrawal</DialogTitle>
                  <DialogDescription>
                    Enter amount to withdraw from your available balance of $
                    {balance.toFixed(2)}.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="amount">Withdraw Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="10"
                      max={balance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <select
                      id="method"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as any)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes / Reference (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Transfer note..."
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isRequesting}>
                      Submit Request
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
        className="mb-4"
      />

      {/* 4 Stat Cards matching Laravel 1:1 */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${totalEarnings.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Available
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${balance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${pendingAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Payouts
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${totalPayouts.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border/60">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search payout requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Loading payouts history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              No payout requests found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You have not submitted any withdrawal requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-xs font-medium uppercase">
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ${p.amount}
                    </td>
                    <td className="py-3 px-4 text-xs capitalize text-muted-foreground">
                      {p.method || 'Stripe'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={
                          p.status === 'completed' || p.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : p.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }
                      >
                        {p.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString()
                        : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
