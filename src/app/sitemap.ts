import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const currentDate = new Date().toISOString()

  // Base routes
  const staticRoutes = [
    '',
    '/courses/all',
    '/exams/all',
    '/products',
    '/about-us',
    '/our-team',
    '/careers',
    '/blogs/all',
    '/contact-us',
    '/privacy-policy',
    '/terms-and-conditions',
    '/cookie-policy',
    '/refund-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return staticRoutes
}
