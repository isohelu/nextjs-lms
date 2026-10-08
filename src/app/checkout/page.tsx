'use client'

import React, { useState, useEffect } from 'react'
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
  ShoppingBag,
  ChevronRight,
  Building,
  Loader2,
  Check,
  AlertCircle,
  Info
} from 'lucide-react'
import { useCartStore, CartItem } from '@/lib/store/cart'
import { useUserStore } from '@/lib/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type PaymentGateway = 'stripe' | 'paypal' | 'offline'

export default function CheckoutPage() {
  const router = useRouter()
  const { currentUser } = useUserStore()
  const {
    items,
    addItem,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [offlineNotes, setOfflineNotes] = useState('')
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null)

  // Billing form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United States',
  })

  // Autofill if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAuthenticatedUser(data.user)
          const names = (data.user.name || '').trim().split(' ')
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || names[0] || '',
            lastName: prev.lastName || names.slice(1).join(' ') || '',
            email: prev.email || data.user.email || '',
            phone: prev.phone || data.user.phone || '',
          }))
        } else {
          setAuthenticatedUser(null)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-populate cart item if arriving with ?courseId=... or ?examId=... or ?productId=...
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const courseId = params.get('courseId')
    const examId = params.get('examId')
    const productId = params.get('productId')
    const scheduleId = params.get('scheduleId')
    const slug = params.get('slug')
    const title = params.get('title')
    const price = params.get('price')

    if (courseId) {
      const exists = items.some((i) => i.id === `course-${courseId}`)
      if (!exists) {
        addItem({
          id: `course-${courseId}`,
          title: title || (slug ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Selected Course'),
          slug: slug || `course-${courseId}`,
          price: price ? Number(price) : 69.0,
          type: 'course',
        })
      }
    } else if (scheduleId) {
      const exists = items.some((i) => i.id === `schedule-${scheduleId}`)
      if (!exists) {
        addItem({
          id: `schedule-${scheduleId}`,
          title: title || 'Live Masterclass Seat Reservation',
          slug: slug || `schedule-${scheduleId}`,
          price: price ? Number(price) : 49.0,
          type: 'course',
        })
      }
    } else if (examId) {
      const exists = items.some((i) => i.id === `exam-${examId}`)
      if (!exists) {
        addItem({
          id: `exam-${examId}`,
          title: title || 'Accredited Certification Exam',
          slug: slug || `exam-${examId}`,
          price: price ? Number(price) : 49.0,
          type: 'exam',
        })
      }
    } else if (productId) {
      const exists = items.some((i) => i.id === `product-${productId}`)
      if (!exists) {
        addItem({
          id: `product-${productId}`,
          title: title || 'Learning Resource Kit',
          slug: slug || `product-${productId}`,
          price: price ? Number(price) : 29.0,
          type: 'product',
        })
      }
    }
  }, [items, addItem])

  const isLoggedIn = Boolean(authenticatedUser || currentUser)

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
    setErrorMessage(null)

    if (!isLoggedIn) {
      setErrorMessage('You must be logged in to complete your checkout.')
      const redirectTarget = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/checkout'
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    setIsProcessing(true)

    try {
      const checkoutItems = items.map((item) => ({
        id: item.id,
        type: item.type || 'course',
        title: item.title,
        price: item.discount_price ?? item.price ?? 0,
      }))

      const payload = {
        items: checkoutItems.length > 0 ? checkoutItems : [{
          id: 1,
          type: 'course',
          title: 'Full-Stack Next.js 15 & Modern React Architecture',
          price: 69.00
        }],
        gateway: selectedGateway,
        billing: {
          firstName: formData.firstName.trim() || 'Student',
          lastName: formData.lastName.trim() || 'Learner',
          email: formData.email.trim(),
          phone: formData.phone.trim() || '',
          country: formData.country || 'United States',
        },
        offlineInfo: selectedGateway === 'offline' ? offlineNotes : undefined,
      }

      const res = await fetch('/api/student/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success && data.orderId) {
        clearCart()
        router.push(`/orders/${data.orderId}`)
      } else {
        const msg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Payment processing failed.')
        setErrorMessage(msg)
        setIsProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred during checkout. Please try again.')
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
            <p className="text-sm text-muted-foreground">Select a course or product to proceed to checkout.</p>
            <Button asChild>
              <Link href="/courses/all">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <form onSubmit={handleCompletePayment} className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left Column (8 cols): Order Details & Billing Info */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Unauthenticated Alert Banner */}
              {!isLoggedIn && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <p className="font-bold text-sm">Account Required for Checkout</p>
                    <p className="text-xs text-muted-foreground">
                      You must be signed in to purchase products, take exams, or enroll in courses. Please sign in or create an account to finalize your order.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <Button asChild size="sm" className="font-semibold cursor-pointer">
                        <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/checkout')}`}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="font-semibold cursor-pointer">
                        <Link href={`/register?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/checkout')}`}>
                          Create Account
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner if any */}
              {errorMessage && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Checkout Notice</p>
                    <p className="text-xs mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Order Items Overview */}
              <Card className="p-6 border-border/80 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-foreground">Selected Items ({items.length})</h2>
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
                        <p className="text-xs text-muted-foreground">
                          {item.type === 'product'
                            ? 'Digital Store Asset'
                            : item.type === 'exam'
                            ? 'Practice Examination'
                            : `Instructor: ${item.instructor_name || 'Senior Architect'}`}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          {item.type === 'product' ? (
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" /> Instant Download
                            </span>
                          ) : item.type === 'exam' ? (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" /> Certification Exam
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> 18+ Hours
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" /> Certificate
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-foreground">
                          ${(item.discount_price !== undefined ? item.discount_price : item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Billing Address Form */}
              <Card className="p-6 border-border/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Billing Details</h2>
                  <span className="text-xs text-muted-foreground">Guest or Student Account</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
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
                    <Label htmlFor="email">Email Address *</Label>
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
              <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">30-Day 100% Money-Back Guarantee</p>
                  <p className="text-xs text-muted-foreground">If you are not satisfied with your purchase, get a complete refund within 30 days of purchase.</p>
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
                      <Input id="cardNumber" placeholder="4242 •••• •••• 4242" className="h-10 text-xs" defaultValue="4242 •••• •••• 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="expDate" className="text-xs">MM / YY</Label>
                        <Input id="expDate" placeholder="12/28" className="h-10 text-xs" defaultValue="12/28" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cvc" className="text-xs">CVC</Label>
                        <Input id="cvc" placeholder="123" className="h-10 text-xs" defaultValue="123" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedGateway === 'offline' && (
                  <div className="pt-2 space-y-3 rounded-lg bg-muted/40 border border-border p-3 text-xs">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <p>
                        Please transfer the total amount to the account below and enter your Transaction / Reference ID.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 font-mono text-xs space-y-1">
                      <p><span className="text-muted-foreground">Bank:</span> Global Standard Bank</p>
                      <p><span className="text-muted-foreground">Account Name:</span> Mentor LMS Inc</p>
                      <p><span className="text-muted-foreground">Account No:</span> 9876543210123</p>
                      <p><span className="text-muted-foreground">SWIFT / Routing:</span> GSBKUS33</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="offlineRef" className="text-xs">Deposit Ref / Transaction Notes</Label>
                      <Textarea
                        id="offlineRef"
                        rows={2}
                        placeholder="Enter bank transfer reference number or receipt details..."
                        value={offlineNotes}
                        onChange={(e) => setOfflineNotes(e.target.value)}
                        className="text-xs"
                      />
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
                {!isLoggedIn ? (
                  <Button
                    asChild
                    className="w-full h-12 rounded-xl text-base font-bold shadow-md gap-2 cursor-pointer"
                  >
                    <Link href="/login?redirect=/checkout">
                      <Lock className="h-4 w-4" /> Login to Complete Order (${grandTotal.toFixed(2)})
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 rounded-xl text-base font-bold shadow-md gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Checkout...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {selectedGateway === 'offline' ? 'Submit Offline Order' : 'Complete Order'} (${grandTotal.toFixed(2)})
                      </>
                    )}
                  </Button>
                )}

                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
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
