'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Star,
  ChevronRight,
  Building,
  ArrowLeft,
  Loader2,
  Tag,
  Check
} from 'lucide-react'
import { useCartStore, CartItem } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PaymentGateway = 'stripe' | 'paypal' | 'offline'

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items,
    appliedCoupon,
    discountPercent,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    clearCart,
  } = useCartStore()

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('stripe')
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Billing form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United States',
  })

  const subtotal = getSubtotal()
  const discount = getDiscountAmount()
  const total = getTotal()
  const tax = total * 0.05 // 5% VAT / Service tax
  const grandTotal = total + tax

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError(false)
    if (!couponCode) return
    const success = applyCoupon(couponCode)
    if (success) {
      setCouponCode('')
    } else {
      setCouponError(true)
    }
  }

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const checkoutItems = items.map((item) => ({
        id: item.id,
        type: item.type || 'course',
        title: item.title,
        price: item.discount_price ?? item.price ?? 0,
      }))

      const res = await fetch('/api/student/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems.length > 0 ? checkoutItems : [{
            id: 1,
            type: 'course',
            title: 'Full-Stack Next.js 15 & Modern React Architecture',
            price: 69.00
          }],
          gateway: selectedGateway,
          billing: {
            firstName: formData.firstName || 'Student',
            lastName: formData.lastName || 'Learner',
            email: formData.email || 'student@mentorlms.com',
            phone: formData.phone || '',
            country: formData.country || 'United States',
          },
        }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/checkout')
        return
      }

      const data = await res.json()
      if (data.success && data.orderId) {
        clearCart()
        router.push(`/orders/${data.orderId}`)
      } else {
        alert(data.message || 'Payment processing failed.')
        setIsProcessing(false)
      }
    } catch {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses/all" className="hover:text-foreground">Courses</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-foreground">Secure Checkout</span>
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold">Your Cart is Empty</h2>
            <p className="text-sm text-muted-foreground">Select a course to proceed to checkout.</p>
            <Button asChild>
              <Link href="/courses/all">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <form onSubmit={handleCompletePayment} className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left Column (8 cols): Order Details & Billing Info */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Order Items Overview */}
              <Card className="p-6 border-border/80 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-foreground">Enrolled Items ({items.length})</h2>
                <div className="divide-y divide-border/60">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                        <img
                          src={item.thumbnail || '/assets/images/students-1.jpg'}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">Instructor: {item.instructor_name || 'Senior Architect'}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 18+ Hours
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" /> Certificate
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-foreground">
                          ${item.discount_price !== undefined ? item.discount_price : item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Billing Address Form */}
              <Card className="p-6 border-border/80 shadow-sm space-y-5">
                <h2 className="text-lg font-bold text-foreground">Billing Details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {/* 30-Day Money Back Guarantee Banner */}
              <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600">
                <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">30-Day 100% Money-Back Guarantee</p>
                  <p className="text-xs text-muted-foreground">If you are not satisfied with the course, get a complete refund within 30 days of purchase.</p>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Payment Method & Order Summary */}
            <div className="space-y-6 lg:col-span-5 xl:col-span-4">
              {/* Payment Method Selector */}
              <Card className="p-6 border-border/80 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
                <div className="space-y-3">
                  {/* Stripe / Credit Card */}
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      selectedGateway === 'stripe'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="gateway"
                        checked={selectedGateway === 'stripe'}
                        onChange={() => setSelectedGateway('stripe')}
                        className="text-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Stripe Secure Gateway</p>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </label>

                  {/* PayPal */}
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      selectedGateway === 'paypal'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="gateway"
                        checked={selectedGateway === 'paypal'}
                        onChange={() => setSelectedGateway('paypal')}
                        className="text-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">PayPal</p>
                        <p className="text-xs text-muted-foreground">Instant digital checkout</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">PayPal</span>
                  </label>

                  {/* Offline / Bank Transfer */}
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      selectedGateway === 'offline'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="gateway"
                        checked={selectedGateway === 'offline'}
                        onChange={() => setSelectedGateway('offline')}
                        className="text-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Offline Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Direct wire deposit</p>
                      </div>
                    </div>
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </label>
                </div>

                {selectedGateway === 'stripe' && (
                  <div className="pt-2 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                      <Input id="cardNumber" placeholder="4242 •••• •••• 4242" className="h-10 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="expDate" className="text-xs">MM / YY</Label>
                        <Input id="expDate" placeholder="12/28" className="h-10 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cvc" className="text-xs">CVC</Label>
                        <Input id="cvc" placeholder="123" className="h-10 text-xs" />
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Order Summary & Coupon */}
              <Card className="p-6 border-border/80 shadow-sm space-y-5">
                <h2 className="text-lg font-bold text-foreground">Summary</h2>

                {/* Coupon Code Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-9 text-xs uppercase"
                    />
                    <Button type="button" onClick={handleApplyCoupon} variant="outline" size="sm" className="h-9 text-xs">
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-500/10 p-2 rounded-lg">
                      <span className="flex items-center gap-1 font-medium">
                        <Check className="h-3.5 w-3.5" /> Coupon &ldquo;{appliedCoupon}&rdquo; active ({discountPercent}% off)
                      </span>
                      <button type="button" onClick={removeCoupon} className="underline">Remove</button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-destructive">Invalid code. Try &ldquo;LEARN20&rdquo;.</p>
                  )}
                </div>

                {/* Calculation Rows */}
                <div className="space-y-2.5 border-t border-border/60 pt-4 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Original Price</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Savings</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground border-t border-border/60 pt-3">
                    <span>Total Amount</span>
                    <span className="text-primary text-xl">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Payment CTA */}
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-12 rounded-xl text-base font-bold shadow-md gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Complete Enrollment (${grandTotal.toFixed(2)})
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" /> 256-bit TLS encrypted transaction
                </p>
              </Card>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
