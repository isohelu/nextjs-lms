'use client'

import { useState, useEffect } from 'react'
import { DEMO_USERS, DemoUser } from '@/lib/auth/demo-users'

export type UserRole = 'guest' | 'student' | 'instructor' | 'admin'

export interface UserReviewPayload {
  rating: number
  review: string
  created_at: string
}

const STORAGE_KEYS = {
  ROLE: 'mentor_user_role',
  PURCHASES: 'mentor_purchased_products',
  ENROLLED_COURSES: 'mentor_enrolled_courses',
  ENROLLED_EXAMS: 'mentor_enrolled_exams',
  WISHLIST_PRODUCTS: 'mentor_wishlist_products',
  WISHLIST_COURSES: 'mentor_wishlist_courses',
  WISHLIST_EXAMS: 'mentor_wishlist_exams',
  CUSTOM_REVIEWS: 'mentor_custom_reviews',
}

// Global event target for cross-component reactive updates in client
const eventBus = typeof window !== 'undefined' ? new EventTarget() : null
const STATE_CHANGE_EVENT = 'mentor_user_state_changed'

function notifyStateChange() {
  if (eventBus) {
    eventBus.dispatchEvent(new Event(STATE_CHANGE_EVENT))
  }
}

function getStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStoredJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    notifyStateChange()
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
  }
}

export function useUserStore() {
  const [role, setRoleState] = useState<UserRole>('guest')
  const [purchasedProducts, setPurchasedProducts] = useState<number[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([])
  const [enrolledExams, setEnrolledExams] = useState<number[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<number[]>([])
  const [wishlistCourses, setWishlistCourses] = useState<number[]>([])
  const [wishlistExams, setWishlistExams] = useState<number[]>([])
  const [customReviews, setCustomReviews] = useState<Record<number, UserReviewPayload[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const syncFromStorage = async () => {
    if (typeof window === 'undefined') return

    // 1. Check server session from /api/auth/me
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          const userRole = (data.user.role as UserRole) || 'student'
          setRoleState(userRole)

          // Fetch real enrollments from database for logged in user
          try {
            const [cRes, eRes, pRes] = await Promise.all([
              fetch('/api/student/courses'),
              fetch('/api/student/exams'),
              fetch('/api/student/purchases'),
            ])
            if (cRes.ok) {
              const cData = await cRes.json()
              const cIds = (cData.courses || []).map((c: any) => Number(c.id || c.course_id)).filter(Boolean)
              setEnrolledCourses(cIds)
            }
            if (eRes.ok) {
              const eData = await eRes.json()
              const eIds = (eData.exams || []).map((e: any) => Number(e.id || e.exam_id)).filter(Boolean)
              setEnrolledExams(eIds)
            }
            if (pRes.ok) {
              const pData = await pRes.json()
              const pIds = (pData.purchases || []).map((p: any) => Number(p.id || p.product_id)).filter(Boolean)
              setPurchasedProducts(pIds)
            }
          } catch {}

          setWishlistProducts(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_PRODUCTS, []))
          setWishlistCourses(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_COURSES, []))
          setWishlistExams(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_EXAMS, []))
          setCustomReviews(getStoredJson<Record<number, UserReviewPayload[]>>(STORAGE_KEYS.CUSTOM_REVIEWS, {}))
          setIsLoaded(true)
          return
        }
      }
    } catch {}

    // 2. Check localStorage demo_user or explicit role
    const demoStored = localStorage.getItem('demo_user')
    const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole

    if (demoStored || (storedRole && storedRole !== 'guest')) {
      const activeRole = (storedRole || 'student') as UserRole
      setRoleState(activeRole)
      setPurchasedProducts(getStoredJson<number[]>(STORAGE_KEYS.PURCHASES, []))
      setEnrolledCourses(getStoredJson<number[]>(STORAGE_KEYS.ENROLLED_COURSES, []))
      setEnrolledExams(getStoredJson<number[]>(STORAGE_KEYS.ENROLLED_EXAMS, []))
      setWishlistProducts(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_PRODUCTS, []))
      setWishlistCourses(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_COURSES, []))
      setWishlistExams(getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_EXAMS, []))
    } else {
      setRoleState('guest')
      setPurchasedProducts([])
      setEnrolledCourses([])
      setEnrolledExams([])
      setWishlistProducts([])
      setWishlistCourses([])
      setWishlistExams([])
    }

    setCustomReviews(getStoredJson<Record<number, UserReviewPayload[]>>(STORAGE_KEYS.CUSTOM_REVIEWS, {}))
    setIsLoaded(true)
  }

  useEffect(() => {
    syncFromStorage()
    if (!eventBus) return

    const handler = () => syncFromStorage()
    eventBus.addEventListener(STATE_CHANGE_EVENT, handler)
    window.addEventListener('storage', handler)

    return () => {
      eventBus.removeEventListener(STATE_CHANGE_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ROLE, newRole)
      if (newRole === 'guest') {
        localStorage.removeItem('demo_user')
        localStorage.removeItem(STORAGE_KEYS.ENROLLED_COURSES)
        localStorage.removeItem(STORAGE_KEYS.ENROLLED_EXAMS)
        localStorage.removeItem(STORAGE_KEYS.PURCHASES)
        document.cookie = 'demo_user=; path=/; max-age=0'
        document.cookie = 'mentor_session=; path=/; max-age=0'
        document.cookie = 'lms_session=; path=/; max-age=0'
      } else if (newRole === 'student') {
        const u = DEMO_USERS['student@mentor.test']
        localStorage.setItem('demo_user', JSON.stringify(u))
      } else if (newRole === 'instructor') {
        const u = DEMO_USERS['david@mentor.test']
        localStorage.setItem('demo_user', JSON.stringify(u))
      } else if (newRole === 'admin') {
        const u = DEMO_USERS['admin@mentor.test']
        localStorage.setItem('demo_user', JSON.stringify(u))
      }
      notifyStateChange()
    }
  }

  const isProductPurchased = (productId: number): boolean => {
    if (role === 'guest' || !role) return false
    return purchasedProducts.includes(Number(productId))
  }

  const purchaseProduct = (productId: number) => {
    const updated = Array.from(new Set([...purchasedProducts, Number(productId)]))
    setPurchasedProducts(updated)
    setStoredJson(STORAGE_KEYS.PURCHASES, updated)
  }

  const isCourseEnrolled = (courseId: number): boolean => {
    if (role === 'guest' || !role) return false
    return enrolledCourses.includes(Number(courseId))
  }

  const enrollCourse = (courseId: number) => {
    const updated = Array.from(new Set([...enrolledCourses, Number(courseId)]))
    setEnrolledCourses(updated)
    setStoredJson(STORAGE_KEYS.ENROLLED_COURSES, updated)
  }

  const isExamEnrolled = (examId: number): boolean => {
    if (role === 'guest' || !role) return false
    return enrolledExams.includes(Number(examId))
  }

  const enrollExam = (examId: number) => {
    const updated = Array.from(new Set([...enrolledExams, Number(examId)]))
    setEnrolledExams(updated)
    setStoredJson(STORAGE_KEYS.ENROLLED_EXAMS, updated)
  }

  const toggleProductWishlist = (productId: number): boolean => {
    let updated: number[]
    const isPresent = wishlistProducts.includes(productId)
    if (isPresent) {
      updated = wishlistProducts.filter((id) => id !== productId)
    } else {
      updated = [...wishlistProducts, productId]
    }
    setWishlistProducts(updated)
    setStoredJson(STORAGE_KEYS.WISHLIST_PRODUCTS, updated)
    return !isPresent
  }

  const toggleCourseWishlist = (courseId: number): boolean => {
    let updated: number[]
    const isPresent = wishlistCourses.includes(courseId)
    if (isPresent) {
      updated = wishlistCourses.filter((id) => id !== courseId)
    } else {
      updated = [...wishlistCourses, courseId]
    }
    setWishlistCourses(updated)
    setStoredJson(STORAGE_KEYS.WISHLIST_COURSES, updated)
    return !isPresent
  }

  const toggleExamWishlist = (examId: number): boolean => {
    let updated: number[]
    const isPresent = wishlistExams.includes(examId)
    if (isPresent) {
      updated = wishlistExams.filter((id) => id !== examId)
    } else {
      updated = [...wishlistExams, examId]
    }
    setWishlistExams(updated)
    setStoredJson(STORAGE_KEYS.WISHLIST_EXAMS, updated)
    return !isPresent
  }

  const isExamWishlisted = (examId: number): boolean => {
    return wishlistExams.includes(examId)
  }

  const isCourseWishlisted = (courseId: number): boolean => {
    return wishlistCourses.includes(courseId)
  }

  const isProductWishlisted = (productId: number): boolean => {
    return wishlistProducts.includes(productId)
  }

  const addProductReview = (productId: number, payload: UserReviewPayload) => {
    const existing = customReviews[productId] || []
    const updatedReviews = {
      ...customReviews,
      [productId]: [payload, ...existing],
    }
    setCustomReviews(updatedReviews)
    setStoredJson(STORAGE_KEYS.CUSTOM_REVIEWS, updatedReviews)
  }

  return {
    role,
    setRole,
    isLoaded,
    purchasedProducts,
    isProductPurchased,
    purchaseProduct,
    isCourseEnrolled,
    enrollCourse,
    isExamEnrolled,
    enrollExam,
    wishlistProducts,
    toggleProductWishlist,
    isProductWishlisted,
    wishlistCourses,
    toggleCourseWishlist,
    isCourseWishlisted,
    wishlistExams,
    toggleExamWishlist,
    isExamWishlisted,
    customReviews,
    addProductReview,
    currentUser:
      role === 'guest'
        ? null
        : role === 'instructor'
        ? DEMO_USERS['david@mentor.test']
        : role === 'admin'
        ? DEMO_USERS['admin@mentor.test']
        : DEMO_USERS['student@mentor.test'],
  }
}
