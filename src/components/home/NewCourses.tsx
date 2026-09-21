import React from 'react'
import CourseCard, { CourseData } from '@/components/cards/CourseCard'

const newCoursesList: CourseData[] = [
  {
    id: 5,
    title: 'Modern TypeScript 5 & Advanced Generics Mastery',
    slug: 'modern-typescript-5-generics',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 86,
    lessons_duration: 18000,
    average_rating: 4.98,
    reviews_count: 22,
    price: 49,
    discount: true,
    discount_price: 35,
    instructor_name: 'David Miller',
  },
  {
    id: 6,
    title: 'Docker, Kubernetes & Cloud Native Microservices',
    slug: 'docker-kubernetes-microservices',
    thumbnail: '/assets/images/students-3.jpg',
    enrollments_count: 112,
    lessons_duration: 32400,
    average_rating: 4.9,
    reviews_count: 38,
    price: 89,
    discount: false,
    instructor_name: 'Marcus Chen',
  },
  {
    id: 7,
    title: 'Cybersecurity Defense, Network Penetration & OWASP',
    slug: 'cybersecurity-defense-owasp',
    thumbnail: '/assets/images/students-1.jpg',
    enrollments_count: 94,
    lessons_duration: 27000,
    average_rating: 5.0,
    reviews_count: 19,
    price: 110,
    discount: true,
    discount_price: 79,
    instructor_name: 'Elena Rostova',
  },
  {
    id: 8,
    title: 'Building Interactive Web Applications with GSAP & Three.js',
    slug: 'interactive-web-apps-gsap-threejs',
    thumbnail: '/assets/images/students-2.jpg',
    enrollments_count: 75,
    lessons_duration: 16200,
    average_rating: 4.92,
    reviews_count: 15,
    price: 59,
    discount: false,
    instructor_name: 'Sarah Jenkins',
  },
]

export default function NewCourses({
  courses = newCoursesList,
}: {
  courses?: CourseData[]
}) {
  const displayCourses = courses.length > 0 ? courses : newCoursesList

  return (
    <section className="relative overflow-hidden bg-[url('/assets/images/intro/home-1/bg-line.png')] bg-cover bg-center py-20">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-14 text-center md:max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Courses
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Latest Courses
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Stay ahead of technological shifts with our newly added curricula
            curated by seasoned industry engineers and architects.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCourses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Decorative Radial Backgrounds */}
      <div className="pointer-events-none absolute -top-40 -right-60 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,120,103,0.3)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-60 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.3)_0%,transparent_70%)] blur-3xl" />
    </section>
  )
}
