'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Newspaper,
  Plus,
  Send,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  Mail,
  Loader2,
  Calendar
} from 'lucide-react'

interface Newsletter {
  id: number
  subject: string
  description: string
  created_at: string
}

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

  // Form State
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [sendNow, setSendNow] = useState(false)

  const loadNewsletters = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/newsletters')
      if (res.ok) {
        const data = await res.json()
        if (data.newsletters) setNewsletters(data.newsletters)
        if (data.subscriberCount !== undefined) setSubscriberCount(data.subscriberCount)
      }
    } catch (err) {
      console.error('Error fetching newsletters:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNewsletters()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          send_now: sendNow
        })
      })
      if (res.ok) {
        setCreateOpen(false)
        setSubject('')
        setDescription('')
        setSendNow(false)
        loadNewsletters()
        if (sendNow) {
          setSendSuccess('Newsletter created and dispatched to all subscribers!')
          setTimeout(() => setSendSuccess(null), 4000)
        }
      }
    } catch (err) {
      console.error('Error creating newsletter:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendCampaign = async (id: number) => {
    setSendingId(id)
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_now: true })
      })
      if (res.ok) {
        setSendSuccess(`Campaign #${id} dispatched successfully to ${subscriberCount} subscribers!`)
        setTimeout(() => setSendSuccess(null), 4000)
      }
    } catch (err) {
      console.error('Error dispatching newsletter:', err)
    } finally {
      setSendingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setNewsletters(prev => prev.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error('Error deleting newsletter:', err)
    }
  }

  const filtered = newsletters.filter(n =>
    n.subject.toLowerCase().includes(search.toLowerCase()) ||
    n.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <Breadcrumbs
          title="Newsletters"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Newsletters' },
          ]}
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Newsletter</span>
            </Button>
          }
          className="mb-4"
        />

        {sendSuccess && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{sendSuccess}</span>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 rounded-2xl border border-border/70 bg-white flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Email Subscribers</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{subscriberCount}</h3>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-border/70 bg-white flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Campaigns Broadcasted</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{newsletters.length}</h3>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#007867]/10 flex items-center justify-center text-[#007867]">
              <Mail className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search newsletters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-white rounded-xl"
            />
          </div>
        </div>

        {/* Newsletters List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl border-dashed bg-white">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">No newsletters found</h3>
            <p className="text-xs text-muted-foreground mb-4">Start your audience engagement by composing a new newsletter.</p>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-[#007867] hover:bg-[#007867]/90 text-white">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Newsletter
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="p-5 rounded-2xl border border-border/80 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">#{item.id}</span>
                    <h3 className="font-bold text-sm text-foreground truncate">{item.subject}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sendingId === item.id}
                    onClick={() => handleSendCampaign(item.id)}
                    className="h-8 text-xs font-medium text-slate-700 hover:text-[#007867] hover:border-[#007867]/40 gap-1.5 rounded-lg"
                  >
                    {sendingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>Broadcast</span>
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Newsletter Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add Newsletter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold">Subject</Label>
                <Input
                  required
                  placeholder="e.g. Exciting New Courses Added this Month!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Message Description</Label>
                <Textarea
                  required
                  rows={5}
                  placeholder="Write the full newsletter text or HTML announcement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendNow"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#007867] focus:ring-[#007867]"
                />
                <label htmlFor="sendNow" className="text-xs text-foreground font-medium cursor-pointer">
                  Send immediately to all subscribers ({subscriberCount}) upon saving
                </label>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-[#007867] hover:bg-[#007867]/90 text-white"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Newsletter'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
