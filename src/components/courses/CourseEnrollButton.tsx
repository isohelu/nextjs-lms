'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, Sparkles, Heart, CheckCircle2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/lib/store/useUserStore'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

interface CourseEnrollButtonProps {
  courseId: number
  courseSlug: string
  pricingType: string
  title?: string
  thumbnail?: string
  price?: number
  discountPrice?: number
}

export default function CourseEnrollButton({
  courseId,
  courseSlug,
  pricingType,
  title,
  thumbnail,
  price,
  discountPrice,
}: CourseEnrollButtonProps) {
  const router = useRouter()
  const { currentUser, isCourseEnrolled, enrollCourse, wishlistCourses, toggleCourseWishlist } = useUserStore()
  const { addItem, openCart } = useCartStore()
  const [justEnrolled, setJustEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEnrolled = Boolean(currentUser && isCourseEnrolled(courseId))
  const isWishlisted = Boolean(currentUser && wishlistCourses.includes(courseId))
  const isFree = pricingType === 'free'

  const checkoutRedirectUrl = `/checkout?courseId=${courseId}&slug=${encodeURIComponent(courseSlug)}&title=${encodeURIComponent(title || courseSlug)}&price=${discountPrice ?? price ?? 19.99}`
  const enrollRedirectUrl = `/courses/${courseSlug}?action=enroll`

  // Auto-enroll if returning from login with action=enroll
  React.useEffect(() => {
    if (!currentUser || isEnrolled || !isFree) return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'enroll') {
      handleEnroll()
    }
  }, [currentUser, isEnrolled, isFree])

  const handleEnroll = async () => {
    if (!currentUser) {
      const redirectTarget = isFree ? enrollRedirectUrl : checkoutRedirectUrl
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    if (!isFree) {
      const courseTitle = title || courseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      addItem({
        id: `course-${courseId}`,
        title: courseTitle,
        slug: courseSlug,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        price: price ?? 19.99,
        discount_price: discountPrice !== undefined ? discountPrice : undefined,
        type: 'course',
      })
      router.push('/checkout')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/student/enrollments/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      })

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(enrollRedirectUrl)}`)
        return
      }

      const data = await res.json()
      if (data.success) {
        enrollCourse(courseId)
        setJustEnrolled(true)
        setTimeout(() => setJustEnrolled(false), 3500)
      }
    } catch {
      enrollCourse(courseId)
      setJustEnrolled(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 pt-2">
      {justEnrolled && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Enrolled successfully! You can start learning now.</span>
        </div>
      )}

      {isEnrolled ? (
        <Button asChild size="lg" className="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href={`/courses/${courseSlug}/learn`}>
            <Play className="mr-2 h-4 w-4 fill-white" />
            Play Course / Continue
          </Link>
        </Button>
      ) : !currentUser ? (
        <Button asChild size="lg" className="w-full font-bold shadow-md cursor-pointer">
          <Link href={`/login?redirect=${encodeURIComponent(isFree ? enrollRedirectUrl : checkoutRedirectUrl)}`}>
            {isFree ? 'Login to Enroll (Free)' : `Login to Buy Now ($${discountPrice ?? price ?? 19.99})`}
          </Link>
        </Button>
      ) : (
        <>
          <Button
            size="lg"
            onClick={handleEnroll}
            disabled={loading}
            className="w-full font-bold shadow-md cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {pricingType === 'free' ? 'Enroll Now (Free)' : 'Buy Now'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!currentUser) {
                router.push(`/login?redirect=/courses/${courseSlug}`)
              } else {
                toggleCourseWishlist(courseId)
              }
            }}
            className="w-full font-semibold text-xs cursor-pointer"
          >
            <Heart
              className={cn(
                'mr-1.5 h-3.5 w-3.5 transition-colors',
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
              )}
            />
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </>
      )}
    </div>
  )
}
