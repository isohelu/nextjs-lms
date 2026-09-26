import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { courseRepository } from '@/lib/repositories/courseRepository'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Clock,
  Star,
  Users,
  CheckCircle,
  PlayCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
  Languages,
  Calendar,
  BarChart3,
  Mail,
  Video,
  FileText,
  FileQuestion,
  HelpCircle,
  Play
} from 'lucide-react'
import RatingStars from '@/components/common/RatingStars'
import StudentFeedback from '@/components/common/StudentFeedback'
import ReviewCard from '@/components/cards/ReviewCard'
import CourseCard from '@/components/cards/CourseCard'
import CourseEnrollButton from '@/components/courses/CourseEnrollButton'

export const dynamic = 'force-dynamic'

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
}

// Fallback demo courses matching Laravel seeded database
const FALLBACK_COURSES: Record<string, any> = {
  'complete-web-development-bootcamp-2025': {
    id: 1,
    title: 'The Complete 2025 Web Development Bootcamp',
    slug: 'complete-web-development-bootcamp-2025',
    short_description: 'Become a Full-Stack Web Developer with just ONE course. HTML, CSS, Javascript, Node, React, PostgreSQL, Web3 and DApps',
    description: `Welcome to the Complete Web Development Bootcamp, the only course you need to learn to code and become a full-stack web developer. With over 65 hours of HD video tutorials and building 16+ real-world projects, this course is designed for both absolute beginners with zero programming experience and seasoned developers wanting to modernize their web tech stack.

By the end of this course, you will be fluently programming in modern HTML5, modern CSS3 (Flexbox & Grid), JavaScript ES6+, React 19, Next.js 15, Node.js, Express, PostgreSQL, RESTful APIs, and cloud deployments with Docker and Vercel.`,
    price: 89.99,
    discount_price: 19.99,
    discount: true,
    pricing_type: 'paid',
    level: 'Beginner',
    language: 'English',
    duration_hours: 65,
    lessons_duration: 234000,
    enrollments_count: 14200,
    rating: 4.8,
    reviews_count: 3200,
    preview_video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    instructor: {
      id: 1,
      name: 'Dr. Angela Yu',
      email: 'angela@appbrewery.com',
      avatar: '/assets/avatars/avatar-1.png',
      designation: 'Lead Instructor & Founder at App Brewery',
      bio: "I'm Angela, a developer with a passion for teaching. I'm the lead instructor at the London App Brewery, London's leading Programming Bootcamp. I've helped hundreds of thousands of students learn to code and change their lives by becoming a developer.",
      students_count: 185000,
      courses_count: 8,
      rating: 4.9,
      reviews_count: 45000,
    },
    requirements: [
      { id: 1, requirement: 'No prior programming experience needed - I will teach you everything from scratch!' },
      { id: 2, requirement: 'A computer with Windows, Mac, or Linux and an active internet connection.' },
      { id: 3, requirement: 'No paid software required - all tools used in this course are free and open source.' }
    ],
    outcomes: [
      { id: 1, outcome: 'Build 16+ web development projects for your developer portfolio to get hired.' },
      { id: 2, outcome: 'Master frontend development with React 19, Next.js 15, Tailwind CSS, and TypeScript.' },
      { id: 3, outcome: 'Master backend development with Node.js, Express, PostgreSQL, Prisma, and Supabase.' },
      { id: 4, outcome: 'Learn professional best practices including Git, GitHub, OWASP security, and CI/CD pipelines.' }
    ],
    faqs: [
      { id: 1, question: 'Do I need any previous coding experience?', answer: 'Not at all! This course is built completely from the ground up for beginners. Every concept is explained visually with interactive challenges.' },
      { id: 2, question: 'Will I receive a verifiable certificate upon completion?', answer: 'Yes! Once you complete 100% of the course lectures and quizzes, you will immediately receive an official certificate with a verifiable credential ID.' },
      { id: 3, question: 'How long do I have access to the course materials?', answer: 'You receive full lifetime access! You can learn at your own pace and revisit lectures and bonus updates whenever you like.' }
    ],
    sections: [
      {
        id: 1,
        title: 'Introduction to Web Architecture & HTML5 Essentials',
        lessons: [
          { id: 1, title: 'How the Web Works: Clients, Servers, and DNS', duration: '12:45', type: 'video', is_free: true },
          { id: 2, title: 'HTML Boilerplate and Semantic Tags', duration: '18:20', type: 'video', is_free: true },
          { id: 3, title: 'HTML5 Forms, Inputs, and Accessibility', duration: '15:10', type: 'video', is_free: false },
          { id: 4, title: 'Knowledge Check: HTML5 Foundations', duration: '10 Questions', type: 'quiz', is_free: false }
        ]
      },
      {
        id: 2,
        title: 'Modern CSS3, Flexbox, Grid & Responsive Design',
        lessons: [
          { id: 5, title: 'CSS Box Model, Selectors, and Specificity', duration: '22:15', type: 'video', is_free: false },
          { id: 6, title: 'Mastering Flexbox with Visual Diagrams', duration: '28:40', type: 'video', is_free: false },
          { id: 7, title: 'CSS Grid Layouts for Complex Interfaces', duration: '25:30', type: 'video', is_free: false },
          { id: 8, title: 'Project: Responsive Startup Landing Page', duration: '45:00', type: 'video', is_free: false }
        ]
      },
      {
        id: 3,
        title: 'JavaScript ES6+, DOM Manipulation & Asynchronous Programming',
        lessons: [
          { id: 9, title: 'Variables, Data Types, and ES6 Arrow Functions', duration: '20:10', type: 'video', is_free: false },
          { id: 10, title: 'DOM Event Listeners and Interactive UI Elements', duration: '31:25', type: 'video', is_free: false },
          { id: 11, title: 'Promises, Async/Await, and Fetching APIs', duration: '34:15', type: 'video', is_free: false },
          { id: 12, title: 'Capstone Project: Interactive Weather Dashboard', duration: '50:00', type: 'video', is_free: false }
        ]
      },
      {
        id: 4,
        title: 'Full-Stack Next.js 15, PostgreSQL & Production Deployment',
        lessons: [
          { id: 13, title: 'Next.js 15 App Router and React Server Components', duration: '40:20', type: 'video', is_free: false },
          { id: 14, title: 'Database Modeling with PostgreSQL & Supabase', duration: '36:10', type: 'video', is_free: false },
          { id: 15, title: 'Authentication, Middleware nonces, and OWASP Hardening', duration: '29:45', type: 'video', is_free: false },
          { id: 16, title: 'Deploying to Vercel with Custom Domains & Edge CDN', duration: '18:30', type: 'video', is_free: false }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user_name: 'Alexander Wright',
        user_avatar: '/assets/avatars/avatar-2.png',
        rating: 5,
        created_at: '2025-02-14',
        comment: 'This is hands down the highest quality web development course online. The step-by-step progression and modern tooling (React 19, Next.js 15) made learning full-stack painless. Landed my first junior frontend role 3 months after starting!',
        verified: true
      },
      {
        id: 2,
        user_name: 'Elena Rostova',
        user_avatar: '/assets/avatars/avatar-3.png',
        rating: 5,
        created_at: '2025-02-01',
        comment: 'Brilliant explanations! The curriculum is 100% updated with no legacy outdated callbacks. The real-world projects actually look good on GitHub portfolios.',
        verified: true
      },
      {
        id: 3,
        user_name: 'Marcus Chen',
        user_avatar: '/assets/avatars/avatar-4.png',
        rating: 5,
        created_at: '2025-01-20',
        comment: 'The explanations on Next.js 15 Server Components and PostgreSQL schema design were super clear. Highly recommended for beginners and intermediate devs alike.',
        verified: true
      }
    ]
  }
}

// Helper to provide realistic details for any requested course slug
function getFallbackCourse(slug: string) {
  if (FALLBACK_COURSES[slug]) {
    return FALLBACK_COURSES[slug]
  }

  // Derive dynamic fallback from slug
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    id: 99,
    title,
    slug,
    short_description: `Master ${title} with practical, real-world hands-on exercises, industry-standard best practices, and verifiable credentials.`,
    description: `This comprehensive masterclass provides end-to-end training in ${title}. Master the foundations, explore intermediate architectural patterns, and build industry-grade projects ready for production.

Taught by veteran software architects and industry experts, each module includes video walkthroughs, runnable source code repositories, quiz checkpoints, and downloadable cheatsheets.`,
    price: 79.99,
    discount_price: 19.99,
    discount: true,
    pricing_type: 'paid',
    level: 'All Levels',
    language: 'English',
    duration_hours: 38,
    lessons_duration: 136800,
    enrollments_count: 5420,
    rating: 4.8,
    reviews_count: 1240,
    preview_video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    instructor: {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@mentorlms.com',
      avatar: '/assets/avatars/avatar-1.png',
      designation: 'Principal Engineer & Enterprise Educator',
      bio: 'Over 12 years of hands-on software engineering and curriculum design experience, helping over 50,000 developers master modern technologies.',
      students_count: 52000,
      courses_count: 6,
      rating: 4.8,
      reviews_count: 9800,
    },
    requirements: [
      { id: 1, requirement: 'A basic understanding of modern computer workflows.' },
      { id: 2, requirement: 'A computer running Windows, macOS, or Linux with internet access.' }
    ],
    outcomes: [
      { id: 1, outcome: `Gain job-ready confidence and professional mastery in ${title}.` },
      { id: 2, outcome: 'Build clean, scalable, maintainable architectures following industry best practices.' },
      { id: 3, outcome: 'Acquire verifiable certificate of completion to showcase to prospective employers.' }
    ],
    faqs: [
      { id: 1, question: 'Is this course suitable for beginners?', answer: 'Yes! The curriculum is designed with a gentle learning curve starting from foundational principles and moving smoothly toward advanced techniques.' },
      { id: 2, question: 'Do I get access to source code and resources?', answer: 'Yes! Full source code repositories, architectural diagrams, and downloadable exercise files are included in every module.' }
    ],
    sections: [
      {
        id: 1,
        title: 'Core Foundations & Setup',
        lessons: [
          { id: 1, title: 'Introduction & Course Roadmap', duration: '08:30', type: 'video', is_free: true },
          { id: 2, title: 'Setting Up Your Modern Developer Workspace', duration: '15:45', type: 'video', is_free: true },
          { id: 3, title: 'Foundational Knowledge Check', duration: '5 Questions', type: 'quiz', is_free: false }
        ]
      },
      {
        id: 2,
        title: 'Deep Dive & Practical Implementation',
        lessons: [
          { id: 4, title: 'Architectural Design Principles', duration: '24:10', type: 'video', is_free: false },
          { id: 5, title: 'Hands-on Building: Core Module', duration: '32:50', type: 'video', is_free: false },
          { id: 6, title: 'Performance Optimization & Benchmarking', duration: '19:20', type: 'video', is_free: false }
        ]
      },
      {
        id: 3,
        title: 'Production Readiness & Deployment',
        lessons: [
          { id: 7, title: 'Testing, Debugging, and Security Audits', duration: '28:15', type: 'video', is_free: false },
          { id: 8, title: 'Final Capstone Project & Certificate Claim', duration: '35:00', type: 'video', is_free: false }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user_name: 'David Miller',
        user_avatar: '/assets/avatars/avatar-2.png',
        rating: 5,
        created_at: '2025-02-18',
        comment: 'Crystal clear explanations, concise pacing, and immediately applicable real-world insights. Outstanding course!',
        verified: true
      },
      {
        id: 2,
        user_name: 'Sophia Martinez',
        user_avatar: '/assets/avatars/avatar-3.png',
        rating: 5,
        created_at: '2025-01-29',
        comment: 'One of the best structured courses I have ever completed. The exercises solidified the lessons perfectly.',
        verified: true
      }
    ]
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const dbCourse = courseRepository.findBySlug(slug)
  const fallback = getFallbackCourse(slug)
  const title = dbCourse?.title || fallback.title
  const description = dbCourse?.short_description || fallback.short_description
  const thumbnail = dbCourse?.thumbnail || fallback.thumbnail

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: thumbnail, width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [thumbnail],
    },
  }
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  const dbCourse = courseRepository.findBySlug(slug)
  const fallback = getFallbackCourse(slug)

  let liveSections = fallback.sections
  if (dbCourse) {
    const curriculum = courseRepository.getCurriculum(dbCourse.id)
    if (curriculum && curriculum.length > 0) {
      liveSections = curriculum.map((sec) => ({
        id: sec.id,
        title: sec.title,
        lessons: sec.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration || '15:00',
          type: l.lesson_type || 'video',
          is_free: Boolean(l.is_free),
        })),
      }))
    }
  }

  const course = dbCourse
    ? {
        ...fallback,
        id: dbCourse.id,
        title: dbCourse.title,
        slug: dbCourse.slug,
        short_description: dbCourse.short_description || fallback.short_description,
        description: dbCourse.description || fallback.description,
        price: dbCourse.price !== undefined ? Number(dbCourse.price) : fallback.price,
        discount_price: dbCourse.discount_price !== undefined ? Number(dbCourse.discount_price) : fallback.discount_price,
        discount: Boolean(dbCourse.discount),
        pricing_type: dbCourse.pricing_type || fallback.pricing_type,
        level: dbCourse.level || fallback.level,
        thumbnail: dbCourse.thumbnail || fallback.thumbnail,
        instructor: {
          ...fallback.instructor,
          name: dbCourse.instructor_name || fallback.instructor.name,
          avatar: dbCourse.instructor_photo || fallback.instructor.avatar,
        },
        sections: liveSections,
        enrollments_count: dbCourse.enrollments_count || fallback.enrollments_count,
      }
    : fallback

  // Calculate total lessons
  const totalLessons = course.sections.reduce(
    (acc: number, section: any) => acc + (section.lessons?.length || 0),
    0
  )

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.short_description,
    image: course.thumbnail,
    provider: {
      '@type': 'Organization',
      name: 'Mentor LMS',
      url: 'https://mentorlms.com',
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
    },
    courseCode: course.slug,
    educationalLevel: course.level,
    inLanguage: course.language,
    offers: {
      '@type': 'Offer',
      price: course.discount ? course.discount_price : course.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/courses/all" className="hover:text-foreground">Courses</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-70">
            {course.title}
          </span>
        </div>

        {/* 1:1 Layout Grid: Left Content (2 Cols) & Right Sticky Preview (1 Col) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Course Header */}
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {course.title}
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed">
                {course.short_description}
              </p>

              {/* Meta Attributes Bar */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-3 pt-2 text-sm">
                {/* Instructor */}
                <Link
                  href={`/instructors/${course.instructor.id}`}
                  className="group flex items-center gap-2.5"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground group-hover:underline">
                    {course.instructor.name}
                  </span>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">
                    {Number(course.rating).toFixed(1)}
                  </span>
                  <RatingStars rating={course.rating} starClass="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    ({course.reviews_count})
                  </span>
                </div>

                {/* Language */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Languages className="h-4 w-4 text-foreground/70" />
                  <span className="text-foreground font-medium">{course.language}</span>
                </div>

                {/* Certificate */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-foreground/70" />
                  <span className="text-foreground font-medium">Certificate Included</span>
                </div>

                {/* Enrolled Students */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-foreground/70" />
                  <span className="text-foreground font-medium">
                    {course.enrollments_count.toLocaleString()} Students
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-foreground/70" />
                  <span className="text-foreground font-medium">
                    {course.duration_hours} Total Hours
                  </span>
                </div>
              </div>
            </div>

            {/* 1:1 Course Details Tabs */}
            <Tabs defaultValue="overview" className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto border-b border-border bg-muted/40 px-2">
                <TabsList className="h-12 bg-transparent gap-2 p-0">
                  <TabsTrigger
                    value="overview"
                    className="h-12 rounded-none border-b-2 border-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="h-12 rounded-none border-b-2 border-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="h-12 rounded-none border-b-2 border-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    Requirements & Outcomes
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className="h-12 rounded-none border-b-2 border-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="h-12 rounded-none border-b-2 border-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    Reviews ({course.reviews_count})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="m-0 p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Course Overview</h3>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                <Separator />

                {/* FAQs Accordion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Frequently Asked Questions</h3>
                  </div>

                  <Accordion className="space-y-2">
                    {course.faqs.map((faq: any) => (
                      <AccordionItem
                        key={faq.id}
                        value={`faq-${faq.id}`}
                        className="rounded-lg border border-border px-4 bg-muted/20"
                      >
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              {/* Tab 2: Curriculum */}
              <TabsContent value="curriculum" className="m-0 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">Course Curriculum</h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {course.sections.length} Sections • {totalLessons} Lessons
                  </span>
                </div>

                <Accordion
                  defaultValue={["sec-1"]}
                  className="space-y-3"
                >
                  {course.sections.map((section: any, idx: number) => (
                    <AccordionItem
                      key={section.id}
                      value={`sec-${section.id}`}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <AccordionTrigger className="px-4 py-3.5 text-sm font-semibold hover:no-underline hover:bg-muted/40 data-open:bg-muted/30">
                        <div className="flex items-center gap-3 text-left">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span>{section.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t border-border">
                        <div className="divide-y divide-border">
                          {section.lessons.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  {lesson.type === 'video' ? (
                                    <Video className="h-3.5 w-3.5" />
                                  ) : (
                                    <FileQuestion className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <span className="font-medium text-foreground">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.is_free && (
                                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                                    Preview
                                  </Badge>
                                )}
                                <span className="text-muted-foreground font-medium">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* Tab 3: Requirements & Outcomes */}
              <TabsContent value="details" className="m-0 p-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Prerequisites & Requirements</h4>
                    <Separator />
                    <div className="space-y-3">
                      {course.requirements.map((req: any) => (
                        <div key={req.id} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">{req.requirement}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-foreground">What You Will Learn</h4>
                    <Separator />
                    <div className="space-y-3">
                      {course.outcomes.map((out: any) => (
                        <div key={out.id} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                          <p className="text-muted-foreground leading-relaxed">{out.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Instructor */}
              <TabsContent value="instructor" className="m-0 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{course.instructor.name}</h4>
                      <p className="text-xs text-muted-foreground">{course.instructor.designation}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.instructor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {Number(course.instructor.rating).toFixed(1)}
                    </span>
                    <RatingStars rating={course.instructor.rating} starClass="h-4 w-4" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-xl bg-muted/40 p-4 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {course.instructor.students_count.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Courses</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {course.instructor.courses_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reviews</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {course.instructor.reviews_count.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.instructor.bio}
                </p>

                <div>
                  <Link href={`/instructors/${course.instructor.id}`}>
                    <Button variant="outline" size="sm" className="font-semibold text-xs">
                      View Instructor Profile & All Courses
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Tab 5: Reviews */}
              <TabsContent value="reviews" className="m-0 p-6 space-y-8">
                <StudentFeedback
                  totalReviews={{
                    total_reviews: course.reviews_count,
                    average_rating: course.rating,
                    rating_distribution: [
                      { stars: 5, count: Math.round(course.reviews_count * 0.78), percentage: 78.4 },
                      { stars: 4, count: Math.round(course.reviews_count * 0.15), percentage: 15.2 },
                      { stars: 3, count: Math.round(course.reviews_count * 0.04), percentage: 4.1 },
                      { stars: 2, count: Math.round(course.reviews_count * 0.015), percentage: 1.5 },
                      { stars: 1, count: Math.round(course.reviews_count * 0.008), percentage: 0.8 },
                    ],
                  }}
                />

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-lg font-bold text-foreground">Verified Student Reviews</h4>
                  <div className="space-y-4">
                    {course.reviews.map((rev: any) => (
                      <ReviewCard
                        key={rev.id}
                        review={{
                          id: rev.id,
                          author_name: rev.user_name,
                          author_avatar: rev.user_avatar,
                          rating: rev.rating,
                          created_at: rev.created_at,
                          content: rev.comment,
                          verified: rev.verified,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Sticky Preview & Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md">
              {/* Thumbnail with Video Play Dialog */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />

                <Dialog>
                  <DialogTrigger
                    render={
                      <button
                        className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white shadow-xl transition-transform hover:scale-110 cursor-pointer"
                        aria-label="Play course preview"
                      >
                        <Play className="h-6 w-6 fill-white ml-0.5" />
                      </button>
                    }
                  />
                  <DialogContent className="max-w-3xl overflow-hidden p-0 bg-black border-border">
                    <div className="relative aspect-video w-full">
                      <video
                        controls
                        autoPlay
                        className="h-full w-full"
                        src={course.preview_video}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-foreground">
                  {course.pricing_type === 'free' ? 'Free' : `$${course.discount ? course.discount_price.toFixed(2) : course.price.toFixed(2)}`}
                </span>
                {course.discount && (
                  <span className="text-sm text-muted-foreground line-through font-medium">
                    ${course.price.toFixed(2)}
                  </span>
                )}
                {course.discount && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-semibold ml-auto">
                    78% OFF
                  </Badge>
                )}
              </div>

              {/* Dynamic Action Buttons matching Laravel */}
              <CourseEnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                pricingType={course.pricing_type}
              />

              {/* Bulleted Specifications */}
              <div className="space-y-3 pt-4 border-t border-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-foreground/70" />
                    Enrolled Students
                  </span>
                  <span className="font-semibold text-foreground">
                    {course.enrollments_count.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Languages className="h-4 w-4 text-foreground/70" />
                    Language
                  </span>
                  <span className="font-semibold text-foreground">{course.language}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-foreground/70" />
                    Duration
                  </span>
                  <span className="font-semibold text-foreground">{course.duration_hours} Hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4 text-foreground/70" />
                    Skill Level
                  </span>
                  <span className="font-semibold text-foreground">{course.level}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-foreground/70" />
                    Access Period
                  </span>
                  <span className="font-semibold text-foreground">Lifetime Access</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-foreground/70" />
                    Certificate
                  </span>
                  <span className="font-semibold text-emerald-500">Included (Yes)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
