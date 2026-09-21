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
  instructors = topInstructorsList,
}: {
  instructors?: InstructorData[]
}) {
  const displayInstructors =
    instructors.length > 0 ? instructors : topInstructorsList

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-14 text-center md:max-w-md">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
            Top Instructors
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Meet Our Experts
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Learn directly from passionate practitioners who have engineered systems
            at scale and mentored thousands of developers globally.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayInstructors.slice(0, 4).map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </div>
    </section>
  )
}
