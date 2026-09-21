import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  BookOpen
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch course details with modules and lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*),
      modules:modules(
        *,
        lessons:lessons(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !course) {
    notFound()
  }

  // Sort modules and lessons
  const sortedModules = (course.modules || []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  )

  sortedModules.forEach((m: { lessons?: { order_index: number }[] }) => {
    if (m.lessons) {
      m.lessons.sort((a, b) => a.order_index - b.order_index)
    }
  })

  // Calculate total lessons
  const totalLessons = sortedModules.reduce(
    (acc: number, m: { lessons?: unknown[] }) => acc + (m.lessons?.length || 0),
    0
  )

  return (
    <div className="min-h-screen py-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Courses</Link>
        <span>/</span>
        <span className="text-indigo-400 font-medium">{course.category?.name || 'Curriculum'}</span>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
      </div>

      {/* Hero Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 8 Cols: Course Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {course.level} Level
            </Badge>
            {course.category?.name && (
              <Badge variant="outline" className="text-muted-foreground">
                {course.category.name}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 ml-auto">
              <Star className="size-4 fill-amber-400" />
              {course.rating} ({course.students_count} reviews)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {course.description}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-indigo-400" />
              <span><strong>{course.duration_hours}</strong> Hours on-demand content</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-400" />
              <span><strong>{totalLessons}</strong> Interactive Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="size-4 text-indigo-400" />
              <span>Official Certificate</span>
            </div>
          </div>

          {/* Instructor Bio Card */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 flex items-center gap-4">
            <Avatar className="size-14 border border-indigo-500/30">
              <AvatarImage src={course.instructor_avatar} />
              <AvatarFallback>{course.instructor_name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Instructor</p>
              <h3 className="text-base font-bold text-foreground">{course.instructor_name}</h3>
              <p className="text-xs text-muted-foreground">{course.instructor_title}</p>
            </div>
          </div>

          {/* Curriculum Syllabus Accordion */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Course Syllabus</h2>
                <p className="text-xs text-muted-foreground">
                  {sortedModules.length} Modules • {totalLessons} Lessons
                </p>
              </div>
            </div>

            <Accordion className="w-full space-y-3">
              {sortedModules.map((module: { id: string; title: string; description?: string; lessons?: { id: string; title: string; duration_minutes: number; is_free_preview: boolean }[] }, idx: number) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border border-border/60 rounded-xl px-4 bg-card/40"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold text-foreground">
                    <div className="flex items-center gap-3 text-left">
                      <span className="size-6 rounded-md bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p>{module.title}</p>
                        {module.description && (
                          <p className="text-xs text-muted-foreground font-normal">{module.description}</p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-2 border-t border-border/40">
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 hover:bg-accent/50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {lesson.is_free_preview ? (
                              <PlayCircle className="size-4 text-emerald-400" />
                            ) : (
                              <Lock className="size-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-foreground">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {lesson.is_free_preview && (
                              <Badge variant="secondary" className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20">
                                Free Preview
                              </Badge>
                            )}
                            <span className="text-muted-foreground text-[11px]">{lesson.duration_minutes} min</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Lessons coming soon.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Right 4 Cols: Sticky Purchase / Enrollment Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="relative h-52 w-full bg-muted">
              <Image
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex items-center justify-center">
                <Link href={`/courses/${course.slug}/learn`}>
                  <div className="flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer">
                    <PlayCircle className="size-7 fill-white/20" />
                  </div>
                </Link>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-foreground">
                    {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
                  </span>
                  <span className="text-xs text-muted-foreground line-through ml-2 font-medium">
                    ${(Number(course.price) * 1.5 + 20).toFixed(2)}
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Full Lifetime Access
                </Badge>
              </div>

              <div className="space-y-3">
                <Link href={`/courses/${course.slug}/learn`} className="w-full block">
                  <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500">
                    <Sparkles className="size-4 mr-2" />
                    Start Learning Now
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold">
                    Go to My Dashboard
                  </Button>
                </Link>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                <p className="font-bold text-foreground mb-2">This course includes:</p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-3.5 text-emerald-400" />
                  Full HD video tutorials & code walkthroughs
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-3.5 text-emerald-400" />
                  Source code repository & architecture diagrams
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-3.5 text-emerald-400" />
                  Realtime progress syncing via Supabase
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-3.5 text-emerald-400" />
                  Certificate of completion
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
