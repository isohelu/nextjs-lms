import React from 'react'
import Link from 'next/link'
import AppLogo from '@/components/common/AppLogo'

interface AuthLayoutProps {
  title: string
  description: string
  headline?: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthLayout({
  children,
  title,
  description,
  headline,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-370">
      {/* Left panel: Headline + Subtitle + Illustration (Desktop) */}
      <div className="hidden flex-1 flex-col items-center justify-center space-y-10 border-r border-border p-10 md:flex md:max-w-xl">
        <div className="space-y-3">
          {headline && (
            <h2 className="text-3xl leading-tight font-bold tracking-tight text-foreground">
              {headline}
            </h2>
          )}
          {subtitle && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Illustration */}
        <div className="flex items-center justify-center">
          <img
            src="/assets/images/intro/home-1/hero-image.png"
            alt="LMS Learning"
            className="mx-auto w-full max-w-115 object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Right panel (always visible) */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-10 md:px-10">
        <div className="w-full max-w-105 space-y-12">
          <div className="flex w-full items-center justify-center md:justify-start">
            <Link href="/">
              <AppLogo className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex flex-col gap-7">
            {/* Page title block */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
