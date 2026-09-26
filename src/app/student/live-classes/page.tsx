'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, Calendar, Clock, ArrowLeft, ExternalLink, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StudentLiveClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLiveClasses() {
      try {
        setLoading(true)
        const res = await fetch('/api/student/live-classes')
        if (res.ok) {
          const data = await res.json()
          if (data.classes) {
            setClasses(data.classes)
          }
        }
      } catch (err) {
        console.error('Error loading live classes:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLiveClasses()
  }, [])

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <Link href="/student" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Webinars & Classes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Interactive live broadcasts, code reviews, and guest lecture sessions.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8 space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading scheduled live sessions...</p>
          </div>
        ) : classes.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">No Live Classes Scheduled</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">You have no upcoming live sessions in your enrolled courses.</p>
            <Button asChild size="sm">
              <Link href="/courses/all">Explore Courses</Link>
            </Button>
          </Card>
        ) : (
          classes.map((item) => (
            <Card key={item.id} className="p-6 border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {item.courseTitle}
                  </Badge>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                    {item.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Instructor: <strong>{item.instructor}</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{item.title}</h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.time}</span>
                  </div>
                </div>

                {item.note && (
                  <p className="text-xs text-muted-foreground pt-1">{item.note}</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button size="sm" asChild className="font-semibold text-xs h-8">
                  <a href={item.joinUrl} target="_blank" rel="noopener noreferrer">
                    <Video className="h-3.5 w-3.5 mr-1.5" />
                    Join Live Class
                  </a>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
