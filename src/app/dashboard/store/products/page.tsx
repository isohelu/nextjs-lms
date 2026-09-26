'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowUpDown, Eye, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/breadcrumbs'
import TableFilter from '@/components/table/table-filter'
import TableFooter from '@/components/table/table-footer'
import ActionsDropdown from '@/components/actions-dropdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function DashboardManageProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<'instructor' | 'title' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        status: 'all',
      })
      if (search.trim()) {
        queryParams.set('search', search.trim())
      }

      const res = await fetch(`/api/products?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
          setTotal(data.total || 0)
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [currentPage, pageSize, search])

  const handleDeleteProduct = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Product deleted successfully')
        loadProducts()
      } else {
        toast.error(data.message || 'Failed to delete product')
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
      toast.error('Failed to delete product')
    }
  }

  const toggleSort = (field: 'instructor' | 'title') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0
    if (sortField === 'instructor') {
      const nameA = (a.instructor_name || '').toLowerCase()
      const nameB = (b.instructor_name || '').toLowerCase()
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    }
    if (sortField === 'title') {
      const titleA = (a.title || '').toLowerCase()
      const titleB = (b.title || '').toLowerCase()
      return sortOrder === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA)
    }
    return 0
  })

  return (
    <DashboardLayout>
      <Breadcrumbs
        title="Products"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Products' },
        ]}
        action={
          <Button asChild className="h-9 px-4">
            <Link href="/dashboard/store/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Link>
          </Button>
        }
        className="mb-4"
      />

      <Card>
        <TableFilter
          title="Products"
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
              {/* Instructor */}
              <TableHead>
                <div className="flex items-center pl-1">
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-semibold"
                    onClick={() => toggleSort('instructor')}
                  >
                    Instructor
                    <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>

              {/* Title */}
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-semibold"
                  onClick={() => toggleSort('title')}
                >
                  Title
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableHead>

              {/* Status */}
              <TableHead className="text-center font-semibold">Status</TableHead>

              {/* Category */}
              <TableHead className="text-center font-semibold">Category</TableHead>

              {/* Price */}
              <TableHead className="text-center font-semibold">Price</TableHead>

              {/* Orders */}
              <TableHead className="text-center font-semibold">Orders</TableHead>

              {/* Actions */}
              <TableHead className="pr-4 text-end font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground text-sm">Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map((product) => {
                const discountPrice = product.discount_price ? Number(product.discount_price) : null
                const price = product.price ? Number(product.price) : 0
                const displayPrice = discountPrice || price

                return (
                  <TableRow key={product.id}>
                    {/* Instructor */}
                    <TableCell className="py-3">
                      <div className="pl-4">
                        <p className="mb-0.5 text-base font-medium">
                          {product.instructor_name || 'Admin Instructor'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.instructor_email || 'instructor@example.com'}
                        </p>
                      </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-3">
                      <div className="py-1">
                        <Link
                          href={`/dashboard/store/products/${product.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          {product.title}
                        </Link>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3 text-center capitalize text-sm">
                      {product.status || 'draft'}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3 text-center capitalize text-sm">
                      <p>{product.category_title || '--'}</p>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3 text-center text-sm">
                      <p>
                        {product.pricing_type === 'paid' && displayPrice > 0
                          ? `$${displayPrice.toFixed(2)}`
                          : 'Free'}
                      </p>
                    </TableCell>

                    {/* Orders */}
                    <TableCell className="py-3 text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{product.orders_count || 0}</span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3">
                      <div className="flex justify-end pr-4">
                        <ActionsDropdown
                          className="max-w-36"
                          routes={[
                            {
                              label: 'Edit',
                              method: 'get',
                              route: `/dashboard/store/products/${product.id}`,
                            },
                            {
                              label: 'Delete',
                              method: 'delete',
                              route: `/api/products/${product.id}`,
                              message: 'This product will be permanently deleted.',
                            },
                          ]}
                          onDeleteSuccess={loadProducts}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TableFooter
          className="p-0 py-5 sm:p-7"
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </DashboardLayout>
  )
}
