import React from 'react'
import Hero from '@/components/home/Hero'
import Partners from '@/components/home/Partners'
import TopCategories from '@/components/home/TopCategories'
import TopCourses from '@/components/home/TopCourses'
import Overview from '@/components/home/Overview'
import NewCourses from '@/components/home/NewCourses'
import TopInstructors from '@/components/home/TopInstructors'
import Faqs from '@/components/home/Faqs'
import { defaultFaqs } from '@/lib/data/faqs'
import Blogs from '@/components/home/Blogs'
import CallToAction from '@/components/home/CallToAction'
import { createClient } from '@/lib/supabase/server'
import { getFaqSchema, getCourseSchema } from '@/lib/seo/schema'
import { CourseData } from '@/components/cards/CourseCard'
import { CategoryData } from '@/components/cards/CategoryCard'

export const revalidate = 60 // Revalidate cached page every 60 seconds

export default async function HomePage() {
  let dbCategories: CategoryData[] = []
  let dbCourses: CourseData[] = []

  try {
    const supabase = await createClient()

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .limit(8)

    if (categoriesData && categoriesData.length > 0) {
      dbCategories = categoriesData.map((c) => ({
        id: c.id,
        title: c.name,
        slug: c.slug,
        icon: c.icon,
        courses_count: 12,
      }))
    }

    // Fetch published courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select(
        'id, title, slug, short_description, instructor_name, price, level, duration_hours, rating, thumbnail_url'
      )
      .eq('is_published', true)
      .limit(8)

    if (coursesData && coursesData.length > 0) {
      dbCourses = coursesData.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnail: c.thumbnail_url,
        instructor_name: c.instructor_name,
        price: c.price,
        lessons_duration: `${c.duration_hours || 10} hrs`,
        average_rating: c.rating || 5.0,
        reviews_count: 28,
      }))
    }
  } catch (error) {
    console.error('Supabase query fallback to defaults:', error)
  }

  // Schema.org FAQPage structured data
  const faqJsonLd = getFaqSchema(defaultFaqs)

  return (
    <>
      {/* Schema.org FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      {/* Course Structured Data for Carousel */}
      {dbCourses.slice(0, 3).map((course) => (
        <script
          key={course.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              getCourseSchema({
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.title,
                price: course.price,
                instructorName: course.instructor_name,
                rating: course.average_rating,
                thumbnailUrl: course.thumbnail,
              })
            ),
          }}
        />
      ))}

      {/* 1:1 Home-1 Section Hierarchy */}
      <Hero />
      <Partners />
      <TopCategories categories={dbCategories} />
      <TopCourses courses={dbCourses} />
      <Overview />
      <NewCourses courses={dbCourses.slice(4)} />
      <TopInstructors />
      <Faqs />
      <Blogs />
      <CallToAction />
    </>
  )
}
