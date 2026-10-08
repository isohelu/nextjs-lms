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
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Eye, Pencil, MoreVertical, Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageItem {
  id: number
  title: string
  slug: string
  type: 'home' | 'inner'
  status?: boolean
}

const DEFAULT_HOME_PAGES: PageItem[] = [
  { id: 1, title: 'Home 1', slug: 'home-1', type: 'home', status: true },
  { id: 2, title: 'Home 2', slug: 'home-2', type: 'home', status: false },
  { id: 3, title: 'Home 3', slug: 'home-3', type: 'home', status: false },
  { id: 5, title: 'Home 5', slug: 'home-5', type: 'home', status: false },
]

const DEFAULT_INNER_PAGES: PageItem[] = [
  { id: 6, title: 'About Us', slug: 'about-us', type: 'inner' },
  { id: 7, title: 'Contact Us', slug: 'contact-us', type: 'inner' },
  { id: 8, title: 'Our Team', slug: 'our-team', type: 'inner' },
  { id: 9, title: 'Terms and Conditions', slug: 'terms-and-conditions', type: 'inner' },
  { id: 10, title: 'Privacy Policy', slug: 'privacy-policy', type: 'inner' },
  { id: 11, title: 'Refund Policy', slug: 'refund-policy', type: 'inner' },
]

export default function DashboardFrontendPagesPage() {
  const [homePages, setHomePages] = useState<PageItem[]>(DEFAULT_HOME_PAGES)
  const [innerPages, setInnerPages] = useState<PageItem[]>(DEFAULT_INNER_PAGES)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // System Mode State
  const [systemModeModal, setSystemModeModal] = useState(false)
  const [systemMode, setSystemMode] = useState('collaborative')
  const [selectedSystemMode, setSelectedSystemMode] = useState('collaborative')

  // Page Editor State
  const [pageEditorModal, setPageEditorModal] = useState(false)
  const [pageEditorEnabled, setPageEditorEnabled] = useState(true)

  // Create Page State
  const [createPageModal, setCreatePageModal] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageDescription, setNewPageDescription] = useState('')
  const [newPageUrl, setNewPageUrl] = useState('')
  const [newPageType, setNewPageType] = useState<'home' | 'inner'>('inner')
  const [isCreating, setIsCreating] = useState(false)

  // Load from database if available
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/settings/pages')
        if (res.ok) {
          const data = await res.json()
          if (data.pages) {
            const activeSlug = data.home?.page_slug || 'home-1'
            const homes: PageItem[] = data.pages
              .filter((p: any) => p.type !== 'inner_page')
              .map((p: any) => ({
                id: p.id,
                title: p.title.replace('Mentor LMS - ', '').replace('Home Page ', 'Home '),
                slug: p.slug,
                type: 'home' as const,
                status: p.slug === activeSlug,
              }))
            if (homes.length > 0) setHomePages(homes)

            const inners: PageItem[] = data.pages
              .filter((p: any) => p.type === 'inner_page')
              .map((p: any) => ({
                id: p.id,
                title: p.title.split(' - ')[0],
                slug: p.slug,
                type: 'inner' as const,
              }))
            if (inners.length > 0) setInnerPages(inners)
          }
        }
      } catch (err) {
        console.error('Error fetching frontend pages:', err)
      }
    }
    loadData()
  }, [])

  const handleActivateHome = async (page: PageItem) => {
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
      if (res.ok) {
        setHomePages(prev =>
          prev.map(p => ({ ...p, status: p.id === page.id }))
        )
        setSuccessMessage(`Homepage changed to "${page.title}".`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch {
      alert('Failed to activate homepage.')
    }
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle.trim() || !newPageUrl.trim()) return
    setIsCreating(true)

    const cleanSlug = newPageUrl.replace(/^\//, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    try {
      const res = await fetch('/api/admin/settings/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_custom_page',
          title: newPageTitle.trim(),
          slug: cleanSlug,
          content: newPageDescription.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const newPage: PageItem = {
          id: Date.now(),
          title: newPageTitle.trim(),
          slug: cleanSlug,
          type: newPageType,
          status: false,
        }

        if (newPageType === 'home') {
          setHomePages(prev => [...prev, newPage])
        } else {
          setInnerPages(prev => [...prev, newPage])
        }

        setSuccessMessage(`Page "${newPageTitle}" created and saved successfully.`)
        setTimeout(() => setSuccessMessage(null), 3000)
        setNewPageTitle('')
        setNewPageDescription('')
        setNewPageUrl('')
        setCreatePageModal(false)
      } else {
        alert(data.message || 'Failed to create page')
      }
    } catch {
      alert('Error creating page')
    } finally {
      setIsCreating(false)
    }
  }

  const handleConfirmSystemMode = () => {
    setSystemMode(selectedSystemMode)
    setSystemModeModal(false)
    setSuccessMessage(`System mode updated to "${selectedSystemMode}".`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleTogglePageEditor = () => {
    setPageEditorEnabled(prev => !prev)
    setPageEditorModal(false)
    setSuccessMessage(`Page editor ${!pageEditorEnabled ? 'enabled' : 'disabled'}.`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const disableWarning =
    'When disable this then the website frontend system will back to the previous system where able to customize the frontend from the home page directly. Are you sure you want to disable frontend page editor?'
  const enableWarning =
    'Enabling frontend page editor will allow you to edit the frontend of your website by the nocode editor. After enabling this, your current frontend system will be disabled. Are you sure you want to enable frontend page editor?'

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Top Breadcrumb & Action Bar */}
        <Breadcrumbs
          title="Pages"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Frontend Pages' },
          ]}
          action={
            <div className="flex items-center gap-3">
              {/* System Mode Selector */}
              <Select
                value={systemMode}
                onValueChange={(value) => {
                  setSelectedSystemMode(value)
                  setSystemModeModal(true)
                }}
              >
                <SelectTrigger className="w-36 h-9 cursor-pointer bg-white text-xs font-medium">
                  <SelectValue placeholder="System Mode" />
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

              {/* Page Editor Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageEditorModal(true)}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                {pageEditorEnabled ? 'Disable' : 'Enable'} Page Editor
              </Button>
            </div>
          }
          className="mb-4"
        />

        {/* System Mode Confirmation Modal */}
        <Dialog open={systemModeModal} onOpenChange={setSystemModeModal}>
          <DialogContent className="px-6 py-6 sm:max-w-[425px]">
            <DialogTitle className="text-base font-semibold">Change System Mode</DialogTitle>
            <div className="rounded-xl bg-destructive/10 p-4 mt-2">
              <p className="text-center text-xs text-destructive leading-relaxed">
                Warning: Changing the system mode may alter permissions and features available to instructors and administrators.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSystemModeModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSystemMode}
                className="bg-primary hover:bg-primary/90 text-xs"
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Page Editor Confirmation Modal */}
        <Dialog open={pageEditorModal} onOpenChange={setPageEditorModal}>
          <DialogContent className="px-6 py-6 sm:max-w-[440px]">
            <DialogTitle className="text-base font-semibold">
              {pageEditorEnabled ? 'Disable' : 'Enable'} Page Editor
            </DialogTitle>
            <div
              className={`rounded-xl p-4 mt-2 ${
                pageEditorEnabled ? 'bg-destructive/10' : 'bg-blue-500/10'
              }`}
            >
              <p
                className={`text-xs leading-relaxed ${
                  pageEditorEnabled ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {pageEditorEnabled ? disableWarning : enableWarning}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageEditorModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className={`text-xs ${
                  pageEditorEnabled
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={handleTogglePageEditor}
              >
                {pageEditorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {successMessage && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section Header */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Pages</h2>
              <p className="text-sm text-muted-foreground">
                Manage your project pages
              </p>
            </div>

            {/* Create Page Modal */}
            <Dialog open={createPageModal} onOpenChange={setCreatePageModal}>
              <DialogTrigger asChild>
                <Button className="h-9 px-3 text-xs font-medium cursor-pointer gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Create Page</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl p-6">
                <DialogTitle className="text-lg font-semibold">Create New Page</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add a new page to your project
                </DialogDescription>
                <form onSubmit={handleCreatePage} className="space-y-4 mt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="page-title" className="text-xs font-medium">Page Title</Label>
                    <Input
                      id="page-title"
                      value={newPageTitle}
                      onChange={(e) => {
                        setNewPageTitle(e.target.value)
                        if (!newPageUrl) {
                          setNewPageUrl(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                        }
                      }}
                      required
                      placeholder="Enter page title (e.g., Home, About, Contact)"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="page-desc" className="text-xs font-medium">Description (Optional)</Label>
                    <Textarea
                      id="page-desc"
                      value={newPageDescription}
                      onChange={(e) => setNewPageDescription(e.target.value)}
                      rows={3}
                      placeholder="Brief description of this page"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="page-url" className="text-xs font-medium">URL</Label>
                    <Input
                      id="page-url"
                      value={newPageUrl}
                      onChange={(e) => setNewPageUrl(e.target.value)}
                      required
                      placeholder="Enter page URL (e.g., custom-page)"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-medium">Page Type</Label>
                    <Select
                      value={newPageType}
                      onValueChange={(val: 'home' | 'inner') => setNewPageType(val)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home" className="text-sm">Home</SelectItem>
                        <SelectItem value="inner" className="text-sm">Inner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreatePageModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isCreating}
                      className="text-xs"
                    >
                      {isCreating ? 'Creating...' : 'Create Page'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Home Pages */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">Home Pages</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {homePages.map((page) => (
                <Card
                  key={page.id}
                  className={cn(
                    'flex flex-row items-center justify-between border bg-white p-5 transition-all shadow-xs rounded-xl',
                    page.status && '!border-foreground outline outline-foreground ring-1 ring-foreground'
                  )}
                >
                  <div className="flex items-center justify-start gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {page.title}
                    </h3>
                    {page.status && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {!page.status && (
                        <DropdownMenuItem
                          onClick={() => handleActivateHome(page)}
                          className="cursor-pointer gap-2 text-xs font-medium"
                        >
                          <Check className="h-3.5 w-3.5 text-primary" />
                          <span>Activate</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs font-medium">
                        <Link href={`/?preset=${page.slug}`} target="_blank">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs font-medium">
                        <Link href={`/dashboard/settings/system`}>
                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              ))}
            </div>
          </div>

          {/* Inner Pages */}
          <div className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-foreground">Inner Pages</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {innerPages.map((page) => (
                <Card
                  key={page.id}
                  className="flex flex-row items-center justify-between border bg-white p-5 transition-all shadow-xs rounded-xl"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {page.title}
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs font-medium">
                        <Link href={`/${page.slug}`} target="_blank">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs font-medium">
                        <Link href={`/dashboard/settings/system`}>
                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

