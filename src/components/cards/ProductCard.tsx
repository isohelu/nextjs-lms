'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Download, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/lib/store/useUserStore'

export interface ProductData {
  id: string | number
  title: string
  slug: string
  thumbnail?: string
  price: number
  discount?: boolean
  discount_price?: number | null
  pricing_type?: 'free' | 'paid'
  category_name?: string
  average_rating?: number
  reviews_count?: number
  instructor_name?: string
  instructor_photo?: string
  downloads_count?: number
  file_format?: string
  summary?: string
}

export default function ProductCard({
  product,
  className,
  viewType = 'grid',
}: {
  product: ProductData
  className?: string
  viewType?: 'grid' | 'list'
}) {
  const { isProductWishlisted, toggleProductWishlist } = useUserStore()
  const numId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id
  const isWishlisted = !isNaN(numId) ? isProductWishlisted(numId) : false
  const isFree = product.pricing_type === 'free' || product.price === 0
  const detailHref = `/products/details/${product.slug}/${product.id}`

  if (viewType === 'list') {
    return (
      <Card className={cn("group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-border bg-card p-0 transition-all duration-300 shadow-xs hover:shadow-md", className)}>
        <div className="relative sm:w-64 shrink-0 p-2.5">
          <Link href={detailHref} className="block overflow-hidden rounded-lg">
            <div className="relative h-48 sm:h-full w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={product.thumbnail || '/assets/images/blank-image.jpg'}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.file_format && (
                <div className="absolute top-2.5 left-2.5 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                  {product.file_format}
                </div>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              if (!isNaN(numId)) toggleProductWishlist(numId)
            }}
            className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 text-foreground backdrop-blur hover:bg-background cursor-pointer"
          >
            <Heart className={cn("h-4 w-4", isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              {product.instructor_name && (
                <span className="font-medium text-foreground">{product.instructor_name}</span>
              )}
              {product.category_name && (
                <>
                  <span>in</span>
                  <span className="text-primary font-medium">{product.category_name}</span>
                </>
              )}
            </div>
            <Link href={detailHref}>
              <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                {product.title}
              </h3>
            </Link>
            {product.summary && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {product.summary}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">
                  {product.average_rating ? product.average_rating.toFixed(2) : '5.00'}
                </span>
                <span>({product.reviews_count || 0})</span>
              </div>
              {product.downloads_count && (
                <div className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>{product.downloads_count} Sales</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                {isFree ? (
                  <span className="text-lg font-bold text-emerald-600">Free</span>
                ) : product.discount && product.discount_price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">${product.discount_price}</span>
                    <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-foreground">${product.price}</span>
                )}
              </div>
              <Button asChild size="sm">
                <Link href={detailHref}>View Product</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("group flex flex-col justify-between h-full overflow-hidden rounded-xl border border-border bg-card p-0 transition-all duration-300 shadow-xs hover:shadow-md", className)}>
      <CardHeader className="p-0">
        <div className="relative p-2 pb-0">
          <Link href={detailHref} className="block overflow-hidden rounded-lg">
            <div className="relative h-47.5 w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={product.thumbnail || '/assets/images/blank-image.jpg'}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.file_format && (
                <div className="absolute top-2.5 left-2.5 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                  {product.file_format}
                </div>
              )}
            </div>
          </Link>

          {/* Wishlist Button matching Laravel */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              if (!isNaN(numId)) toggleProductWishlist(numId)
            }}
            className="absolute top-3.5 right-3.5 z-10 rounded-full bg-background/85 p-2 text-foreground backdrop-blur hover:bg-background transition-opacity opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-xs"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-foreground"
              )}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {product.instructor_name && (
              <span className="font-medium text-foreground">{product.instructor_name}</span>
            )}
            {product.category_name && (
              <>
                <span>in</span>
                <span className="text-primary font-medium">{product.category_name}</span>
              </>
            )}
          </div>

          <Link href={detailHref}>
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary transition-colors min-h-10">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-foreground">
              {product.average_rating ? Number(product.average_rating).toFixed(2) : '5.00'}
            </span>
            <span>({product.reviews_count || 0})</span>
          </div>

          {product.downloads_count !== undefined && (
            <span>{product.downloads_count} Sales</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex w-full items-center justify-between border-t border-border/50 p-4 pt-3">
        <div>
          {isFree ? (
            <span className="font-bold text-emerald-600">Free</span>
          ) : product.discount && product.discount_price ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-foreground">${product.discount_price}</span>
              <span className="text-xs text-muted-foreground line-through">${product.price}</span>
            </div>
          ) : (
            <span className="font-bold text-foreground">${product.price}</span>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href={detailHref}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
