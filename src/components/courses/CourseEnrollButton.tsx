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
}

export default function CourseEnrollButton({
  courseId,
  courseSlug,
  pricingType,
}: CourseEnrollButtonProps) {
  const router = useRouter()
  const { isCourseEnrolled, enrollCourse, wishlistCourses, toggleCourseWishlist } = useUserStore()
  const { addItem, openCart } = useCartStore()
  const [justEnrolled, setJustEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEnrolled = isCourseEnrolled(courseId)
  const isWishlisted = wishlistCourses.includes(courseId)
  const isFree = pricingType === 'free'

  const handleEnroll = async () => {
    if (!isFree) {
      addItem({
        id: `course-${courseId}`,
        title: courseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: courseSlug,
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        price: 19.99,
        type: 'course',
      })
      openCart()
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
        router.push(`/login?redirect=/courses/${courseSlug}`)
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
      ) : (
        <>
          <Button
            size="lg"
            onClick={handleEnroll}
            className="w-full font-bold shadow-md cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {pricingType === 'free' ? 'Enroll Now (Free)' : 'Buy Now'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCourseWishlist(courseId)}
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
