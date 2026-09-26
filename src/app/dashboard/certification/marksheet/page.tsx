'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Loader2,
  TableProperties
} from 'lucide-react'

interface MarksheetTemplate {
  id: number
  name: string
  type: 'course' | 'exam'
  logo_path?: string | null
  is_active: number | boolean
  template_data: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    borderColor?: string
    headerText?: string
    institutionName?: string
    footerText?: string
    fontFamily?: string
  }
}

export default function MarksheetTemplatesPage() {
  const [templates, setTemplates] = useState<MarksheetTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState<'course' | 'exam'>('course')
  const [primaryColor, setPrimaryColor] = useState('#1e40af')
  const [headerText, setHeaderText] = useState('Official Academic Transcript')
  const [institutionName, setInstitutionName] = useState('Mentor Academy')

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/marksheets/templates')
      if (res.ok) {
        const data = await res.json()
        if (data.templates) {
          setTemplates(data.templates)
        }
      }
    } catch (err) {
      console.error('Error fetching marksheet templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/marksheets/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      })
      if (res.ok) {
        fetchTemplates()
      }
    } catch (err) {
      console.error('Error activating marksheet template:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this marksheet template?')) return
    try {
      const res = await fetch(`/api/admin/marksheets/templates/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Error deleting marksheet template:', err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/marksheets/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          template_data: {
            primaryColor,
            headerText,
            institutionName,
            fontFamily: 'sans-serif'
          },
          is_active: false
        })
      })
      if (res.ok) {
        setCreateOpen(false)
        setName('')
        fetchTemplates()
      }
    } catch (err) {
      console.error('Error creating marksheet template:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const courseTemplates = templates.filter(t => t.type === 'course')
  const examTemplates = templates.filter(t => t.type === 'exam')

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Breadcrumbs */}
        <Breadcrumbs
          title="Marksheets"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Marksheet Templates' },
          ]}
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </Button>
          }
          className="mb-4"
        />

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Course Marksheet Templates Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <TableProperties className="h-5 w-5 text-[#007867]" />
                <h2 className="text-lg font-bold text-foreground">Course Marksheet Templates</h2>
                <Badge variant="outline" className="text-xs ml-2">{courseTemplates.length}</Badge>
              </div>

              {courseTemplates.length === 0 ? (
                <Card className="p-10 text-center border-dashed rounded-2xl bg-muted/20">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-base mb-1">No course marksheet templates</h3>
                  <p className="text-xs text-muted-foreground mb-4">Create your first course marksheet design.</p>
                  <Button size="sm" onClick={() => { setType('course'); setCreateOpen(true); }} variant="outline">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Course Marksheet
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseTemplates.map((template) => {
                    const isActive = !!template.is_active
                    const primary = template.template_data?.primaryColor || '#1e40af'
                    return (
                      <Card
                        key={template.id}
                        className="rounded-2xl border border-border/80 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Preview Frame */}
                        <div className="h-44 p-4 flex flex-col justify-between border-b bg-slate-50 relative">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: primary, backgroundColor: primary + '15' }}>
                              COURSE MARKSHEET
                            </span>
                            {isActive && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] gap-1">
                                <Check className="h-3 w-3" /> Active
                              </Badge>
                            )}
                          </div>
                          <div className="my-auto space-y-1 text-center">
                            <h4 className="font-bold text-sm text-foreground">
                              {template.template_data?.headerText || 'Academic Record'}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {template.template_data?.institutionName || 'Mentor LMS Platform'}
                            </p>
                            <div className="mx-auto w-3/4 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 border-t pt-1.5 border-slate-200">
                            <span>Credits Verified</span>
                            <span>Grade: A+ (94%)</span>
                          </div>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-4 flex items-center justify-between mt-auto">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{template.name}</h3>
                            <p className="text-[11px] text-muted-foreground">ID: #{template.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivate(template.id)}
                                className="h-8 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                              >
                                Activate
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> In Use
                              </span>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(template.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Exam Marksheet Templates Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-foreground">Exam Marksheet Templates</h2>
                <Badge variant="outline" className="text-xs ml-2">{examTemplates.length}</Badge>
              </div>

              {examTemplates.length === 0 ? (
                <Card className="p-10 text-center border-dashed rounded-2xl bg-muted/20">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-base mb-1">No exam marksheet templates</h3>
                  <p className="text-xs text-muted-foreground mb-4">Create your first examination grading sheet template.</p>
                  <Button size="sm" onClick={() => { setType('exam'); setCreateOpen(true); }} variant="outline">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Exam Marksheet
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examTemplates.map((template) => {
                    const isActive = !!template.is_active
                    const primary = template.template_data?.primaryColor || '#6b21a8'
                    return (
                      <Card
                        key={template.id}
                        className="rounded-2xl border border-border/80 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Preview Frame */}
                        <div className="h-44 p-4 flex flex-col justify-between border-b bg-slate-50 relative">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: primary, backgroundColor: primary + '15' }}>
                              EXAM MARKSHEET
                            </span>
                            {isActive && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] gap-1">
                                <Check className="h-3 w-3" /> Active
                              </Badge>
                            )}
                          </div>
                          <div className="my-auto space-y-1 text-center">
                            <h4 className="font-bold text-sm text-foreground">
                              {template.template_data?.headerText || 'Exam Evaluation Report'}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {template.template_data?.institutionName || 'Mentor LMS Platform'}
                            </p>
                            <div className="mx-auto w-3/4 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 border-t pt-1.5 border-slate-200">
                            <span>Score: 98/100</span>
                            <span>Percentile: Top 1%</span>
                          </div>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-4 flex items-center justify-between mt-auto">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{template.name}</h3>
                            <p className="text-[11px] text-muted-foreground">ID: #{template.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivate(template.id)}
                                className="h-8 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                              >
                                Activate
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> In Use
                              </span>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(template.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Create Marksheet Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold">Template Title</Label>
                <Input
                  required
                  placeholder="e.g. Standard Marksheet Template"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Target Credential</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'course' | 'exam')}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="course">Course Marksheet</option>
                  <option value="exam">Examination Marksheet</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Header Title Text</Label>
                <Input
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Official Academic Transcript"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Institution Name</Label>
                <Input
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Mentor LMS Academy"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-10 p-0 border rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono">{primaryColor}</span>
                </div>
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
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Marksheet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
