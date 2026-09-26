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
import db from '@/lib/db'
import { courseRepository } from '@/lib/repositories/courseRepository'
import { getFaqSchema, getCourseSchema } from '@/lib/seo/schema'
import { CourseData } from '@/components/cards/CourseCard'
import { CategoryData } from '@/components/cards/CategoryCard'
import { InstructorData } from '@/components/cards/InstructorCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let dbCategories: CategoryData[] = []
  let dbCourses: CourseData[] = []
  let dbInstructors: InstructorData[] = []

  try {
    // Fetch categories from SQLite
    const categoriesRows = db.prepare(`
      SELECT cc.id, cc.title, cc.slug, cc.icon,
             (SELECT COUNT(*) FROM courses c WHERE c.course_category_id = cc.id) as courses_count
      FROM course_categories cc
      ORDER BY cc.id ASC
      LIMIT 8
    `).all() as { id: number; title: string; slug: string; icon: string | null; courses_count: number }[]

    if (categoriesRows && categoriesRows.length > 0) {
      dbCategories = categoriesRows.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        icon: c.icon || 'BookOpen',
        courses_count: c.courses_count || 12,
      }))
    }

    // Fetch published courses from SQLite
    const { courses } = courseRepository.listAll({ limit: 8 })
    if (courses && courses.length > 0) {
      dbCourses = courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        instructor_name: c.instructor_name || 'Dr. Angela Yu',
        price: c.price || 0,
        lessons_duration: '38 hrs',
        average_rating: 4.9,
        reviews_count: 142,
      }))
    }
    // Fetch top instructors from SQLite
    const instructorRows = db.prepare(`
      SELECT i.id, u.name, i.designation, u.photo
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.id ASC
      LIMIT 4
    `).all() as any[]

    if (instructorRows && instructorRows.length > 0) {
      dbInstructors = instructorRows.map((inst) => ({
        id: inst.id,
        name: inst.name,
        designation: inst.designation || 'Lead Technical Instructor',
        photo: inst.photo || `/assets/avatars/avatar-${(inst.id % 4) + 1}.png`,
      }))
    }
  } catch (error) {
    console.error('Database query fallback to defaults:', error)
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

      {/* Standard Home-1 Sections matching Laravel 1:1 */}
      <Hero />
      <Partners />
      <TopCategories categories={dbCategories} />
      <TopCourses courses={dbCourses} />
      <Overview />
      <NewCourses courses={dbCourses.slice(4)} />
      <TopInstructors instructors={dbInstructors} />
      <Faqs />
      <Blogs />
      <CallToAction />
    </>
  )
}
