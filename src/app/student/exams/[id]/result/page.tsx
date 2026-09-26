'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Share2,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ExamResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const examId = params?.id || '1'
  const attemptId = searchParams.get('attempt_id')

  const [score, setScore] = React.useState({
    totalMarks: 60,
    obtainedMarks: 52,
    percentage: 86.6,
    isPassed: true,
    passPercentage: 70,
    durationMinutes: 18,
    correctCount: 6,
    incorrectCount: 1,
    examTitle: 'Certification Exam',
  })

  React.useEffect(() => {
    async function loadResult() {
      if (!attemptId) return
      try {
        const res = await fetch(`/api/student/exams/${examId}/attempt/${attemptId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.result) {
            setScore(prev => ({
              ...prev,
              ...data.result,
              durationMinutes: 15,
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load attempt result:', err)
      }
    }
    loadResult()
  }, [examId, attemptId])

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        {/* Score Header Card */}
        <Card className="p-8 text-center border-border shadow-md space-y-6 bg-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
              PASSED • EXCELLENT PERFORMANCE
            </span>
            <h1 className="text-3xl font-extrabold text-foreground">
              Examination Result Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Advanced React & Next.js 15 Certification Assessment #{examId}
            </p>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-border/80 py-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Score</p>
              <p className="text-2xl font-black text-foreground mt-1">{score.obtainedMarks} / {score.totalMarks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-black text-primary mt-1">{score.percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Taken</p>
              <p className="text-2xl font-black text-foreground mt-1">{score.durationMinutes}m 42s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">Qualified</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {score.isPassed && (
              <Button asChild className="w-full sm:w-auto rounded-xl font-bold gap-2 shadow-md bg-amber-600 hover:bg-amber-700 text-white">
                <Link href="/certificates/CERT-2025-98421">
                  <Award className="h-4 w-4" />
                  View Official Certificate
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
              <Link href={`/student/exams/${examId}`}>
                <RotateCcw className="h-4 w-4" />
                Retake Assessment
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto rounded-xl font-bold gap-2">
              <Link href="/student">
                Back to Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Question-by-Question Evaluation</h2>

          {/* Q1 */}
          <Card className="p-6 border-border space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">Question 1 (5 / 5 Marks)</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  In Next.js 15 App Router, what is the default rendering behavior of React components inside the app/ directory?
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">Your Answer (Correct):</p>
              <p className="text-muted-foreground">React Server Components rendered on the server with zero client JavaScript bundle impact.</p>
            </div>
          </Card>

          {/* Q2 */}
          <Card className="p-6 border-border space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">Question 2 (10 / 10 Marks)</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Select ALL valid HTTP response security headers recommended by OWASP for enterprise web applications:
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">Your Answer (Correct):</p>
              <p className="text-muted-foreground">CSP with nonces, HSTS with preload, X-Frame-Options, X-Content-Type-Options.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
