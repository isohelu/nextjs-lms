'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Clock,
  Calendar,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BlogPost {
  id: number
  title: string
  slug: string
  category: string
  author: string
  views: number
  publishedAt: string
  status: 'Published' | 'Draft'
}

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Modern Web Architecture with Next.js 15 App Router & Server Actions',
    slug: 'modern-web-architecture-nextjs-15',
    category: 'Engineering',
    author: 'David Miller',
    views: 4820,
    publishedAt: 'September 19, 2025',
    status: 'Published',
  },
  {
    id: 2,
    title: 'Mastering AI Agent Workflows & Autonomous Multi-Agent Reasoning',
    slug: 'mastering-ai-agent-workflows',
    category: 'Artificial Intelligence',
    author: 'Elena Rostova',
    views: 3140,
    publishedAt: 'September 15, 2025',
    status: 'Published',
  },
  {
    id: 3,
    title: 'Defensive Security: Nonce-Based CSP and OWASP Guidelines for Next.js',
    slug: 'defensive-security-nonce-csp',
    category: 'Security',
    author: 'Alexander Wright',
    views: 2280,
    publishedAt: 'September 10, 2025',
    status: 'Published',
  }
]

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch('/api/blogs')
        if (res.ok) {
          const json = await res.json()
          const list = json.blogs || json.posts || json.data
          if (Array.isArray(list) && list.length > 0) {
            const mapped: BlogPost[] = list.map((b: any, idx: number) => ({
              id: b.id || idx + 1,
              title: b.title || b.name,
              slug: b.slug || '',
              category: b.category?.name || b.category || 'General',
              author: b.author?.name || b.author || 'Instructor',
              views: b.views || b.view_count || 120,
              publishedAt: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent',
              status: b.status === 1 || b.status === 'published' ? 'Published' : 'Draft',
            }))
            setPosts(mapped)
          }
        }
      } catch (err) {
        console.error('Failed to load blogs from API:', err)
      }
    }
    loadBlogs()
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setPosts(prev => prev.filter(p => p.id !== id))
    }
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Admin Portal</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-semibold">Blog Management</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Editorial Blog Manager</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish technical tutorials, platform updates, and manage editorial categories.
            </p>
          </div>

          <Button asChild size="sm" className="font-bold gap-2 shadow-sm self-start sm:self-auto">
            <Link href="/blogs">
              <Eye className="h-4 w-4" />
              View Public Blog
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto text-xs font-semibold">
          <Link href="/dashboard" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Overview</Link>
          <Link href="/dashboard/users" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Users & Roles</Link>
          <Link href="/dashboard/instructors/applications" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Instructor Applications</Link>
          <Link href="/dashboard/billings/payment" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Gateways</Link>
          <Link href="/dashboard/billings/payment-reports/offline" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Offline Bank Wire</Link>
          <Link href="/dashboard/billings/payouts/request" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Payouts Ledger</Link>
          <Link href="/dashboard/blogs" className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5">Blog Articles</Link>
          <Link href="/dashboard/store/categories" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Digital Store</Link>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Table */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Article Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-foreground line-clamp-1">{p.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/blogs/{p.slug}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-foreground">
                      {p.author}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {p.views.toLocaleString()} reads
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {p.publishedAt}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-xs">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0" title="View Public Post">
                          <Link href={`/blogs/${p.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
