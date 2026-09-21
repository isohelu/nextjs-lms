import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Course } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Trophy,
  Clock,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Play
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check auth user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all courses to show active or demo enrollments
  const { data: allCoursesData } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_published', true)

  const allCourses: Course[] = allCoursesData || []

  // Fetch user's enrollments if authenticated
  let enrollments = []
  if (user) {
    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', user.id)

    if (enrollData && enrollData.length > 0) {
      enrollments = enrollData
    }
  }

  // Fallback demo enrollments for preview when visiting before sign-in
  const displayCourses =
    enrollments.length > 0
      ? enrollments.map((e) => ({
          course: e.course,
          progress: e.progress_percent || 0,
        }))
      : allCourses.slice(0, 2).map((c, i) => ({
          course: c,
          progress: i === 0 ? 65 : 25,
        }))

  return (
    <div className="min-h-screen py-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
              Active Learner
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pick up right where you left off and keep building your engineering portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/#catalog">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              <Sparkles className="size-4 mr-1.5" />
              Explore More Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Enrolled Courses</p>
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <BookOpen className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{displayCourses.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Active curricula</p>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Hours Studied</p>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">24.5h</p>
          <p className="text-[11px] text-muted-foreground mt-1">+4.5h this week</p>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Certificates Earned</p>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">1</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">Verified credential</p>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Achievement Score</p>
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Trophy className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">850 XP</p>
          <p className="text-[11px] text-muted-foreground mt-1">Top 10% this month</p>
        </Card>
      </div>

      {/* In Progress Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCourses.map(({ course, progress }) => {
            if (!course) return null
            return (
              <Card
                key={course.id}
                className="overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row hover:border-indigo-500/40 transition-all"
              >
                <div className="relative h-44 sm:h-auto sm:w-48 bg-muted shrink-0">
                  <Image
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                        {course.level}
                      </Badge>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {progress}% done
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      Instructor: {course.instructor_name}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Progress value={progress} className="h-1.5 bg-muted" />

                    <Link href={`/courses/${course.slug}/learn`} className="block">
                      <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">
                        <Play className="size-3.5 mr-1.5 fill-white" />
                        Resume Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
