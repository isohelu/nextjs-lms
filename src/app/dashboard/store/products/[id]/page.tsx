import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductUpdateManager from '@/components/dashboard/products/ProductUpdateManager'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProductEditPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedQuery = await searchParams
  const productId = parseInt(resolvedParams.id, 10)

  return (
    <DashboardLayout>
      <ProductUpdateManager
        initialProductId={productId}
        initialTab={resolvedQuery.tab || 'basic'}
      />
    </DashboardLayout>
  )
}
