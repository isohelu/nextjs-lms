import React from 'react'
import InstructorCard, { InstructorData } from '@/components/cards/InstructorCard'

const topInstructorsList: InstructorData[] = [
  {
    id: 1,
    name: 'David Miller',
    designation: 'Principal Software Architect',
    photo: '/assets/avatars/avatar-1.png',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    designation: 'AI & Machine Learning Lead',
    photo: '/assets/avatars/avatar-2.png',
  },
  {
    id: 3,
    name: 'Marcus Chen',
    designation: 'Staff DevOps & Cloud Specialist',
    photo: '/assets/avatars/avatar-3.png',
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    designation: 'Senior Product Designer',
    photo: '/assets/avatars/avatar-4.png',
  },
]

export default function TopInstructors({
  title = 'Meet Our Experts',
  instructors = topInstructorsList,
}: {
  title?: string
  instructors?: InstructorData[]
}) {
  const displayInstructors =
    instructors.length > 0 ? instructors : topInstructorsList

  return (
    <section className="container py-20">
      {/* Header matching Laravel 1:1 */}
      <div className="mx-auto mb-10 text-center md:max-w-120">
        <p className="mb-1 font-medium text-secondary-foreground">
          Top Instructors
        </p>
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground">
          Discover skilled educators who inspire, guide, and share their expertise
        </p>
      </div>

      {/* Instructors Grid matching 4-column layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {displayInstructors.slice(0, 4).map((instructor) => (
          <div key={instructor.id} className="h-full w-full">
            <InstructorCard instructor={instructor} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  )
}
