'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Loader2,
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ProductSalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadSales = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/sales')
      if (res.ok) {
        const data = await res.json()
        if (data.analytics) {
          setSales(data.analytics.recentSales || [])
        }
      }
    } catch (err) {
      console.error('Error loading product sales:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const filtered = sales.filter((s) => {
    const term = search.toLowerCase()
    return (
      (s.product_title && s.product_title.toLowerCase().includes(term)) ||
      (s.student_name && s.student_name.toLowerCase().includes(term)) ||
      (s.student_email && s.student_email.toLowerCase().includes(term))
    )
  })

  const paginatedSales = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Sales"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Product Sales' },
        ]}
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Product Sales"
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setCurrentPage(1)
          }}
          pageSize={pageSize}
          onPageSizeChange={(val) => {
            setPageSize(val)
            setCurrentPage(1)
          }}
          tablePageSizes={[10, 15, 20, 25]}
        />

        <Table className="border-y border-border">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="text-center font-semibold">Subtotal</TableHead>
              <TableHead className="text-center font-semibold">Discount</TableHead>
              <TableHead className="text-center font-semibold">Tax</TableHead>
              <TableHead className="text-center font-semibold">Total</TableHead>
              <TableHead className="pr-6 text-end font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading sales records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedSales.length > 0 ? (
              paginatedSales.map((order) => {
                const subtotal = Number(order.subtotal || order.unit_price || order.total || 0)
                const discount = Number(order.discount || 0)
                const tax = Number(order.tax || 0)
                const total = Number(order.total || subtotal - discount + tax)

                return (
                  <TableRow key={order.id}>
                    {/* Customer */}
                    <TableCell className="pl-6 py-3">
                      <p className="font-medium text-foreground">
                        {order.student_name || 'Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.student_email || ''}
                      </p>
                    </TableCell>

                    {/* Product */}
                    <TableCell className="py-3">
                      <Link
                        href={`/dashboard/store/products/${order.product_id || order.id}`}
                        className="hover:underline font-medium text-foreground"
                      >
                        {order.product_title || 'Digital Product'}
                      </Link>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell className="text-center py-3 text-sm">
                      ${subtotal.toFixed(2)}
                    </TableCell>

                    {/* Discount */}
                    <TableCell className="text-center py-3 text-sm">
                      ${discount.toFixed(2)}
                    </TableCell>

                    {/* Tax */}
                    <TableCell className="text-center py-3 text-sm">
                      ${tax.toFixed(2)}
                    </TableCell>

                    {/* Total */}
                    <TableCell className="text-center font-semibold py-3 text-sm">
                      ${total.toFixed(2)}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="pr-6 text-end py-3 text-sm text-muted-foreground">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No sales yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TableFooter
          className="p-0 py-5 sm:p-7"
          currentPage={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </DashboardLayout>
  )
}
