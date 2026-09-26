import React from 'react'
import type { Metadata } from 'next'
import ProductsContent from '@/components/products/ProductsContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store',
  description: 'Browse educational resources, templates, and digital materials on Mentor LMS.',
  openGraph: {
    title: 'Store | Mentor Learning Management System',
    description: 'Browse educational resources, templates, and digital materials on Mentor LMS.',
  },
}

export default function ProductsPage() {
  return <ProductsContent />
}
