'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { TwitterIcon, LinkedinIcon } from '@/components/common/SocialIcons'
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
  const photoUrl = instructor.photo || '/assets/images/instructor-david-miller.jpg'
  const finalPhotoSrc = photoUrl.includes('?') ? photoUrl : `${photoUrl}?v=2`

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
        className
      )}
    >
      {/* 1. Pure Clean Instructor Portrait (No baked-in badges or icons) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-slate-100 dark:bg-slate-800 select-none">
        <Image
          src={finalPhotoSrc}
          alt={instructor.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
          priority
        />

        {/* 2. Top-Right Circular Arrow Button: 100% Coded Component */}
        <Link
          href={`/instructors/${instructor.id}`}
          className="absolute top-3 right-3 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 transition-all duration-200 hover:scale-110 active:scale-95 z-10 cursor-pointer"
          aria-label={`View ${instructor.name}'s profile`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>

        {/* 3. Bottom-Left Verified Expert Badge: 100% Coded Component */}
        <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#D8FC38] px-3 py-1 text-slate-950 shadow-sm select-none">
          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="text-xs font-bold tracking-tight leading-none">
            Verified Expert
          </span>
        </div>
      </div>

      {/* Instructor Information */}
      <div className="pt-4 pb-1 px-1 text-left">
        <Link href={`/instructors/${instructor.id}`}>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white transition-colors duration-150 hover:text-slate-950 dark:hover:text-[#D8FC38] truncate">
            {instructor.name}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
          {instructor.designation}
        </p>

        {/* Bottom Courses Stat & Social Links */}
        <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              {instructor.coursesCount || 6}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-none font-medium">
              Published Courses
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <span
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Twitter Profile"
            >
              <TwitterIcon className="h-4 w-4" />
            </span>
            <span
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
