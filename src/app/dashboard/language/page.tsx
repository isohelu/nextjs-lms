'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import { Switch } from '@/components/ui/switch'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Languages as LangIcon,
  Check
} from 'lucide-react'

interface Language {
  id: number
  name: string
  code: string
  nativeName: string
  is_active: number | boolean
  is_default: number | boolean
}

export default function DashboardLanguagePage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [nativeName, setNativeName] = useState('')

  const fetchLanguages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/languages')
      if (res.ok) {
        const data = await res.json()
        if (data.languages) setLanguages(data.languages)
      }
    } catch (err) {
      console.error('Error fetching languages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()
  }, [])

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true })
      })
      if (res.ok) {
        fetchLanguages()
      }
    } catch (err) {
      console.error('Error setting default language:', err)
    }
  }

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive })
      })
      if (res.ok) {
        fetchLanguages()
      }
    } catch (err) {
      console.error('Error toggling language:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this language?')) return
    try {
      const res = await fetch(`/api/admin/languages/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchLanguages()
      } else {
        const err = await res.json()
        alert(err.message || 'Cannot delete this language')
      }
    } catch (err) {
      console.error('Error deleting language:', err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || !nativeName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code: code.toLowerCase(),
          nativeName,
          is_active: true,
          is_default: false
        })
      })
      if (res.ok) {
        setCreateOpen(false)
        setName('')
        setCode('')
        setNativeName('')
        fetchLanguages()
      }
    } catch (err) {
      console.error('Error adding language:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Breadcrumbs Header */}
        <Breadcrumbs
          title="Languages"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Languages' },
          ]}
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Language</span>
            </Button>
          }
          className="mb-4"
        />

        {/* Translation Scope Banner from Laravel */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-xs text-blue-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-blue-950">Translation Scope Information</h4>
            <ul className="list-disc space-y-1 pl-4 text-blue-800/90 leading-relaxed">
              <li>Translations will be applied across all dashboard interfaces (Admin, Instructor, and Student portals).</li>
              <li>Public marketing pages are not affected by these translations as they are customizable through the page layout builder.</li>
            </ul>
          </div>
        </div>

        {/* Language Cards List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="rounded-2xl border border-border/80 bg-white p-6 space-y-4 shadow-xs">
            <div className="space-y-3">
              {languages.map((lang) => {
                const isDefault = !!lang.is_default
                const isActive = !!lang.is_active
                return (
                  <div
                    key={lang.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isDefault
                        ? 'border-blue-200 bg-blue-50/30'
                        : 'border-border/70 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs uppercase">
                        {lang.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {lang.name} ({lang.nativeName})
                          </h4>
                          {isDefault && (
                            <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px]">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Locale Code: {lang.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(lang.id)}
                          className="h-8 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-300 rounded-lg"
                        >
                          Make Default
                        </Button>
                      )}

                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleActive(lang.id, isActive)}
                        className="cursor-pointer"
                      />

                      {!isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(lang.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Add Language Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add New Language</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold">Language Name</Label>
                <Input
                  required
                  placeholder="e.g. Spanish"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Language Code (ISO)</Label>
                <Input
                  required
                  placeholder="e.g. es"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Native Name</Label>
                <Input
                  required
                  placeholder="e.g. Español"
                  value={nativeName}
                  onChange={(e) => setNativeName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-[#007867] hover:bg-[#007867]/90 text-white"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add Language'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
