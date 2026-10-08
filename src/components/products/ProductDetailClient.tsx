'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  Download,
  ShoppingBag,
  Heart,
  CheckCircle2,
  FileCheck,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ProductItem } from '@/lib/data/products'
import { useUserStore } from '@/lib/store/useUserStore'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export default function ProductDetailClient({ product }: { product: ProductItem }) {
  const router = useRouter()
  const {
    isProductPurchased,
    purchaseProduct,
    isProductWishlisted,
    toggleProductWishlist,
    customReviews,
    addProductReview,
    currentUser,
  } = useUserStore()
  const { addItem, openCart } = useCartStore()

  const [activeImage, setActiveImage] = useState<string>(
    product.thumbnail || product.images?.[0]?.url || '/assets/images/blank-image.jpg'
  )
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const isOwned = Boolean(currentUser && isProductPurchased(product.id))
  const isWishlisted = Boolean(currentUser && isProductWishlisted(product.id))
  const isFree = product.pricing_type === 'free' || (product.price ?? 0) === 0
  const productPrice = product.discount && product.discount_price ? product.discount_price : (product.price || 0)

  const checkoutRedirectUrl = `/checkout?productId=${product.id}&slug=${product.slug || product.id}&title=${encodeURIComponent(product.title)}&price=${productPrice}`
  const claimRedirectUrl = `/products/${product.slug || product.id}?action=claim`

  const getLoginRedirectUrl = () => {
    return `/login?redirect=${encodeURIComponent(isFree ? claimRedirectUrl : checkoutRedirectUrl)}`
  }

  const outOfStock =
    !product.unlimited_inventory &&
    typeof product.inventory === 'number' &&
    product.inventory <= 0

  const handleBuyNow = () => {
    if (!currentUser) {
      router.push(getLoginRedirectUrl())
      return
    }
    addItem({
      id: `product-${product.id}`,
      title: product.title,
      slug: product.slug,
      thumbnail: product.thumbnail || product.images?.[0]?.url,
      price: product.price || 0,
      discount_price: product.discount_price ?? undefined,
      instructor_name: product.instructor?.user?.name || 'System Administrator',
      type: 'product',
    })
    router.push('/checkout')
  }

  const handleClaimFree = async () => {
    if (!currentUser) {
      router.push(getLoginRedirectUrl())
      return
    }
    try {
      await fetch('/api/student/orders/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(product.id) || 1,
          unitPrice: 0,
        }),
      })
    } catch {
      // ignore
    }
    purchaseProduct(product.id)
    setPurchaseSuccess(true)
    setTimeout(() => setPurchaseSuccess(false), 4000)
  }

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'claim' && currentUser && !isOwned && isFree) {
      handleClaimFree()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [currentUser, isOwned, isFree])

  const handleDownload = (file: { name: string; url: string; id?: string | number }) => {
    if (!isOwned && product.pricing_type !== 'free') {
      setDownloadNotice('Please purchase this item to unlock authorized asset downloads.')
      setTimeout(() => setDownloadNotice(null), 3500)
      return
    }
    setDownloadNotice(`Preparing download for ${file.name}...`)
    if (file.id) {
      window.location.assign(`/api/products/${product.id}/download/${file.id}`)
    }
    setTimeout(() => setDownloadNotice(null), 3500)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    try {
      await fetch('/api/student/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'product',
          item_id: Number(product.id) || 1,
          rating: reviewRating,
          content: reviewText.trim(),
        }),
      })
    } catch {
      // ignore
    }
    addProductReview(product.id, {
      rating: reviewRating,
      review: reviewText.trim(),
      created_at: new Date().toISOString().split('T')[0],
    })
    setReviewText('')
    setReviewSubmitted(true)
    setTimeout(() => setReviewSubmitted(false), 4000)
  }

  const allReviews = [
    ...(customReviews[product.id] || []).map((r, i) => ({
      id: `custom-${i}`,
      user: {
        id: currentUser?.id || 'usr',
        name: currentUser?.name || 'You',
        photo: '/assets/images/blank-image.jpg',
      },
      rating: r.rating,
      review: r.review,
      created_at: r.created_at,
    })),
    ...(product.reviews || []),
  ]

  const formatCurrency = (val: number) => `$${Number(val).toFixed(2).replace(/\.00$/, '')}`

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 min-h-screen">
      {/* Breadcrumb matching Laravel Store show.tsx */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">
          Store
        </Link>
        {product.product_category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.product_category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.product_category.title}
            </Link>
          </>
        )}
      </div>

      {purchaseSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Product claimed successfully!</p>
            <p className="text-xs">Downloadable files and resources are now unlocked below.</p>
          </div>
        </div>
      )}

      {downloadNotice && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary text-xs font-medium">
          <FileCheck className="h-4 w-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Main Grid: Left Gallery + Right Details */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="relative h-[380px] overflow-hidden rounded-xl bg-muted border border-border">
            <img
              src={activeImage || '/assets/images/blank-image.jpg'}
              alt={product.title}
              className="h-full w-full object-cover"
              onError={() => setActiveImage('/assets/images/blank-image.jpg')}
            />
          </div>

          {product.images && product.images.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {[
                ...(product.thumbnail ? [{ id: 0, url: product.thumbnail }] : []),
                ...product.images,
              ].map((image, index) => (
                <button
                  key={`${image.id}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image.url)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border cursor-pointer transition-all',
                    activeImage === image.url
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold md:text-3xl text-foreground">
            {product.title}
          </h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.average_rating ? Number(product.average_rating).toFixed(2) : '0.00'} (
              {product.reviews_count || 0})
            </span>
            <span>by {product.instructor?.user?.name || 'System Administrator'}</span>
            <span>{product.orders_count || 0} Sales</span>
          </div>

          <p className="mt-4 text-muted-foreground leading-relaxed">{product.summary}</p>

          <div className="mt-4 flex items-center gap-3">
            {product.pricing_type === 'free' ? (
              <span className="text-2xl font-bold text-foreground">Free</span>
            ) : product.discount && product.discount_price ? (
              <>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(product.discount_price as number)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price as number)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(product.price as number)}
              </span>
            )}
          </div>

          <Separator className="my-4" />

          {isOwned ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                You own this product
              </div>

              {product.files && product.files.length > 0 ? (
                <div className="space-y-2">
                  {product.files.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-2 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                    >
                      <span className="text-sm font-medium text-foreground">{file.name}</span>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No downloadable files attached.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {!currentUser ? (
                <Button asChild size="lg" className="cursor-pointer font-semibold shadow-xs">
                  <Link href={getLoginRedirectUrl()}>
                    {isFree ? 'Login to Claim' : 'Login to Purchase'}
                  </Link>
                </Button>
              ) : product.pricing_type === 'free' ? (
                <Button
                  size="lg"
                  disabled={outOfStock}
                  onClick={handleClaimFree}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {outOfStock ? 'Out of Stock' : 'Get for Free'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={outOfStock}
                  onClick={handleBuyNow}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {outOfStock ? 'Out of Stock' : 'Buy Now'}
                </Button>
              )}

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        if (!currentUser) {
                          router.push(`/login?redirect=${encodeURIComponent(`/products/${product.slug || product.id}`)}`)
                        } else {
                          toggleProductWishlist(product.id)
                        }
                      }}
                    >
                      <Heart
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Card matching Laravel show.tsx */}
      <Card className="mt-10 p-4 md:p-6 border border-border">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="description" className="cursor-pointer">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="cursor-pointer">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="faq" className="cursor-pointer">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="reviews" className="cursor-pointer">
              Reviews ({allReviews.length})
            </TabsTrigger>
            <TabsTrigger value="seller" className="cursor-pointer">
              Seller
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            {product.description ? (
              <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No description provided.</p>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">{spec.title}</span>
                    <span className="font-medium text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No specifications provided.</p>
            )}
          </TabsContent>

          <TabsContent value="faq" className="pt-6">
            {product.faqs && product.faqs.length > 0 ? (
              <div className="space-y-4">
                {product.faqs.map((faq) => (
                  <div key={faq.id} className="rounded-lg border border-border p-4 bg-card">
                    <p className="font-semibold text-foreground text-sm">{faq.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No FAQs added yet.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-6 space-y-6">
            {isOwned && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-4">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Write a Verified Review
                </h4>

                {reviewSubmitted && (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-emerald-600 text-xs font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Thank you! Your review has been submitted.
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    required
                  />

                  <Button type="submit" size="sm" className="gap-2 cursor-pointer">
                    <Send className="h-3.5 w-3.5" />
                    Submit Review
                  </Button>
                </form>
              </div>
            )}

            {allReviews.length > 0 ? (
              <div className="space-y-4">
                {allReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user?.photo || '/assets/images/blank-image.jpg'}
                          alt={rev.user?.name || 'User'}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assets/images/blank-image.jpg'
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {rev.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">{rev.created_at}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3.5 w-3.5',
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rev.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
            )}
          </TabsContent>

          <TabsContent value="seller" className="pt-6">
            <div className="flex items-start gap-4">
              <img
                src={product.instructor?.user?.photo || '/assets/images/blank-image.jpg'}
                alt={product.instructor?.user?.name || 'Instructor'}
                className="h-16 w-16 rounded-full object-cover border border-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/assets/images/blank-image.jpg'
                }}
              />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {product.instructor?.user?.name || 'System Administrator'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.instructor?.user?.email || 'instructor@mentor.test'}
                </p>
                {product.instructor?.user?.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {product.instructor.user.bio}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
