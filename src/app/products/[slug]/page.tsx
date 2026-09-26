import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlugOrId, PRODUCTS_DATA, ProductItem } from '@/lib/data/products'
import { productRepository } from '@/lib/repositories/productRepository'
import ProductDetailClient from '@/components/products/ProductDetailClient'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

function resolveProduct(slug: string): ProductItem | null {
  const fallback = getProductBySlugOrId(slug)
  const isId = /^\d+$/.test(slug)
  const dbProd = isId ? productRepository.findById(Number(slug)) : productRepository.findBySlug(slug)

  if (!dbProd && !fallback) return null

  if (dbProd) {
    const fullDb = productRepository.findBySlug(dbProd.slug) || dbProd
    const specs = (fullDb as any).specifications || []
    const faqs = (fullDb as any).faqs || []
    const files = (fullDb as any).files || []

    return {
      id: dbProd.id,
      title: dbProd.title,
      slug: dbProd.slug,
      thumbnail: dbProd.thumbnail || fallback?.thumbnail || '/assets/images/blank-image.jpg',
      images: fallback?.images || [{ id: 1, url: dbProd.thumbnail || '/assets/images/blank-image.jpg' }],
      price: Number(dbProd.price || 0),
      discount: Boolean(dbProd.discount),
      discount_price: dbProd.discount_price ? Number(dbProd.discount_price) : null,
      pricing_type: (dbProd.pricing_type as 'free' | 'paid') || (dbProd.price && dbProd.price > 0 ? 'paid' : 'free'),
      featured: Boolean(dbProd.featured),
      unlimited_inventory: Boolean(dbProd.unlimited_inventory ?? 1),
      status: (dbProd.status as any) || 'approved',
      orders_count: Number(dbProd.orders_count || 12),
      average_rating: Number(dbProd.average_rating || 5.0),
      reviews_count: Number(dbProd.reviews_count || 4),
      summary: dbProd.summary || fallback?.summary || '',
      description: dbProd.description || fallback?.description || '',
      product_category: {
        id: dbProd.product_category_id || 1,
        title: dbProd.category_title || fallback?.product_category.title || 'Design & Code',
        slug: dbProd.category_slug || fallback?.product_category.slug || 'all',
      },
      instructor: {
        id: dbProd.instructor_id || 1,
        user: {
          id: dbProd.instructor_id || 1,
          name: dbProd.instructor_name || fallback?.instructor.user.name || 'Expert Instructor',
          email: 'instructor@mentor.test',
          photo: dbProd.instructor_photo || fallback?.instructor.user.photo || '',
        },
      },
      specifications: specs.length > 0
        ? specs.map((s: any) => ({ id: s.id, title: s.title, value: s.value }))
        : (fallback?.specifications || []),
      faqs: faqs.length > 0
        ? faqs.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }))
        : (fallback?.faqs || []),
      files: files.length > 0
        ? files.map((f: any) => ({
            id: f.id,
            name: f.name || f.file_name,
            size: `${(f.size / 1024).toFixed(0)} KB`,
            extension: f.mime_type?.split('/')[1] || 'zip',
            url: `/api/products/${dbProd.id}/download/${f.id}`,
          }))
        : (fallback?.files || []),
      reviews: fallback?.reviews || [],
    }
  }

  return fallback || null
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = resolveProduct(slug) || PRODUCTS_DATA[0]

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
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = resolveProduct(slug)

  if (!product) {
    notFound()
  }

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
