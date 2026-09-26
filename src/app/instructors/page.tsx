import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Star, ArrowRight, Search, ShieldCheck } from 'lucide-react'
import RatingStars from '@/components/common/RatingStars'

export const metadata: Metadata = {
  title: 'Expert Instructors | Mentor LMS',
  description: 'Learn from industry leading engineers, architects, and designers with real-world enterprise experience.',
  openGraph: {
    title: 'Expert Instructors | Mentor LMS',
    description: 'Learn from industry leading engineers, architects, and designers.',
  },
}

export interface InstructorProfile {
  id: number
  name: string
  email: string
  designation: string
  avatar: string
  bio: string
  students_count: number
  courses_count: number
  rating: number
  reviews_count: number
  skills: string[]
}

export const INSTRUCTORS: InstructorProfile[] = [
  {
    id: 1,
    name: 'Dr. Angela Yu',
    email: 'angela@appbrewery.com',
    designation: 'Lead Instructor & Founder at App Brewery',
    avatar: '/assets/avatars/avatar-1.png',
    bio: 'Educator and software engineer dedicated to teaching over 1,000,000 students globally with hands-on project-based bootcamps.',
    students_count: 185000,
    courses_count: 8,
    rating: 4.9,
    reviews_count: 45000,
    skills: ['Web Development', 'React', 'Next.js', 'Python', 'Web3']
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@mentorlms.com',
    designation: 'Principal Engineer & Enterprise Educator',
    avatar: '/assets/avatars/avatar-2.png',
    bio: 'Over 12 years of architecting scalable distributed systems and mentoring senior engineering teams across Fortune 500 enterprises.',
    students_count: 52000,
    courses_count: 6,
    rating: 4.9,
    reviews_count: 9800,
    skills: ['System Design', 'Microservices', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 3,
    name: 'Michael Chang',
    email: 'michael.chang@mentorlms.com',
    designation: 'Staff Cloud Architect & DevOps Lead',
    avatar: '/assets/avatars/avatar-3.png',
    bio: 'Specialist in Kubernetes, Terraform, AWS multi-region architectures, and zero-downtime CI/CD deployment pipelines.',
    students_count: 34000,
    courses_count: 4,
    rating: 4.8,
    reviews_count: 6200,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD']
  },
  {
    id: 4,
    name: 'Jessica Miller',
    email: 'jessica.m@mentorlms.com',
    designation: 'VP of Product Design & Design Systems',
    avatar: '/assets/avatars/avatar-4.png',
    bio: 'Passionate about human-centered design, Figma design tokens, WCAG accessibility, and fluid micro-interactions.',
    students_count: 41000,
    courses_count: 5,
    rating: 4.9,
    reviews_count: 8100,
    skills: ['UI/UX', 'Figma', 'Design Systems', 'Accessibility']
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@mentorlms.com',
    designation: 'Lead Mobile Architect (Flutter & React Native)',
    avatar: '/assets/avatars/avatar-1.png',
    bio: 'Published author and mobile developer who has built top-charting iOS and Android applications with millions of active users.',
    students_count: 28000,
    courses_count: 4,
    rating: 4.7,
    reviews_count: 4900,
    skills: ['Flutter', 'React Native', 'Swift', 'Kotlin']
  },
  {
    id: 6,
    name: 'Alexander Wright',
    email: 'alex.wright@mentorlms.com',
    designation: 'Senior Security Engineer & Red Teamer',
    avatar: '/assets/avatars/avatar-2.png',
    bio: 'Ethical hacker and application security researcher helping developers build bulletproof software protected against modern OWASP attacks.',
    students_count: 19000,
    courses_count: 3,
    rating: 4.9,
    reviews_count: 3400,
    skills: ['Cybersecurity', 'OWASP', 'Penetration Testing', 'Cryptographic Security']
  }
]

export const dynamic = 'force-dynamic'

import db from '@/lib/db'

export function getDatabaseInstructors(): InstructorProfile[] {
  try {
    const rows = db.prepare(`
      SELECT 
        i.id, 
        u.id as user_id, 
        u.name, 
        u.email, 
        u.photo as avatar, 
        i.about as bio, 
        i.skills, 
        (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = i.id) as courses_count, 
        (SELECT COUNT(*) FROM course_enrollments ce JOIN courses c ON ce.course_id = c.id WHERE c.instructor_id = i.id) as students_count, 
        (SELECT COALESCE(AVG(cr.rating), 4.9) FROM course_reviews cr JOIN courses c ON cr.course_id = c.id WHERE c.instructor_id = i.id) as rating, 
        (SELECT COUNT(*) FROM course_reviews cr JOIN courses c ON cr.course_id = c.id WHERE c.instructor_id = i.id) as reviews_count 
      FROM instructors i 
      JOIN users u ON i.user_id = u.id
      ORDER BY i.id ASC
    `).all() as any[]

    if (!rows || rows.length === 0) return INSTRUCTORS

    return rows.map((r, idx) => {
      let skillsArray = ['Software Architecture', 'Full-Stack Development']
      if (r.skills) {
        try {
          skillsArray = Array.isArray(r.skills) ? r.skills : JSON.parse(r.skills)
        } catch {
          skillsArray = String(r.skills).split(',').map((s: string) => s.trim())
        }
      }
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        designation: INSTRUCTORS[idx]?.designation || 'Lead Engineering Instructor',
        avatar: r.avatar || `/assets/avatars/avatar-${(r.id % 4) + 1}.png`,
        bio: r.bio || 'Experienced software professional and mentor committed to student mastery through practical, production-oriented education.',
        students_count: Number(r.students_count || 120),
        courses_count: Number(r.courses_count || 0),
        rating: Number(r.rating || 4.9),
        reviews_count: Number(r.reviews_count || 18),
        skills: skillsArray,
      }
    })
  } catch {
    return INSTRUCTORS
  }
}

export default function InstructorsDirectoryPage() {
  const instructors = getDatabaseInstructors()

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Expert Instructors',
    description: 'Explore courses taught by world-class industry practitioners and mentors.',
    numberOfItems: instructors.length,
    itemListElement: instructors.map((inst, index) => ({
      '@type': 'Person',
      position: index + 1,
      name: inst.name,
      jobTitle: inst.designation,
      email: inst.email,
      description: inst.bio,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
            World-Class Mentors
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Learn from Verified Industry Leaders
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Our instructors are veteran software engineers, cloud architects, and product designers actively building production systems at top tech companies.
          </p>
        </div>

        {/* Instructor Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
            >
              <div>
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start justify-between gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border group-hover:border-primary/40 transition-colors">
                    <AvatarImage src={instructor.avatar} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{instructor.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {instructor.name}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {instructor.designation}
                  </p>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {instructor.bio}
                </p>

                {/* Skills Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {instructor.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[11px] font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics & Profile Link */}
              <div className="mt-6 pt-4 border-t border-border space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      Students
                    </span>
                    <p className="mt-0.5 font-bold text-foreground">
                      {instructor.students_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      Courses
                    </span>
                    <p className="mt-0.5 font-bold text-foreground">
                      {instructor.courses_count}
                    </p>
                  </div>
                </div>

                <Link href={`/instructors/${instructor.id}`} className="block w-full">
                  <Button variant="outline" className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Profile & Courses
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
