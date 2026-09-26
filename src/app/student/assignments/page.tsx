'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2, Upload, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true)
        const res = await fetch('/api/student/assignments')
        if (res.ok) {
          const data = await res.json()
          if (data.assignments) {
            setAssignments(data.assignments)
          }
        }
      } catch (err) {
        console.error('Error loading assignments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAssignments()
  }, [])

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <Link href="/student" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course Assignments</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Submit homework, capstone lab projects, and review instructor grades.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8 space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading active course deliverables...</p>
          </div>
        ) : assignments.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No Assignments Assigned</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Enroll in courses with active lab assignments to submit deliverables.</p>
            <Button asChild size="sm">
              <Link href="/courses/all">Explore Catalog</Link>
            </Button>
          </Card>
        ) : (
          assignments.map((item) => (
            <Card key={item.id} className="p-6 border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {item.courseTitle}
                  </Badge>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'Graded'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : item.status === 'Submitted (Reviewing)'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {item.status === 'Graded' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {item.status === 'Submitted (Reviewing)' && <Clock className="h-3.5 w-3.5" />}
                    {item.status === 'Pending Submission' && <AlertCircle className="h-3.5 w-3.5" />}
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{item.assignmentTitle}</h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Due: {item.deadline}</span>
                  </div>
                  <span>•</span>
                  <span>Total Mark: {item.totalMark}</span>
                  {item.marksObtained !== null && item.marksObtained !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-foreground">Obtained: {item.score}</span>
                    </>
                  )}
                </div>

                {item.feedback && (
                  <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs mt-2">
                    <strong className="text-foreground block mb-0.5">Instructor Feedback:</strong>
                    <p className="text-muted-foreground">{item.feedback}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link href={`/student/courses/${item.courseId}`}>
                  <Button size="sm" variant="default" className="text-xs font-semibold">
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {item.status === 'Pending Submission' ? 'Submit Project' : 'View Submission'}
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
