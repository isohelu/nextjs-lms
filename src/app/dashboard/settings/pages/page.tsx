'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import LoadingButton from '@/components/loading-button'
import { CheckCircle2, ExternalLink, Plus, Trash2, Edit, FileText, Layout, AlertTriangle } from 'lucide-react'

interface PageRecord {
  id: number
  title: string
  slug: string
  type: string
  created_at?: string
  updated_at?: string
}

export default function PagesSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<PageRecord[]>([])
  const [homeSetting, setHomeSetting] = useState<{ page_slug: string; page_name: string }>({
    page_slug: 'home-1',
    page_name: 'Mentor LMS - Home Page 1',
  })
  const [systemType, setSystemType] = useState('collaborative')
  const [pendingSystemType, setPendingSystemType] = useState<string | null>(null)
  const [systemTypeModal, setSystemTypeModal] = useState(false)
  const [switchingType, setSwitchingType] = useState(false)

  // Custom page creation modal
  const [createModal, setCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load pages
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/pages')
      if (res.ok) {
        const data = await res.json()
        if (data.pages) setPages(data.pages)
        if (data.home) setHomeSetting(data.home)
        if (data.systemType) setSystemType(data.systemType)
      }
    } catch (err) {
      console.error('Error fetching pages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Home Page Selection
  const handleSelectHome = async (page: PageRecord) => {
    try {
      const res = await fetch('/api/admin/settings/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'select_home',
          slug: page.slug,
          name: page.title,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setHomeSetting({ page_slug: page.slug, page_name: page.title })
        setSuccessMessage(`Homepage updated to "${page.title}".`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch {
      alert('Failed to update homepage preset.')
    }
  }

  // Handle System Type Confirmation
  const handleConfirmSystemType = async () => {
    if (!pendingSystemType) return
    setSwitchingType(true)
    try {
      const res = await fetch('/api/admin/settings/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_system_type',
          sub_type: pendingSystemType,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSystemType(pendingSystemType)
        setSystemTypeModal(false)
        setPendingSystemType(null)
        setSuccessMessage(`System platform type changed to ${pendingSystemType}.`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch {
      alert('Failed to update system platform type.')
    } finally {
      setSwitchingType(false)
    }
  }

  // Handle Custom Page Creation
  const handleCreateCustomPage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newSlug.trim()) return
    setCreating(true)

    try {
      const res = await fetch('/api/admin/settings/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_custom_page',
          title: newTitle.trim(),
          slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreateModal(false)
        setNewTitle('')
        setNewSlug('')
        setSuccessMessage('Custom page created successfully.')
        setTimeout(() => setSuccessMessage(null), 3000)
        loadData()
      } else {
        alert(data.message || 'Failed to create page.')
      }
    } catch {
      alert('Error creating custom page.')
    } finally {
      setCreating(false)
    }
  }

  // Handle Page Deletion
  const handleDeletePage = async (page: PageRecord) => {
    if (!confirm(`Are you sure you want to delete the custom page "${page.title}"?`)) return

    try {
      const res = await fetch(`/api/admin/settings/pages?id=${page.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Page deleted successfully.')
        setTimeout(() => setSuccessMessage(null), 3000)
        loadData()
      }
    } catch {
      alert('Error deleting page.')
    }
  }

  const homePages = pages.filter((p) => p.type !== 'inner_page')
  const customPages = pages.filter((p) => p.type === 'inner_page')

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <Breadcrumbs
          title="Page Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Page Settings' },
          ]}
          className="mb-4"
        />

        {successMessage && (
          <div className="md:px-3">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <div className="mx-auto space-y-10 md:px-3">
          {/* AVAILABLE HOME PAGES CARD */}
          <Card>
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/60">
              <div>
                <h2 className="text-lg font-medium text-foreground">Available Home Pages</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select the home page layout for your website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="system-type" className="text-xs font-medium">Type:</Label>
                <Select
                  value={systemType}
                  onValueChange={(value) => {
                    if (value !== systemType) {
                      setPendingSystemType(value)
                      setSystemTypeModal(true)
                    }
                  }}
                >
                  <SelectTrigger className="cursor-pointer text-xs h-9 w-[150px]">
                    <SelectValue placeholder="System Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborative" className="cursor-pointer text-xs">
                      Collaborative
                    </SelectItem>
                    <SelectItem value="administrative" className="cursor-pointer text-xs">
                      Administrative
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homePages.map((page) => {
                  const isActive = page.slug === homeSetting.page_slug
                  return (
                    <TableRow key={page.id} className={isActive ? 'bg-[#D8FC38]/10' : ''}>
                      <TableCell className="font-mono text-xs">{page.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-border flex items-center justify-center text-foreground">
                            <Layout className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium text-xs text-foreground block">{page.title}</span>
                            <span className="text-xs text-muted-foreground capitalize font-mono">{page.type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Link
                          href={`/?preset=${page.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-foreground font-semibold hover:underline"
                        >
                          <span>Preview</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {isActive ? (
                          <Badge className="bg-[#D8FC38] text-slate-950 font-bold text-xs">Active</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectHome(page)}
                            className="text-xs h-8 px-3 rounded-lg cursor-pointer"
                          >
                            Set As Home
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {/* CUSTOM PAGES CARD */}
          <Card>
            <div className="flex flex-col items-start justify-between gap-4 p-4 md:p-6 border-b border-border/60 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-medium text-foreground">Custom Pages</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Page slug will be the page path. Example:{' '}
                  <span className="font-mono text-foreground font-semibold">
                    http://localhost:3000/cookie-policy
                  </span>
                </p>
              </div>

              <Button
                onClick={() => setCreateModal(true)}
                className="bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-bold text-xs sm:text-sm h-9 px-4 gap-2 rounded-xl shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Page</span>
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-mono text-xs">{page.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-xs text-foreground">{page.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">/{page.slug}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {page.created_at ? new Date(page.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePage(page)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* System Type Confirmation Dialog */}
        <Dialog open={systemTypeModal} onOpenChange={setSystemTypeModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Change System Type?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Switching platform archetype modifies course workflows, instructor revenue commissions, and public listings.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Are you sure you want to switch to <strong>{pendingSystemType}</strong> mode? This will affect global layout rendering.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSystemTypeModal(false)
                  setPendingSystemType(null)
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                size="sm"
                loading={switchingType}
                onClick={handleConfirmSystemType}
                className="bg-[#D8FC38] text-slate-950 font-bold hover:bg-[#CBF128] rounded-xl shadow-xs"
              >
                Confirm Switch
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add New Custom Page Dialog */}
        <Dialog open={createModal} onOpenChange={setCreateModal}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Add New Custom Page</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a standalone CMS inner page (e.g. Terms of Service, Privacy Policy, Press).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCustomPage} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold">Page Title *</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value)
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                    }
                  }}
                  placeholder="e.g. Partnership Program"
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Page Slug *</Label>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="e.g. partnership-program"
                  className="mt-1 text-xs font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL: http://localhost:3000/<span className="text-foreground font-semibold font-mono">{newSlug || 'your-slug'}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="sm"
                  type="submit"
                  loading={creating}
                  className="bg-[#D8FC38] text-slate-950 font-bold hover:bg-[#CBF128] rounded-xl shadow-xs"
                >
                  Create Page
                </LoadingButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
