'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  ShoppingBag,
  HelpCircle,
  PlayCircle,
  Clock,
  ArrowRight,
  Download,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Sparkles,
  UserCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function StudentDashboardPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string; photo?: string } | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)

        // 1. User
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.user) setUser(meData.user)
        }

        // 2. Courses
        const cRes = await fetch('/api/student/courses')
        if (cRes.ok) {
          const cData = await cRes.json()
          if (cData.courses) setCourses(cData.courses)
        }

        // 3. Exams
        const eRes = await fetch('/api/student/exams')
        if (eRes.ok) {
          const eData = await eRes.json()
          if (eData.exams) setExams(eData.exams)
        }

        // 4. Purchases
        const pRes = await fetch('/api/student/purchases')
        if (pRes.ok) {
          const pData = await pRes.json()
          if (pData.purchases) setPurchases(pData.purchases)
        }

        // 5. Certificates
        const certRes = await fetch('/api/student/certificates')
        if (certRes.ok) {
          const certData = await certRes.json()
          if (certData.certificates) setCertificates(certData.certificates)
        }
      } catch (err) {
        console.error('Error loading student dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const completedCourses = courses.filter((c) => c.progress_percent === 100)
  const inProgressCourses = courses.filter((c) => c.progress_percent < 100)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#007867] to-[#0f4c3a] p-6 sm:p-8 text-white shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white/30 shadow-inner">
                <AvatarImage src={user?.photo || '/assets/avatars/avatar-1.png'} alt={user?.name || 'Student'} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                  {user?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome back, {user?.name || 'Learner'}!
                  </h1>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs">
                    Student Portal
                  </Badge>
                </div>
                <p className="text-white/80 text-xs sm:text-sm max-w-xl">
                  Track your course progress, upcoming assessments, and verifiable digital certificates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" size="sm" className="font-semibold text-xs h-9 bg-white text-[#007867] hover:bg-white/90">
                <Link href="/courses/all">
                  Browse Catalog
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-semibold text-xs h-9 border-white/40 text-white hover:bg-white/10">
                <Link href="/student/profile">
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/student/courses" className="group block">
            <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#007867]/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enrolled Courses</span>
                  <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#007867] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                <span className="font-semibold text-emerald-600">{completedCourses.length}</span> completed • <span className="font-semibold text-amber-600">{inProgressCourses.length}</span> in progress
              </p>
            </Card>
          </Link>

          <Link href="/student/exams" className="group block">
            <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#007867]/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cert Exams</span>
                  <p className="text-2xl font-bold text-foreground">{exams.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                {exams.filter((e) => e.total_attempts > 0).length} attempted assessments
              </p>
            </Card>
          </Link>

          <Link href="/student/certificates" className="group block">
            <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#007867]/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Certificates</span>
                  <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Verifiable digital credentials
              </p>
            </Card>
          </Link>

          <Link href="/student/products" className="group block">
            <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#007867]/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Store Orders</span>
                  <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Digital kits & code templates
              </p>
            </Card>
          </Link>
        </div>

        {/* In-Progress Courses & Quick Continue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column: Active Learning Courses */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>
                  <p className="text-xs text-muted-foreground">Pick up where you left off</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#007867]">
                  <Link href="/student/courses" className="flex items-center gap-1">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl">
                  <GraduationCap className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No enrolled courses</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Explore courses in the catalog to get started.</p>
                  <Button asChild size="sm">
                    <Link href="/courses/all">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&fit=crop'}
                          alt={c.title}
                          className="h-14 w-20 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <Link href={`/student/courses/${c.id}`} className="hover:text-[#007867] transition-colors">
                            <h3 className="text-sm font-bold text-foreground line-clamp-1">{c.title}</h3>
                          </Link>
                          <p className="text-[11px] text-muted-foreground">
                            {c.instructor_name} • {c.completed_lessons}/{c.total_lessons} lessons
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="w-28 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full bg-[#007867]"
                                style={{ width: `${c.progress_percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-foreground">{c.progress_percent}%</span>
                          </div>
                        </div>
                      </div>

                      <Button asChild size="sm" className="h-8 text-xs font-semibold self-end sm:self-center bg-[#007867] hover:bg-[#006052]">
                        <Link href={`/courses/${c.slug}/learn`}>
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />
                          {c.progress_percent === 100 ? 'Review' : 'Continue'}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Assessments Card */}
            <Card className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Recent Assessment Results</h2>
                  <p className="text-xs text-muted-foreground">Practice exams and certification scores</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#007867]">
                  <Link href="/student/exams" className="flex items-center gap-1">
                    All Exams <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {exams.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No assessment records found.</p>
              ) : (
                <div className="space-y-2.5">
                  {exams.slice(0, 3).map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{exam.title}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Pass Mark: {exam.pass_mark}% • Questions: {exam.total_questions}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.total_attempts > 0 ? (
                          <Badge className={exam.is_passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'}>
                            Score: {exam.best_marks} ({exam.is_passed ? 'Passed' : 'Failed'})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Not Taken
                          </Badge>
                        )}
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs px-2">
                          <Link href={`/student/exams/${exam.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar Column: Certificates & Quick Hub */}
          <div className="lg:col-span-4 space-y-6">
            {/* Earned Certificates */}
            <Card className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Earned Certificates</h2>
                  <p className="text-xs text-muted-foreground">Verified credentials</p>
                </div>
                <Award className="h-5 w-5 text-amber-500" />
              </div>

              {certificates.length === 0 ? (
                <div className="p-5 text-center border border-dashed rounded-xl">
                  <Award className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">No credentials yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Finish 100% of an enrolled course to receive a verifiable certificate.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-50/20 space-y-2"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{cert.course_title}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">{cert.identifier}</p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full h-7 text-[11px] font-semibold border-amber-300 text-amber-800 hover:bg-amber-100">
                        <Link href={cert.verify_url || `/certificates/${cert.identifier}`}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Verify Certificate
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Hub Links */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-1.5">
                <Link
                  href="/student/courses"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#007867]" /> My Courses
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{courses.length}</Badge>
                </Link>
                <Link
                  href="/student/exams"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" /> My Exams
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{exams.length}</Badge>
                </Link>
                <Link
                  href="/student/products"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-purple-600" /> Digital Store
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{purchases.length}</Badge>
                </Link>
                <Link
                  href="/student/become-instructor"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-medium text-[#007867] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Become an Instructor
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
