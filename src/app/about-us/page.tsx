import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import CallToAction from '@/components/home/CallToAction'

export const metadata: Metadata = {
  title: 'About Us - Why Choose Mentor?',
  description: 'Mentor LMS offers quality content, affordable learning, and continuous improvement in online education.',
  keywords: 'about us, mission, vision, quality content, affordable learning, education platform',
}

const teamMembers = [
  { name: 'Sarah Johnson', role: 'Lead Instructor', image: '/assets/images/users/user-1.jpg' },
  { name: 'Michael Chen', role: 'Course Designer', image: '/assets/images/users/user-2.jpg' },
  { name: 'Emily Rodriguez', role: 'Learning Experience Manager', image: '/assets/images/users/user-3.jpg' },
  { name: 'David Thompson', role: 'Technology Director', image: '/assets/images/users/user-4.jpg' },
  { name: 'Lisa Wang', role: 'Student Success Coordinator', image: '/assets/images/users/user-5.jpg' },
  { name: 'James Miller', role: 'Content Strategist', image: '/assets/images/users/user-6.jpg' },
  { name: 'Amanda Davis', role: 'Quality Assurance Lead', image: '/assets/images/users/user-7.jpg' },
  { name: 'Robert Kim', role: 'Community Manager', image: '/assets/images/users/user-8.jpg' },
]

export default function AboutUsPage() {
  return (
    <>
      {/* 1. Header Banner & Breadcrumbs matching Laravel */}
      <InnerHero title="About Us" slug="about-us" />

      {/* 2. Hero Section: 2 Images + Mission & Value */}
      <section className="container py-20 md:py-30">
        <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row md:gap-7">
          <div className="grid w-full grid-cols-1 gap-7 md:grid-cols-2 flex-1">
            <div className="h-89">
              <img
                src="/assets/images/team-1.jpg"
                alt="Our Mission"
                className="h-full w-full rounded-2xl object-cover object-center"
              />
            </div>
            <div className="h-89">
              <img
                src="/assets/images/team-2.jpg"
                alt="Our Value"
                className="h-full w-full rounded-2xl object-cover object-center"
              />
            </div>
          </div>

          <div className="w-full space-y-7 md:max-w-120">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold md:text-[30px] text-foreground">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize education by making high-quality learning accessible to everyone, everywhere. We strive to bridge the gap between knowledge and application. Meet our passionate team of educators, developers, and designers who believe in the power of learning to change lives.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold md:text-[30px] text-foreground">
                Our Value
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe in fostering a love for lifelong learning through innovative teaching methods, personalized experiences, and supportive communities. Meet our passionate team of educators, developers, and designers who believe in the power of learning to change lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Success Statistics Section */}
      <div className="overflow-y-hidden bg-cover bg-center py-30">
        <section className="container relative">
          <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row md:gap-7">
            <div className="relative w-full space-y-7 md:max-w-96">
              <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-bold md:text-[30px] text-foreground leading-tight">
                  Our Success Depends on Our Students Success
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Join thousands of learners achieving their dreams with Mentor LMS.
                </p>
              </div>

              <div>
                <Link
                  href="/courses/all"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-none!"
                >
                  Browse Courses
                </Link>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-6 lg:justify-start">
                <div>
                  <h6 className="text-2xl font-bold md:text-[30px] text-foreground">
                    100+
                  </h6>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
                <div>
                  <h6 className="text-2xl font-bold md:text-[30px] text-foreground">
                    300+
                  </h6>
                  <p className="text-sm text-muted-foreground">Best Courses</p>
                </div>
                <div>
                  <h6 className="text-2xl font-bold md:text-[30px] text-foreground">
                    40k+
                  </h6>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 flex-1">
              <div className="h-100">
                <img
                  src="/assets/images/students-1.jpg"
                  alt="Active Students"
                  className="h-full w-full rounded-2xl object-cover object-center"
                />
              </div>
              <div className="h-100">
                <img
                  src="/assets/images/students-2.jpg"
                  alt="Best Courses"
                  className="h-full w-full rounded-2xl object-cover object-center"
                />
              </div>
              <div className="h-100">
                <img
                  src="/assets/images/students-3.jpg"
                  alt="Active Users"
                  className="h-full w-full rounded-2xl object-cover object-center"
                />
              </div>
            </div>
          </div>

          <div className="after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(0,120,103,1)] after:blur-[200px] after:content-['']" />
          <div className="after:pointer-events-none after:absolute after:top-0 after:right-0 after:h-60 after:w-60 after:rounded-full after:bg-[rgba(97,95,255,1)] after:blur-[200px] after:content-['']" />
        </section>
      </div>

      {/* 4. Team Section */}
      <section className="container py-20 md:py-30">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:gap-7">
          <div className="relative w-full space-y-7 md:max-w-96">
            <h2 className="text-2xl font-bold md:text-[30px] text-foreground">
              The Minds Behind the Mission
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Meet our passionate team of educators, developers, and designers who believe in the power of learning to change lives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-4 flex-1">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative h-48 overflow-hidden rounded-lg"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full rounded-lg object-cover object-center"
                />
                <div className="absolute bottom-0 left-1/2 flex h-full w-full -translate-x-1/2 flex-col justify-end bg-linear-to-t from-black/80 to-transparent p-4 text-center opacity-0 transition-all duration-200 group-hover:opacity-100">
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-white">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to Action Newsletter */}
      <CallToAction />
    </>
  )
}
