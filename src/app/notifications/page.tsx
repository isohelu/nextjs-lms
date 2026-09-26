'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  BookOpen,
  Award,
  CreditCard,
  MessageSquare,
  ChevronRight,
  CheckCheck,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface NotificationItem {
  id: string
  title: string
  body: string
  category: 'enrollment' | 'exam' | 'billing' | 'system'
  createdAt: string
  isRead: boolean
  actionUrl?: string
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Your Exam Result is Ready: Advanced React & Next.js 15',
    body: 'Congratulations! You scored 86.6% on your recent assessment and qualified for your official verified certificate.',
    category: 'exam',
    createdAt: '15 minutes ago',
    isRead: false,
    actionUrl: '/student/exams/1/result',
  },
  {
    id: 'notif-2',
    title: 'Course Enrolled: The Complete 2025 Web Development Bootcamp',
    body: 'Welcome aboard! Your course access is activated. Start learning Chapter 1 whenever you are ready.',
    category: 'enrollment',
    createdAt: '2 hours ago',
    isRead: false,
    actionUrl: '/courses/complete-web-development-bootcamp-2025/learn',
  },
  {
    id: 'notif-3',
    title: 'Payment Confirmed: Order #ORD-2025-9842',
    body: 'Your payment was successfully settled via Stripe. You can view or print your tax invoice receipt anytime.',
    category: 'billing',
    createdAt: '1 day ago',
    isRead: true,
    actionUrl: '/orders/ORD-2025-9842',
  },
  {
    id: 'notif-4',
    title: 'Instructor Notice: Scheduled Live Architecture Webinar',
    body: 'Instructor David Miller has scheduled a live Zoom QA on Cloud Resiliency for this Friday at 4:00 PM UTC.',
    category: 'system',
    createdAt: '3 days ago',
    isRead: true,
    actionUrl: '/student/live-classes',
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  React.useEffect(() => {
    fetch('/api/notifications?limit=30')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          const mapped = data.notifications.map((n: any) => {
            let parsedData: any = {}
            try {
              parsedData = typeof n.data === 'string' ? JSON.parse(n.data) : n.data || {}
            } catch {}

            return {
              id: String(n.id),
              title: parsedData.title || n.title || 'System Notification',
              body: parsedData.message || n.message || 'You have an update regarding your course learning activity.',
              category: (n.type?.includes('exam') ? 'exam' : n.type?.includes('payment') ? 'billing' : 'enrollment') as any,
              createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recently',
              isRead: Boolean(n.read_at),
              actionUrl: parsedData.actionUrl || '/student',
            }
          })
          setNotifications(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await fetch('/api/notifications', { method: 'PUT' })
    } catch {}
  }

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    } catch {}
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'exam':
        return <Award className="h-5 w-5 text-amber-500" />
      case 'enrollment':
        return <BookOpen className="h-5 w-5 text-primary" />
      case 'billing':
        return <CreditCard className="h-5 w-5 text-emerald-500" />
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-indigo-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <section className="border-b border-border bg-muted/40 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/student" className="hover:text-foreground">Student Portal</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">Notifications</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Notifications Inbox
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {unreadCount} Unread
                  </Badge>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay updated with course submissions, exam grades, receipts, and platform announcements.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="self-start sm:self-auto text-xs border-border"
              >
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <div className="container mx-auto px-4 max-w-3xl mt-8">
        <Card className="p-0 overflow-hidden rounded-2xl border bg-card shadow-sm divide-y divide-border">
          {filtered.length > 0 ? (
            filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={cn(
                  'p-5 transition-colors flex items-start gap-4 hover:bg-muted/30 cursor-pointer',
                  !notif.isRead && 'bg-primary/3'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                      'text-sm font-bold text-foreground',
                      !notif.isRead && 'text-primary'
                    )}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.createdAt}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {notif.body}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {notif.category}
                    </span>

                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        Open context
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {!notif.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" title="Unread" />
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No notifications to display</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
