'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  Download,
  ShoppingBag,
  Home,
  ChevronRight,
  Heart,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  User,
  ShieldCheck,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductItem } from '@/lib/data/products'
import { useUserStore, UserRole } from '@/lib/store/useUserStore'
import { cn } from '@/lib/utils'

export default function ProductDetailClient({ product }: { product: ProductItem }) {
  const {
    role,
    setRole,
    isProductPurchased,
    purchaseProduct,
    isProductWishlisted,
    toggleProductWishlist,
    customReviews,
    addProductReview,
    currentUser,
  } = useUserStore()

  const [activeImage, setActiveImage] = useState<string>(
    product.thumbnail || product.images?.[0]?.url || '/assets/images/blank-image.jpg'
  )
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const isOwned = isProductPurchased(product.id)
  const isWishlisted = isProductWishlisted(product.id)

  const handlePurchase = async () => {
    try {
      await fetch('/api/student/orders/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(product.id) || 1,
          unitPrice: product.pricing_type === 'free' ? 0 : (product.discount_price ?? product.price),
        }),
      })
    } catch {
      // ignore
    }
    purchaseProduct(product.id)
    setPurchaseSuccess(true)
    setTimeout(() => setPurchaseSuccess(false), 4000)
  }

  const handleDownload = (file: { name: string; url: string; id?: string | number }) => {
    if (!isOwned && product.pricing_type !== 'free') {
      setDownloadNotice('Please purchase this item to unlock authorized asset downloads.')
      setTimeout(() => setDownloadNotice(null), 3500)
      return
    }
    setDownloadNotice(`Preparing download for ${file.name}...`)
    // Attempt download through gated download endpoint if file id exists
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
        photo: '/assets/images/students-1.jpg',
      },
      rating: r.rating,
      review: r.review,
      created_at: r.created_at,
    })),
    ...product.reviews,
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Role Switcher Pill Bar */}
      <div className="bg-muted/40 border-b border-border py-2 px-4">
        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">User View:</span>
            <span className="capitalize font-bold text-primary">
              {role === 'guest' ? 'Guest (Logged Out)' : `${role} (${currentUser?.name})`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground mr-1">Switch State:</span>
            {(['guest', 'student', 'instructor', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer capitalize',
                  role === r
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground border border-border'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6">
        {/* Breadcrumb matching Laravel */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-foreground transition-colors">
            Store
          </Link>
          {product.product_category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/products?category=${product.product_category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.product_category.title}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-sm">{product.title}</span>
        </div>

        {/* Purchase Confirmation Toast Banner */}
        {purchaseSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-500">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Purchase successful!</p>
              <p className="text-xs">You now own this product. Downloadable files are unlocked below.</p>
            </div>
          </div>
        )}

        {/* Download notification */}
        {downloadNotice && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary text-xs font-medium">
            <FileCheck className="h-4 w-4" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Product Top Grid (Images + Details) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
          {/* Left: Gallery */}
          <div>
            <div className="relative h-95 overflow-hidden rounded-xl bg-muted border border-border">
              <img
                src={activeImage}
                alt={product.title}
                className="h-full w-full object-cover transition-all duration-300"
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

          {/* Right: Info & User-Wise CTA */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold md:text-3xl text-foreground">{product.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(product.average_rating).toFixed(2)} ({product.reviews_count || 0})
              </span>
              <span>by <strong className="text-foreground font-semibold">{product.instructor?.user?.name}</strong></span>
              <span>{product.orders_count || 0} Sales</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">{product.summary}</p>

            {/* Pricing Section */}
            <div className="flex items-center gap-3 pt-2">
              {product.pricing_type === 'free' ? (
                <span className="text-2xl font-bold text-emerald-600">Free</span>
              ) : product.discount && product.discount_price ? (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    ${product.discount_price.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <Separator className="my-4" />

            {/* USER-WISE CONDITIONAL ACTIONS */}
            {isOwned ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>You own this product</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Downloadable Assets
                  </p>
                  {product.files && product.files.length > 0 ? (
                    <div className="space-y-2">
                      {product.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded bg-primary/10 p-2 text-primary">
                              <Download className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.size} • {file.extension.toUpperCase()}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file)}
                            className="gap-1.5 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No downloadable files attached to this product.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {role === 'guest' ? (
                  <Button asChild size="lg" className="px-8 font-semibold">
                    <Link href="/login">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Login to Purchase
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePurchase}
                    className="px-8 font-semibold cursor-pointer"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {product.pricing_type === 'free' ? 'Get for Free' : 'Buy Now'}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => toggleProductWishlist(product.id)}
                  className="cursor-pointer gap-2"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                    )}
                  />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tabs Card */}
        <Card className="mt-12 p-4 md:p-6 border border-border shadow-xs">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start overflow-x-auto border-b border-border pb-px rounded-none bg-transparent gap-2">
              <TabsTrigger
                value="description"
                className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-medium px-4 py-2"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-medium px-4 py-2"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-medium px-4 py-2"
              >
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-medium px-4 py-2"
              >
                Reviews ({allReviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="seller"
                className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-medium px-4 py-2"
              >
                Seller
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="pt-6 space-y-4">
              <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="pt-6">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
                    >
                      <span className="text-muted-foreground">{spec.title}</span>
                      <span className="font-semibold text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specifications provided.</p>
              )}
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="pt-6">
              {product.faqs && product.faqs.length > 0 ? (
                <div className="space-y-4">
                  {product.faqs.map((faq) => (
                    <div key={faq.id} className="rounded-lg border border-border p-4 bg-card">
                      <p className="font-semibold text-foreground text-sm">{faq.question}</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="pt-6 space-y-6">
              {/* Dynamic Review Submission for Owners */}
              {isOwned && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-4">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    Write a Verified Review
                  </h4>

                  {reviewSubmitted && (
                    <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-emerald-600 text-xs font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Thank you! Your review has been added.
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
                      placeholder="Share your feedback about the design tokens, architecture, or documentation..."
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

              {/* Existing Reviews List */}
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
                            src={rev.user.photo || '/assets/images/blank-image.jpg'}
                            alt={rev.user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{rev.user.name}</p>
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

            {/* Seller Tab */}
            <TabsContent value="seller" className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src={product.instructor?.user?.photo || '/assets/images/blank-image.jpg'}
                  alt={product.instructor?.user?.name}
                  className="h-16 w-16 rounded-full object-cover border border-border"
                />
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">
                    {product.instructor?.user?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.instructor?.user?.email}
                  </p>
                  {product.instructor?.user?.bio && (
                    <p className="pt-2 text-sm text-muted-foreground leading-relaxed">
                      {product.instructor.user.bio}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
