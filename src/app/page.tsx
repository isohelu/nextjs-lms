import React from 'react'
import Hero from '@/components/home/Hero'
import Partners from '@/components/home/Partners'
import TopCategories from '@/components/home/TopCategories'
import AboutPlatform from '@/components/home/AboutPlatform'
import TopCourses from '@/components/home/TopCourses'
import LiveEventsExams from '@/components/home/LiveEventsExams'
import LmsExperienceShowcase from '@/components/home/LmsExperienceShowcase'
import TopInstructors from '@/components/home/TopInstructors'
import Testimonials from '@/components/home/Testimonials'
import Faqs from '@/components/home/Faqs'
import { defaultFaqs } from '@/lib/data/faqs'
import CallToAction from '@/components/home/CallToAction'
import Blogs from '@/components/home/Blogs'
import db from '@/lib/db'
import { courseRepository } from '@/lib/repositories/courseRepository'
import { settingRepository } from '@/lib/repositories/settingRepository'
import { DEFAULT_HERO_DATA, HeroSectionData } from '@/lib/data/hero-section'
import { DEFAULT_ABOUT_SECTION_DATA, AboutSectionData } from '@/lib/data/about-section'
import { DEFAULT_LMS_SHOWCASE_DATA, LmsShowcaseData } from '@/lib/data/lms-showcase-section'
import { DEFAULT_TESTIMONIALS_DATA, TestimonialsSectionData } from '@/lib/data/testimonials-section'
import { DEFAULT_BLOG_SECTION_DATA, BlogSectionData } from '@/lib/data/blog-section'
import { DEFAULT_LIVE_SCHEDULES_DATA, LiveSchedulesSectionData } from '@/lib/data/live-schedules-section'
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
    // Fetch categories from SQLite (excluding generic 'Default' label)
    const categoriesRows = db.prepare(`
      SELECT cc.id, cc.title, cc.slug, cc.icon,
             (SELECT COUNT(*) FROM courses c WHERE c.course_category_id = cc.id) as courses_count
      FROM course_categories cc
      WHERE cc.title IS NOT NULL AND LOWER(cc.title) != 'default'
      ORDER BY cc.id ASC
      LIMIT 8
    `).all() as { id: number; title: string; slug: string; icon: string | null; courses_count: number }[]

    if (categoriesRows && categoriesRows.length > 0) {
      dbCategories = categoriesRows.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        icon: c.slug || c.icon || 'code',
        courses_count: c.courses_count || 12,
      }))
    }

    // Fallback image array for diverse course cards
    const fallbackThumbnails = [
      '/assets/images/hero-student-laptop.jpg',
      '/assets/images/students-1.jpg',
      '/assets/images/students-2.jpg',
      '/assets/images/students-3.jpg',
      '/assets/images/bento-hero-student.jpg',
      '/assets/images/hero-bento-engineer.jpg',
    ]

    const categoriesList = ['Full-Stack', 'AI Engineering', 'UI/UX Design', 'Cloud & Database']

    // Fetch published courses from SQLite
    const { courses } = courseRepository.listAll({ limit: 8 })
    if (courses && courses.length > 0) {
      dbCourses = courses.map((c, idx) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnail: c.thumbnail && c.thumbnail.startsWith('/assets') ? c.thumbnail : fallbackThumbnails[idx % fallbackThumbnails.length],
        instructor_name: c.instructor_name || (idx % 2 === 0 ? 'David Miller' : 'Elena Rostova'),
        instructor_avatar: `/assets/avatars/avatar-${(idx % 4) + 1}.png`,
        instructor_designation: idx % 2 === 0 ? 'Principal Architect' : 'Staff AI Engineer',
        price: c.price || 99,
        discount: idx % 2 === 1,
        discount_price: idx % 2 === 1 ? 69 : undefined,
        lessons_duration: `${28 + idx * 4} hrs`,
        average_rating: Number((4.85 + (idx % 3) * 0.05).toFixed(2)),
        reviews_count: 124 + idx * 22,
        category_name: categoriesList[idx % categoriesList.length],
        level: idx % 3 === 0 ? 'Advanced' : idx % 3 === 1 ? 'Intermediate' : 'All Levels',
        lessons_count: 24 + idx * 6,
        enrollments_count: 180 + idx * 35,
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
        designation: inst.designation || 'Senior Full-Stack Architect',
        photo:
          inst.photo ||
          (inst.id === 1
            ? '/assets/images/instructor-david-miller.jpg?v=2'
            : inst.id === 2
            ? '/assets/images/instructor-elena-rostova.jpg?v=2'
            : inst.id === 3
            ? '/assets/images/instructor-marcus-chen.jpg?v=2'
            : '/assets/images/instructor-sarah-jenkins.jpg?v=2'),
        coursesCount: 6,
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

      {(() => {
        const heroRecord = settingRepository.getByType('hero_section')
        const heroData: HeroSectionData = heroRecord ? { ...DEFAULT_HERO_DATA, ...heroRecord } : DEFAULT_HERO_DATA
        return <Hero initialData={heroData} />
      })()}
      <Partners />
      <TopCategories categories={dbCategories} />
      {(() => {
        const aboutRecord = settingRepository.getByType('about_platform')
        const aboutData: AboutSectionData = aboutRecord
          ? { ...DEFAULT_ABOUT_SECTION_DATA, ...aboutRecord }
          : DEFAULT_ABOUT_SECTION_DATA
        return <AboutPlatform initialData={aboutData} />
      })()}
      <TopCourses courses={dbCourses} />
      {(() => {
        const journeyRecord = settingRepository.getByType('learning_journey')
        const liveSchedulesRecord = settingRepository.getByType('live_schedules_section')
        const liveSchedulesData: LiveSchedulesSectionData = liveSchedulesRecord
          ? { ...DEFAULT_LIVE_SCHEDULES_DATA, ...liveSchedulesRecord }
          : DEFAULT_LIVE_SCHEDULES_DATA
        return (
          <LiveEventsExams
            journeyData={journeyRecord || undefined}
            initialData={liveSchedulesData}
          />
        )
      })()}
      {(() => {
        const showcaseRecord = settingRepository.getByType('lms_showcase')
        const showcaseData: LmsShowcaseData = showcaseRecord
          ? { ...DEFAULT_LMS_SHOWCASE_DATA, ...showcaseRecord }
          : DEFAULT_LMS_SHOWCASE_DATA
        return <LmsExperienceShowcase initialData={showcaseData} />
      })()}
      <TopInstructors instructors={dbInstructors} />
      {(() => {
        const testimonialsRecord = settingRepository.getByType('testimonials_section')
        const testimonialsData: TestimonialsSectionData = testimonialsRecord
          ? { ...DEFAULT_TESTIMONIALS_DATA, ...testimonialsRecord }
          : DEFAULT_TESTIMONIALS_DATA
        return <Testimonials initialData={testimonialsData} />
      })()}
      <Faqs />
      <CallToAction />
      {(() => {
        const blogRecord = settingRepository.getByType('blog_section')
        const blogData: BlogSectionData = blogRecord
          ? { ...DEFAULT_BLOG_SECTION_DATA, ...blogRecord }
          : DEFAULT_BLOG_SECTION_DATA
        return <Blogs initialData={blogData} />
      })()}
    </>
  )
}
