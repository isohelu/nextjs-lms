'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Video, FileText, FileQuestion, Sparkles, Clock, Users, ArrowRight } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TopCourseSpotlight() {
  const topCourse = {
    title: 'The Complete 2025 Web Development Bootcamp',
    slug: 'complete-web-development-bootcamp-2025',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    preview_video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    students_count: 14200,
    duration: '65 Hours',
    price: 19.99,
    original_price: 89.99,
    sections: [
      {
        id: 'sec-1',
        title: 'Full-Stack Web Architecture & Setup',
        lessons: [
          { id: 1, title: 'How the Web Works: Clients, Servers & DNS', duration: '12:45', type: 'video' },
          { id: 2, title: 'HTML5 Boilerplate & Semantic Elements', duration: '18:20', type: 'video' },
          { id: 3, title: 'Knowledge Check: Architecture Fundamentals', duration: '5 Questions', type: 'quiz' }
        ]
      },
      {
        id: 'sec-2',
        title: 'Modern CSS3, Flexbox & Responsive Layouts',
        lessons: [
          { id: 4, title: 'Mastering CSS Flexbox with Visual Diagrams', duration: '28:40', type: 'video' },
          { id: 5, title: 'CSS Grid & Container Queries', duration: '25:30', type: 'video' }
        ]
      },
      {
        id: 'sec-3',
        title: 'Full-Stack Next.js 15, React 19 & Supabase',
        lessons: [
          { id: 6, title: 'React 19 Server Components & App Router', duration: '40:20', type: 'video' },
          { id: 7, title: 'Hardening Security with Dynamic CSP Nonces', duration: '29:45', type: 'video' }
        ]
      }
    ]
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-muted/20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
            Featured Masterclass
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Course Spotlight of the Month
          </h2>
          <p className="text-sm text-muted-foreground">
            Hand-picked by our curriculum directors for comprehensive architectural depth and industry relevance.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl p-6 sm:p-10 space-y-8">
          {/* Thumbnail with Dialog */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <img
              src={topCourse.thumbnail}
              alt={topCourse.title}
              className="h-full w-full object-cover"
            />
            <Dialog>
              <DialogTrigger
                render={
                  <button
                    className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white shadow-2xl transition-transform hover:scale-110 cursor-pointer"
                    aria-label="Play video teaser"
                  >
                    <Play className="h-7 w-7 fill-white ml-0.5" />
                  </button>
                }
              />
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-border">
                <div className="relative aspect-video w-full">
                  <video
                    controls
                    autoPlay
                    className="h-full w-full"
                    src={topCourse.preview_video}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {topCourse.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {topCourse.students_count.toLocaleString()} students
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {topCourse.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="text-right">
                <span className="text-2xl font-black text-foreground">
                  ${topCourse.price}
                </span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  ${topCourse.original_price}
                </span>
              </div>
              <Link href={`/courses/${topCourse.slug}`}>
                <Button size="lg" className="rounded-xl font-bold text-xs">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Enroll Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Module Syllabus Preview Accordion */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground">What You&apos;ll Build & Master</h4>
            <Accordion defaultValue={['sec-1']} className="space-y-3">
              {topCourse.sections.map((section, idx) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <AccordionTrigger className="px-5 py-3.5 text-xs sm:text-sm font-semibold hover:no-underline">
                    <span>Module {idx + 1}: {section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 border-t border-border">
                    <div className="divide-y divide-border">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-5 py-2.5 text-xs text-muted-foreground"
                        >
                          <div className="flex items-center gap-2.5">
                            {lesson.type === 'video' ? (
                              <Video className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <FileQuestion className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="text-foreground">{lesson.title}</span>
                          </div>
                          <span className="text-[11px]">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
