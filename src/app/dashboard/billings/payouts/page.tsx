'use client'

import React, { useState, useEffect } from 'react'
import {
  CircleDollarSign,
  Wallet,
  DollarSign,
  Plus,
  Loader2,
  FileText,
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface PayoutItem {
  id: number
  amount: number
  payout_method: string
  status: string
  created_at: string
  updated_at: string
}

export default function DashboardPayoutsPage() {
  const [balance, setBalance] = useState(8450)
  const [totalEarnings, setTotalEarnings] = useState(12800)
  const [totalPayouts, setTotalPayouts] = useState(4350)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [payouts, setPayouts] = useState<PayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Request withdrawal modal
  const [dialogOpen, setDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('500')
  const [method, setMethod] = useState<'stripe' | 'paypal' | 'offline'>('stripe')
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
      } else {
        // Fallback demo data
        setPayouts([
          {
            id: 1,
            amount: 1500,
            payout_method: 'Stripe',
            status: 'approved',
            created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          },
          {
            id: 2,
            amount: 2850,
            payout_method: 'PayPal',
            status: 'approved',
            created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 39 * 86400000).toISOString(),
          },
        ])
      }
    } catch (err) {
      console.error('Error loading payouts:', err)
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid withdrawal amount')
      return
    }
    if (amt > balance) {
      toast.error('Requested amount exceeds available balance')
      return
    }

    try {
      setIsRequesting(true)
      const res = await fetch('/api/instructor/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          method,
          notes,
        }),
      })

      if (res.ok) {
        toast.success('Withdrawal request submitted successfully')
        setDialogOpen(false)
        loadPayouts()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to submit withdrawal request')
      }
    } catch {
      toast.error('Error submitting withdrawal request')
    } finally {
      setIsRequesting(false)
    }
  }

  const filtered = payouts.filter((p) =>
    (p.payout_method || p.status || String(p.amount))
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Payouts"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Billing' },
          { title: 'Payouts' },
        ]}
        className="mb-4"
      />

      {/* 4 Metric Cards */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">${totalEarnings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">${balance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payout
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">${totalPayouts.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <p className="mt-1 text-2xl font-bold text-foreground">${pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Table Card */}
      <Card>
        <TableFilter
          title="Payout History"
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setCurrentPage(1)
          }}
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz)
            setCurrentPage(1)
          }}
          tablePageSizes={[10, 15, 20, 25]}
          component={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Request a Withdrawal
            </Button>
          }
        />

        <Table className="border-y border-border py-0">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Payout Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Payout Method</TableHead>
              <TableHead className="pr-6 text-right">Processed Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading payout history...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="py-6">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">No payout history</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have not made any withdrawal requests yet.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((payout) => (
                <TableRow key={payout.id}>
                  {/* Amount and Request Date */}
                  <TableCell className="pl-6 py-3">
                    <p className="font-semibold text-foreground">${payout.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 text-center capitalize">
                    <Badge
                      variant={
                        payout.status === 'approved'
                          ? 'default'
                          : payout.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="rounded-full capitalize text-xs"
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>

                  {/* Method */}
                  <TableCell className="py-3 text-center capitalize">
                    <span className="text-sm font-medium text-foreground">
                      {payout.payout_method}
                    </span>
                  </TableCell>

                  {/* Processed Date */}
                  <TableCell className="pr-6 py-3 text-right text-xs text-muted-foreground">
                    {new Date(payout.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TableFooter
          className="border-none p-4 sm:p-6"
          currentPage={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {/* Withdrawal Request Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleWithdraw} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amt">Amount ($)</Label>
              <Input
                id="withdraw-amt"
                type="number"
                min="10"
                max={balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="500"
                required
              />
              <span className="text-[11px] text-muted-foreground">
                Available to withdraw: ${balance.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-method">Payout Method</Label>
              <Select
                value={method}
                onValueChange={(val: 'stripe' | 'paypal' | 'offline') => setMethod(val)}
              >
                <SelectTrigger id="withdraw-method">
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe Connect (Bank Transfer)</SelectItem>
                  <SelectItem value="paypal">PayPal Wallet</SelectItem>
                  <SelectItem value="offline">Direct Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-notes">Notes / Account Details (Optional)</Label>
              <Input
                id="withdraw-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Account email or bank reference notes"
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
                {isRequesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
