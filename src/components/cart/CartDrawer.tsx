'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react'
import { useCartStore, CartItem } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState(false)
  const [couponSuccess, setCouponSuccess] = useState(false)

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError(false)
    setCouponSuccess(false)
    if (!couponInput) return

    const success = applyCoupon(couponInput)
    if (success) {
      setCouponSuccess(true)
      setCouponInput('')
    } else {
      setCouponError(true)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Your Learning Cart</h2>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Your cart is currently empty</p>
                <p className="text-xs text-muted-foreground">Explore our curriculum to add top-rated courses.</p>
              </div>
              <Button asChild onClick={closeCart} className="mt-2 rounded-xl">
                <Link href="/courses/all">Explore Courses</Link>
              </Button>
            </div>
          ) : (
            items.map((item: CartItem) => (
              <div
                key={item.id}
                className="group relative flex gap-3.5 rounded-xl border border-border/70 bg-background/50 p-3.5 transition-colors hover:border-primary/40"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/50">
                  <img
                    src={item.thumbnail || '/assets/images/students-1.jpg'}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="pr-6">
                    <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{item.instructor_name || 'Expert Instructor'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        ${item.discount_price !== undefined ? item.discount_price : item.price}
                      </span>
                      {item.discount_price !== undefined && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${item.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with Calculations & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4 bg-muted/10">
            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code (e.g. LEARN20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="pl-8 h-9 text-xs uppercase"
                  />
                </div>
                <Button type="submit" size="sm" variant="outline" className="h-9 text-xs">
                  Apply
                </Button>
              </div>

              {couponSuccess && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-500">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Coupon &ldquo;{appliedCoupon}&rdquo; applied!
                  </span>
                  <button type="button" onClick={removeCoupon} className="underline hover:text-foreground">
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-destructive">Invalid coupon code. Try &ldquo;LEARN20&rdquo;.</p>
              )}
            </form>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2">
                <span>Total Amount</span>
                <span className="text-primary text-base">${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button asChild onClick={closeCart} className="w-full h-11 rounded-xl font-bold shadow-md gap-2">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
