import { createClient } from '@/lib/supabase/server'
import { HeroAnimation } from '@/components/animations/HeroAnimation'
import { CourseCatalog } from '@/components/CourseCatalog'
import { Course, Category } from '@/types/database'
import { CheckCircle, ShieldCheck, Zap, Laptop, Award } from 'lucide-react'

// Force dynamic rendering so courses fetched from Supabase are always live
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch published courses with their category
  const { data: coursesData } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const courses: Course[] = coursesData || []
  const categories: Category[] = categoriesData || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* GSAP Hero Section */}
      <HeroAnimation />

      {/* Feature Value Props Banner */}
      <section className="py-8 border-b border-border/40 bg-accent/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Laptop className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Hands-On Labs</p>
                <p className="text-[11px] text-muted-foreground">Interactive code exercises</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Verified Mentors</p>
                <p className="text-[11px] text-muted-foreground">FAANG & Staff Architects</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Production Projects</p>
                <p className="text-[11px] text-muted-foreground">Real microservices & agents</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Industry Certificate</p>
                <p className="text-[11px] text-muted-foreground">Sharable credentials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <CourseCatalog initialCourses={courses} categories={categories} />

      {/* Testimonials / Student Outcomes Section */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Built for Ambitious Engineers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              See what engineers are saying after completing our enterprise deep-dive curriculums.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;The Next.js 15 & Supabase Enterprise course changed how my team builds production web apps. The depth of RSC streaming and RLS security is second to none.&quot;
              </p>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Sarah Jenkins</p>
                  <p className="text-[11px] text-muted-foreground">Staff Engineer at CloudScale</p>
                </div>
                <CheckCircle className="size-4 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;The Autonomous AI Agents track helped us prototype a multi-agent triage system for our customer engineering pipeline within 48 hours.&quot;
              </p>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Alexandre Monet</p>
                  <p className="text-[11px] text-muted-foreground">AI Tech Lead at Datablox</p>
                </div>
                <CheckCircle className="size-4 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;The GSAP animations module made our agency client presentations 10x more captivating. Smooth 60fps micro-interactions made all the difference.&quot;
              </p>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Michael Thorne</p>
                  <p className="text-[11px] text-muted-foreground">Creative Technologist</p>
                </div>
                <CheckCircle className="size-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
