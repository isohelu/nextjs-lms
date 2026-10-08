'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Star, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/lib/store/useUserStore'

export interface ProductData {
  id: string | number
  title: string
  slug: string
  thumbnail?: string | null
  price: number
  discount?: boolean | number
  discount_price?: number | null
  pricing_type?: 'free' | 'paid' | string
  category_name?: string
  category_slug?: string
  average_rating?: number
  reviews_count?: number
  instructor_name?: string
  instructor_photo?: string | null
  instructor?: {
    user?: {
      name?: string
      photo?: string | null
    }
  }
  product_category?: {
    id?: number
    title?: string
    slug?: string
  }
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

  const [imgSrc, setImgSrc] = useState<string>(
    product.thumbnail || '/assets/images/blank-image.jpg'
  )

  const detailHref = `/products/${product.slug || product.id}`

  const instructorName =
    product.instructor?.user?.name || product.instructor_name || 'System Administrator'
  const instructorPhoto =
    product.instructor?.user?.photo || product.instructor_photo || null
  const categoryTitle =
    product.product_category?.title || product.category_name || null

  const isFree = product.pricing_type === 'free' || product.price === 0
  const hasDiscount = Boolean(product.discount && product.discount_price)

  const formatCurrency = (val: number) => `$${Number(val).toFixed(2).replace(/\.00$/, '')}`

  if (viewType === 'list') {
    return (
      <Card className={cn('group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-border p-0', className)}>
        <CardHeader className="p-0 sm:w-64 shrink-0">
          <div className="relative p-2 pb-0 sm:pb-2 sm:h-full">
            <Link href={detailHref} className="block h-full">
              <div className="relative h-48 sm:h-full min-h-[170px] overflow-hidden rounded-lg">
                <img
                  src={imgSrc}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImgSrc('/assets/images/blank-image.jpg')}
                />
              </div>
            </Link>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isNaN(numId)) toggleProductWishlist(numId)
                    }}
                  >
                    <Heart className={cn('h-4 w-4', isWishlisted && 'fill-red-500 text-red-500')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <div className="flex-1 flex flex-col justify-between p-4">
          <CardContent className="p-0">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-secondary-foreground">
              <div className="flex items-center gap-1">
                {instructorPhoto && (
                  <img
                    src={instructorPhoto}
                    alt={instructorName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                )}
                <span>{instructorName}</span>
              </div>
              {categoryTitle && (
                <>
                  <span>in</span>
                  <span className="font-medium">{categoryTitle}</span>
                </>
              )}
            </div>

            <Link href={detailHref}>
              <p className="mb-2 text-base font-semibold text-foreground hover:text-secondary-foreground transition-colors">
                {product.title}
              </p>

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {product.average_rating ? Number(product.average_rating).toFixed(2) : '5.00'}
                </span>
                <span>({product.reviews_count || 0})</span>
              </p>
            </Link>
          </CardContent>

          <CardFooter className="flex w-full items-center justify-between p-0 pt-4 mt-4 border-t border-border/60">
            <div className="capitalize">
              {isFree ? (
                <span className="font-semibold text-foreground">Free</span>
              ) : hasDiscount ? (
                <>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(product.discount_price as number)}
                  </span>
                  <span className="ml-2 text-sm font-medium text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-foreground">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <Button
              asChild
              variant="outline"
              className="border-secondary-100 px-3 hover:border-primary hover:bg-background"
            >
              <Link href={detailHref}>View</Link>
            </Button>
          </CardFooter>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('group flex flex-col justify-between p-0', className)}>
      <CardHeader className="p-0">
        <div className="relative">
          <div className="p-2 pb-0">
            <Link href={detailHref}>
              <div className="relative h-[190px] overflow-hidden rounded-lg">
                <img
                  src={imgSrc}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={() => setImgSrc('/assets/images/blank-image.jpg')}
                />
              </div>
            </Link>
          </div>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 z-10 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault()
                    if (!isNaN(numId)) toggleProductWishlist(numId)
                  }}
                >
                  <Heart className={cn('h-4 w-4', isWishlisted && 'fill-red-500 text-red-500')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-2 text-xs text-secondary-foreground">
          <div className="flex items-center gap-1">
            {instructorPhoto && (
              <img
                src={instructorPhoto}
                alt={instructorName}
                className="h-4 w-4 rounded-full object-cover"
              />
            )}
            <span>{instructorName}</span>
          </div>
          {categoryTitle && (
            <>
              <span>in</span>
              <span>{categoryTitle}</span>
            </>
          )}
        </div>

        <Link href={detailHref}>
          <p className="mb-2 font-semibold hover:text-secondary-foreground line-clamp-1">
            {product.title}
          </p>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>
              {product.average_rating ? Number(product.average_rating).toFixed(2) : '5.00'}
            </span>
            <span>({product.reviews_count || 0})</span>
          </p>
        </Link>
      </CardContent>

      <CardFooter className="flex w-full items-center justify-between p-4 pt-0">
        <p className="capitalize">
          {isFree ? (
            <span className="font-semibold">Free</span>
          ) : hasDiscount ? (
            <>
              <span className="font-semibold">
                {formatCurrency(product.discount_price as number)}
              </span>
              <span className="ml-2 text-sm font-medium text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              {formatCurrency(product.price)}
            </span>
          )}
        </p>

        <Button
          asChild
          variant="outline"
          className="border-secondary-100 px-2.5 hover:border-primary hover:bg-background"
        >
          <Link href={detailHref}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
