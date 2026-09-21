'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  className?: string
  theme?: 'light' | 'dark'
}

export default function AppLogo({ className, theme }: AppLogoProps) {
  const logoDark = '/assets/icons/logo-dark.png'
  const logoLight = '/assets/icons/logo-light.png'
  const siteName = 'Mentor Learning Management System'

  if (theme === 'dark') {
    return (
      <img
        src={logoLight}
        alt={siteName}
        className={cn('block h-7 w-auto', className)}
      />
    )
  }

  if (theme === 'light') {
    return (
      <img
        src={logoDark}
        alt={siteName}
        className={cn('block h-7 w-auto', className)}
      />
    )
  }

  return (
    <>
      <img
        id="app-logo"
        src={logoDark}
        alt={siteName}
        className={cn('block h-7 w-auto dark:hidden', className)}
      />
      <img
        id="app-logo-dark"
        src={logoLight}
        alt={siteName}
        className={cn('hidden h-7 w-auto dark:block', className)}
      />
    </>
  )
}
