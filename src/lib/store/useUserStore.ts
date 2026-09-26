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
  const [role, setRoleState] = useState<UserRole>('student')
  const [purchasedProducts, setPurchasedProducts] = useState<number[]>([4]) // ID 4 (PostgreSQL free cheatsheet) owned by default
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([1])
  const [enrolledExams, setEnrolledExams] = useState<number[]>([1])
  const [wishlistProducts, setWishlistProducts] = useState<number[]>([1])
  const [wishlistCourses, setWishlistCourses] = useState<number[]>([])
  const [wishlistExams, setWishlistExams] = useState<number[]>([])
  const [customReviews, setCustomReviews] = useState<Record<number, UserReviewPayload[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const syncFromStorage = () => {
    if (typeof window === 'undefined') return
    const storedRole = (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'student'
    const storedPurchases = getStoredJson<number[]>(STORAGE_KEYS.PURCHASES, [4])
    const storedCourses = getStoredJson<number[]>(STORAGE_KEYS.ENROLLED_COURSES, [1])
    const storedExams = getStoredJson<number[]>(STORAGE_KEYS.ENROLLED_EXAMS, [1])
    const storedWishlistProds = getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_PRODUCTS, [1])
    const storedWishlistCourses = getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_COURSES, [])
    const storedWishlistExams = getStoredJson<number[]>(STORAGE_KEYS.WISHLIST_EXAMS, [])
    const storedReviews = getStoredJson<Record<number, UserReviewPayload[]>>(STORAGE_KEYS.CUSTOM_REVIEWS, {})

    setRoleState(storedRole)
    setPurchasedProducts(storedPurchases)
    setEnrolledCourses(storedCourses)
    setEnrolledExams(storedExams)
    setWishlistProducts(storedWishlistProds)
    setWishlistCourses(storedWishlistCourses)
    setWishlistExams(storedWishlistExams)
    setCustomReviews(storedReviews)
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
      // also sync demo_user cookie if needed
      if (newRole === 'guest') {
        localStorage.removeItem('demo_user')
        document.cookie = 'demo_user=; path=/; max-age=0'
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
    if (role === 'admin' || role === 'instructor') return true
    return purchasedProducts.includes(productId)
  }

  const purchaseProduct = (productId: number) => {
    const updated = Array.from(new Set([...purchasedProducts, productId]))
    setPurchasedProducts(updated)
    setStoredJson(STORAGE_KEYS.PURCHASES, updated)
  }

  const isCourseEnrolled = (courseId: number): boolean => {
    if (role === 'admin' || role === 'instructor') return true
    return enrolledCourses.includes(courseId)
  }

  const enrollCourse = (courseId: number) => {
    const updated = Array.from(new Set([...enrolledCourses, courseId]))
    setEnrolledCourses(updated)
    setStoredJson(STORAGE_KEYS.ENROLLED_COURSES, updated)
  }

  const isExamEnrolled = (examId: number): boolean => {
    if (role === 'admin' || role === 'instructor') return true
    return enrolledExams.includes(examId)
  }

  const enrollExam = (examId: number) => {
    const updated = Array.from(new Set([...enrolledExams, examId]))
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
