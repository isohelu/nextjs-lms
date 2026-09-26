'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  HelpCircle,
  Award,
  Star,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Share2,
  Users,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { EXAMS_DATA } from '@/lib/data/exams'
import { useUserStore } from '@/lib/store/useUserStore'
import { cn } from '@/lib/utils'

export default function ExamDetailContent({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'instructor' | 'reviews'>('overview')
  const { addItem, openCart } = useCartStore()
  const { isExamEnrolled, enrollExam, toggleExamWishlist, isExamWishlisted } = useUserStore()

  // Find exam or fallback to primary demo
  const [exam, setExam] = useState(() => EXAMS_DATA.find((e) => e.slug === slug) || EXAMS_DATA[0])

  React.useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch('/api/exams?limit=50')
        if (res.ok) {
          const data = await res.json()
          const found = (data.exams || []).find((e: any) => e.slug === slug || String(e.id) === slug)
          if (found) {
            setExam((prev) => ({ ...prev, ...found }))
          }
        }
      } catch {}
    }
    fetchExam()
  }, [slug])

  const examIdNum = typeof exam.id === 'string' ? parseInt(exam.id, 10) : exam.id
  const isFree = exam.pricing_type === 'free' || (exam.price ?? 0) === 0
  const isEnrolled = isExamEnrolled(examIdNum)
  const isWishlisted = isExamWishlisted(examIdNum)

  const handleEnrollExam = async () => {
    if (!isFree) {
      handleAddToCart()
      return
    }

    try {
      const res = await fetch('/api/student/enrollments/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examIdNum }),
      })

      if (res.status === 401) {
        window.location.assign(`/login?redirect=/exams/${slug}`)
        return
      }

      const data = await res.json()
      if (data.success) {
        enrollExam(examIdNum)
      }
    } catch {
      enrollExam(examIdNum)
    }
  }

  const handleAddToCart = () => {
    addItem({
      id: `exam-${exam.id}`,
      title: exam.title,
      slug: exam.slug,
      thumbnail:
        exam.thumbnail ||
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      price: isFree ? 0 : (exam.discount_price ?? exam.price ?? 0),
      discount_price: exam.discount_price,
      type: 'exam',
      instructor_name: exam.instructor_name,
    })
    openCart()
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <section className="border-b border-border bg-muted/40 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/exams/all" className="hover:text-foreground">
              Exams
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-xs">{exam.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs">
                  {exam.category_name}
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {exam.level} Level
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Verified Exam
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {exam.title}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {exam.short_description ||
                  'Prepare with realistic practice questions, in-depth architectural explanations, and comprehensive simulated exams.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{exam.average_rating}</span>
                  <span>({exam.reviews_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>1,420 candidates enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{exam.duration_minutes} Minutes Duration</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground">
                Created by <span className="font-semibold text-foreground">{exam.instructor_name}</span>
              </div>
            </div>

            {/* Sidebar Sticky Card */}
            <div className="lg:col-span-4">
              <Card className="p-6 border-border shadow-card space-y-6">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                  <img
                    src={
                      exam.thumbnail ||
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={exam.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex items-baseline gap-3">
                  {isFree ? (
                    <span className="text-3xl font-extrabold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-foreground">
                        ${exam.discount_price ?? exam.price}
                      </span>
                      {exam.discount_price && (
                        <span className="text-base text-muted-foreground line-through">
                          ${exam.price}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* User-Wise Conditional Actions matching Laravel */}
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <Award className="mx-auto mb-2 h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        You&apos;re enrolled!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlimited practice attempts and verified certificate unlocked.
                      </p>
                    </div>
                    <Button asChild size="lg" className="w-full font-bold">
                      <Link href={`/student/exams/${exam.id}`}>
                        View Exam & Practice
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full font-bold cursor-pointer"
                      onClick={handleEnrollExam}
                    >
                      {isFree ? 'Enroll Now (Free)' : 'Buy Now'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full font-medium cursor-pointer"
                      onClick={() => toggleExamWishlist(examIdNum)}
                    >
                      <Heart
                        className={cn(
                          'h-4 w-4 mr-2 transition-colors',
                          isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                        )}
                      />
                      {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </Button>
                  </div>
                )}

                <div className="space-y-3 text-xs text-muted-foreground pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span>Total Questions</span>
                    <span className="font-semibold text-foreground">{exam.total_questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score</span>
                    <span className="font-semibold text-foreground">{exam.pass_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit</span>
                    <span className="font-semibold text-foreground">{exam.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retakes Allowed</span>
                    <span className="font-semibold text-foreground">Unlimited</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate</span>
                    <span className="font-semibold text-foreground">Verifiable Badge</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Details */}
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="border-b border-border">
              <div className="flex gap-8 text-sm font-medium">
                {(['overview', 'syllabus', 'instructor', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <h3 className="text-xl font-bold text-foreground">About This Assessment</h3>
                <p>
                  This comprehensive examination assesses real-world problem-solving abilities,
                  production patterns, and domain mastery required by top tech organizations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {[
                    'Dynamic randomized question order',
                    'Comprehensive explanation for each response',
                    'Domain-by-domain knowledge analysis',
                    'Accredited certification on completion',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Knowledge Domains & Topics</h3>
                <div className="rounded-xl border divide-y divide-border">
                  <div className="p-4">
                    <h4 className="font-bold text-foreground text-sm">
                      Domain 1: Core Fundamentals & Protocols (30%)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Architecture models, request lifecycles, and core primitives.
                    </p>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-foreground text-sm">
                      Domain 2: Performance, Scalability & Storage (35%)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Query optimization, caching, distributed locks, and state management.
                    </p>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-foreground text-sm">
                      Domain 3: Security & Cryptography (35%)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      OWASP defense, nonce-based CSP, token authentication, and data isolation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Lead Examiner</h3>
                <Card className="p-6 border-border flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl shrink-0">
                    {exam.instructor_name?.charAt(0) || 'I'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-base">{exam.instructor_name}</h4>
                    <p className="text-xs text-primary font-medium">Senior Examination Fellow</p>
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      Industry veteran with over 12 years of specialized architectural experience
                      assessing enterprise software engineering candidates.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Candidate Reviews</h3>
                <div className="space-y-3">
                  <Card className="p-4 border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">James K.</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The questions were exceptionally rigorous and accurately reflected real
                      production incidents. Passed my official certification on the first attempt!
                    </p>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
