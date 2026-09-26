import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById, getProductBySlug, PRODUCTS_DATA } from '@/lib/data/products'
import ProductDetailClient from '@/components/products/ProductDetailClient'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id, slug } = await params
  const product = getProductById(id) || getProductBySlug(slug) || PRODUCTS_DATA[0]

  return {
    title: `${product.title} | Store`,
    description: product.summary,
    openGraph: {
      title: `${product.title} | Mentor Learning Management System`,
      description: product.summary,
      images: [
        {
          url: product.thumbnail,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Mentor LMS`,
      description: product.summary,
      images: [product.thumbnail],
    },
  }
}

export default async function ProductDetailsPage({ params }: ProductDetailPageProps) {
  const { id, slug } = await params
  const product = getProductById(id) || getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Schema.org structured JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.summary,
    image: product.thumbnail,
    category: product.product_category.title,
    offers: {
      '@type': 'Offer',
      price: product.pricing_type === 'free' ? '0.00' : (product.discount_price ?? product.price).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.reviews_count || 1,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  )
}
