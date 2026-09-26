import React from 'react'
import CategoryCard, { CategoryData } from '@/components/cards/CategoryCard'

const defaultCategories: CategoryData[] = [
  {
    id: 2,
    title: 'Web Development',
    slug: 'web-development',
    icon: 'code',
    courses_count: 5,
  },
  {
    id: 3,
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    icon: 'palette',
    courses_count: 1,
  },
  {
    id: 4,
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    icon: 'cpu',
    courses_count: 2,
  },
  {
    id: 5,
    title: 'Cloud & DevOps',
    slug: 'cloud-devops',
    icon: 'layers',
    courses_count: 2,
  },
  {
    id: 6,
    title: 'Data Science & SQL',
    slug: 'data-science',
    icon: 'database',
    courses_count: 2,
  },
  {
    id: 7,
    title: 'Business & Management',
    slug: 'business-management',
    icon: 'briefcase',
    courses_count: 1,
  },
  {
    id: 8,
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    icon: 'terminal',
    courses_count: 2,
  },
  {
    id: 9,
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: 'globe',
    courses_count: 1,
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
  const displayCategories =
    categories.length > 0 ? categories : defaultCategories

  return (
    <section className="container relative z-10 py-20">
      {/* Section Header matching Laravel 1:1 */}
      <div className="mx-auto mb-10 text-center md:max-w-2xl">
        <p className="mb-1 font-medium text-secondary-foreground">
          Top Categories
        </p>
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
          Featured category
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          These are the most popular courses among listen courses learners
          worldwide
        </p>
      </div>

      {/* Categories Grid matching 4-column layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
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
    </section>
  )
}
