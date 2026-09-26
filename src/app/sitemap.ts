import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const currentDate = new Date().toISOString()

  // Base routes
  const staticRoutes = [
    '',
    '/courses',
    '/courses/all',
    '/exams',
    '/exams/all',
    '/products',
    '/careers',
    '/checkout',
    '/auth',
    '/instructors',
    '/blogs',
    '/about-us',
    '/our-team',
    '/contact-us',
    '/verify-certificate',
    '/student',
    '/terms',
    '/privacy-policy',
    '/refund-policy',
    '/notifications',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return staticRoutes
}
