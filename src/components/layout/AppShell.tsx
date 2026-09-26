'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { Toaster } from 'sonner'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Standalone dashboard routes have their own full-screen DashboardLayout
  const isDashboardRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/instructor' ||
    pathname.startsWith('/instructor/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')

  // Standalone auth pages have their own split-screen AuthLayout
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth')

  // Learning player has its own distraction-free player UI
  const isPlayerRoute =
    pathname.includes('/learn')

  if (isDashboardRoute || isAuthRoute || isPlayerRoute) {
    return (
      <main className="flex-1 min-h-screen">
        <Toaster position="top-right" richColors />
        {children}
      </main>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}

