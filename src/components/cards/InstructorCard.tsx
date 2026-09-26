'use client'

import React from 'react'
import Link from 'next/link'
import { FacebookIcon, TwitterIcon, LinkedinIcon } from '@/components/common/SocialIcons'
import { cn } from '@/lib/utils'

export interface InstructorData {
  id: string | number
  name: string
  designation: string
  photo: string
  coursesCount?: number
  studentsCount?: number
  socials?: {
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}

export default function InstructorCard({
  instructor,
  className,
}: {
  instructor: InstructorData
  className?: string
}) {
  return (
    <div
      className={cn(
        'group relative h-90 sm:h-95 w-full overflow-hidden rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <Link href={`/instructors/${instructor.id}`} className="block h-full w-full">
        <img
          src={instructor.photo || '/assets/avatars/avatar-1.png'}
          alt={instructor.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/assets/avatars/avatar-1.png'
          }}
        />

        {/* Gradient Overlay revealed on hover */}
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 via-black/40 to-transparent p-5 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="mb-1 text-lg font-bold text-white tracking-wide">
            {instructor.name}
          </p>
          <p className="text-sm font-medium text-white/80 mb-3">
            {instructor.designation}
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black">
              <TwitterIcon className="h-4 w-4" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black">
              <LinkedinIcon className="h-4 w-4" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black">
              <FacebookIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
