'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface PendingWithdrawal {
  id: number
  amount: number
  status: string
  payout_method?: string
  created_at?: string
  user?: {
    id: number
    name: string
    email: string
    photo?: string | null
  }
}

interface PendingWithdrawalsCardProps {
  title?: string
  withdrawals?: PendingWithdrawal[]
  viewAllHref?: string
}

export default function PendingWithdrawalsCard({
  title = 'Latest Pending Withdrawal Request',
  withdrawals = [],
  viewAllHref = '/dashboard/billings/payouts'
}: PendingWithdrawalsCardProps) {
  return (
    <Card className="flex flex-col justify-between rounded-xl border border-border/60 bg-card shadow-xs">
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6 pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {title}
        </h3>
        <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
          <Link href={viewAllHref}>
            View All
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto border-t border-slate-100">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="pl-6 font-semibold text-slate-600">Name</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Payout Amount</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Status</TableHead>
              <TableHead className="pr-6 text-right font-semibold text-slate-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length > 0 ? (
              withdrawals.map((item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-slate-200">
                        <AvatarImage src={item.user?.photo || ''} alt={item.user?.name || 'User'} />
                        <AvatarFallback className="bg-slate-900 text-xs font-bold text-white">
                          {(item.user?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {item.user?.name || 'Instructor'}
                        </p>
                        <p className="text-xs text-slate-500">{item.user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm font-semibold text-slate-900">
                    ${Number(item.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button asChild size="sm" className="h-8 rounded-lg bg-[#007867] px-3 text-xs font-semibold text-white hover:bg-[#007867]/90">
                      <Link href={`/admin/payouts?request_id=${item.id}`}>
                        Pay
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-sm text-slate-400">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
