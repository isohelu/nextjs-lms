/**
 * Schema.org Structured Data Generators (JSON-LD)
 * Designed for Google Search, Course List Carousel, and AI Engine Optimization.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SITE_NAME = 'Mentor Learning Management System'
const DEFAULT_LOGO = `${SITE_URL}/assets/icons/logo-dark.png`

/**
 * Educational Organization Schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_LOGO,
    description:
      'Transform your learning journey with Mentor LMS - a comprehensive online learning platform connecting expert instructors with passionate learners.',
    sameAs: [
      'https://www.facebook.com/',
      'https://www.twitter.com/',
      'https://www.instagram.com/',
      'https://www.linkedin.com/',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Corner view Subudbazar',
      addressLocality: 'Sylhet',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880 1123 456 780',
      contactType: 'Customer Support',
      email: 'uilib@gmail.com',
    },
  }
}

export interface CourseSchemaProps {
  id?: string | number
  title: string
  description: string
  slug: string
  price?: number
  currency?: string
  instructorName?: string
  rating?: number
  ratingCount?: number
  thumbnailUrl?: string
  categoryName?: string
}

/**
 * Schema.org Course Schema
 */
export function getCourseSchema(course: CourseSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || `${course.title} - comprehensive online course on ${SITE_NAME}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    educationalCredentialAwarded: {
      '@type': 'EducationalOccupationalCredential',
      name: `Certificate of Completion in ${course.title}`,
      credentialCategory: 'Certificate',
    },
    offers: {
      '@type': 'Offer',
      price: course.price ?? 0,
      priceCurrency: course.currency || 'USD',
      category: course.price === 0 ? 'Free' : 'Paid',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/courses/${course.slug}`,
    },
    ...(course.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: course.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: course.ratingCount || 1,
          },
        }
      : {}),
    ...(course.thumbnailUrl
      ? {
          image: [course.thumbnailUrl.startsWith('http') ? course.thumbnailUrl : `${SITE_URL}${course.thumbnailUrl}`],
        }
      : {}),
  }
}

/**
 * Schema.org BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

/**
 * Schema.org FAQPage Schema
 */
export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
