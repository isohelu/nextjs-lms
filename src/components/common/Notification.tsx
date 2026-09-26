'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  data: {
    title?: string
    message?: string
  }
  read_at: string | null
  created_at: string
}

export default function Notification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch {
      // Not logged in or network failure
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const handleItemClick = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0"
          aria-label="View notifications"
        >
          <Bell className="h-5! w-5!" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-xs h-7 text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          <div className="flex flex-col py-1">
            {notifications.length > 0 ? (
              notifications.map(({ id, data, read_at }) => {
                const isUnread = !read_at
                return (
                  <Link
                    key={id}
                    href={`/notifications/${id}`}
                    onClick={() => {
                      if (isUnread) handleItemClick(id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex flex-col gap-1 px-4 py-2.5 transition-colors border-b border-border/40 last:border-0 hover:bg-accent/60',
                      isUnread && 'bg-primary/5 font-medium'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground leading-snug">
                        {data?.title || 'System Notification'}
                      </p>
                      {isUnread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                      )}
                    </div>
                    {data?.message && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {data.message}
                      </p>
                    )}
                  </Link>
                )
              })
            ) : (
              <p className="p-6 text-center text-xs text-muted-foreground">
                No notifications right now
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-2 bg-muted/20">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-center text-xs h-8 font-medium"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
