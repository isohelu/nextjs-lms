'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Bell,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ChevronRight,
  Award,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_NOTIFICATIONS } from '../page'

export default function NotificationDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const notification = MOCK_NOTIFICATIONS.find(n => n.id === id) || MOCK_NOTIFICATIONS[0]

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/notifications" className="hover:text-foreground">Notifications</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Message Detail</span>
        </div>

        <Card className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <Badge variant="secondary" className="text-xs font-semibold capitalize">
              {notification.category} Notification
            </Badge>
            <span className="text-xs text-muted-foreground">
              {notification.createdAt}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {notification.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {notification.body}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Notification ID: {notification.id}</p>
            <p>Dispatched by Mentor LMS Automated Delivery Engine</p>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto border-border">
              <Link href="/notifications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inbox
              </Link>
            </Button>

            {notification.actionUrl && (
              <Button size="sm" asChild className="w-full sm:w-auto font-semibold shadow-sm">
                <Link href={notification.actionUrl}>
                  Open Related Page
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
