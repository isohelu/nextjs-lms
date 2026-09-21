import React from 'react'
import CategoryCard, { CategoryData } from '@/components/cards/CategoryCard'

const defaultCategories: CategoryData[] = [
  {
    id: 1,
    title: 'Web Development',
    slug: 'web-development',
    icon: 'code',
    courses_count: 24,
  },
  {
    id: 2,
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    icon: 'palette',
    courses_count: 18,
  },
  {
    id: 3,
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    icon: 'cpu',
    courses_count: 15,
  },
  {
    id: 4,
    title: 'Cloud & DevOps',
    slug: 'cloud-devops',
    icon: 'layers',
    courses_count: 12,
  },
  {
    id: 5,
    title: 'Data Science & SQL',
    slug: 'data-science',
    icon: 'database',
    courses_count: 16,
  },
  {
    id: 6,
    title: 'Business & Management',
    slug: 'business-management',
    icon: 'briefcase',
    courses_count: 9,
  },
  {
    id: 7,
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    icon: 'terminal',
    courses_count: 11,
  },
  {
    id: 8,
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: 'globe',
    courses_count: 14,
  },
]

const categoryColors = [
  'rgba(79,57,246,1)',
  'rgba(0,122,85,1)',
  'rgba(255,171,0,1)',
  'rgba(236,0,63,1)',
]

export default function TopCategories({
  categories = defaultCategories,
}: {
  categories?: CategoryData[]
}) {
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <section className="relative z-10 py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 text-center md:max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Top Categories
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Categories
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            These are the most popular fields and topics chosen by learners
            worldwide to advance their technical career.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.slice(0, 8).map((category, index) => {
            const color = categoryColors[index % categoryColors.length]
            return (
              <CategoryCard
                key={category.id}
                category={category}
                color={color}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
