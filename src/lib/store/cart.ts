'use client'

import { useSyncExternalStore } from 'react'

export interface CartItem {
  id: string | number
  title: string
  slug: string
  thumbnail?: string
  price: number
  discount_price?: number
  instructor_name?: string
  type: 'course' | 'product' | 'exam'
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: string | null
  discountPercent: number
}

const defaultState: CartState = {
  items: [],
  isOpen: false,
  appliedCoupon: null,
  discountPercent: 0,
}

let state: CartState = defaultState

// Initialize from localStorage if in client
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('mentor_cart')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.items)) {
        state = {
          ...defaultState,
          ...parsed,
          isOpen: false
        }
      }
    }
  } catch {}
}

const listeners = new Set<() => void>()

function emitChange() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mentor_cart', JSON.stringify({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        discountPercent: state.discountPercent
      }))
    } catch {}
  }
  for (const listener of listeners) {
    listener()
  }
}

export const cartActions = {
  addItem: (item: CartItem) => {
    if (!state.items.some((i) => i.id === item.id)) {
      state = { ...state, items: [...state.items, item], isOpen: true }
    } else {
      state = { ...state, isOpen: true }
    }
    emitChange()
  },

  removeItem: (id: string | number) => {
    state = { ...state, items: state.items.filter((i) => i.id !== id) }
    emitChange()
  },

  clearCart: () => {
    state = { ...state, items: [], appliedCoupon: null, discountPercent: 0 }
    emitChange()
  },

  openCart: () => {
    state = { ...state, isOpen: true }
    emitChange()
  },

  closeCart: () => {
    state = { ...state, isOpen: false }
    emitChange()
  },

  applyCoupon: (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase()
    if (cleanCode === 'LEARN20' || cleanCode === 'MENTOR20') {
      state = { ...state, appliedCoupon: cleanCode, discountPercent: 20 }
      emitChange()
      return true
    } else if (cleanCode === 'NEXT15' || cleanCode === 'DEV50') {
      state = { ...state, appliedCoupon: cleanCode, discountPercent: 30 }
      emitChange()
      return true
    }
    return false
  },

  removeCoupon: () => {
    state = { ...state, appliedCoupon: null, discountPercent: 0 }
    emitChange()
  },
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return defaultState
}

export function useCartStore() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const getSubtotal = () => {
    return current.items.reduce((acc: number, item: CartItem) => {
      const effectivePrice = item.discount_price !== undefined ? item.discount_price : item.price
      return acc + effectivePrice
    }, 0)
  }

  const getDiscountAmount = () => {
    const subtotal = getSubtotal()
    return (subtotal * current.discountPercent) / 100
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const discount = getDiscountAmount()
    return Math.max(0, subtotal - discount)
  }

  return {
    ...current,
    ...cartActions,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  }
}
