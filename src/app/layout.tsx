import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import { getOrganizationSchema } from '@/lib/seo/schema'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Home 1 | Mentor Learning Management System',
    template: '%s | Mentor Learning Management System',
  },
  description:
    'Welcome to Mentor LMS - your gateway to transformative learning experiences. Discover expert-led courses, build new skills, and advance your career with our comprehensive online learning platform.',
  keywords: ['LMS', 'Learning Management System', 'Courses', 'Mentor', 'Education', 'Online Learning'],
  authors: [{ name: 'UiLib' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/assets/icons/logo-dark.png',
  },
  openGraph: {
    type: 'website',
    url: 'http://localhost:3000',
    title: 'Home 1 | Mentor Learning Management System',
    description:
      'Welcome to Mentor LMS - your gateway to transformative learning experiences. Discover expert-led courses, build new skills, and advance your career with our comprehensive online learning platform.',
    siteName: 'Mentor Learning Management System',
    images: [
      {
        url: '/assets/images/intro/home-1/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'Mentor Learning Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home 1 | Mentor Learning Management System',
    description:
      'Welcome to Mentor LMS - your gateway to transformative learning experiences. Discover expert-led courses, build new skills, and advance your career with our comprehensive online learning platform.',
    images: ['/assets/images/intro/home-1/hero-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationJsonLd = getOrganizationSchema()

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Global Schema.org EducationalOrganization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {/* Instant Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const a = localStorage.getItem('appearance') || 'system';
                const dark = a === 'dark' || (a === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (dark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col justify-between overflow-x-hidden font-sans antialiased bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
