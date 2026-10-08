'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, ClipboardList, Edit, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import MarksheetPreview from './MarksheetPreview'

export interface MarksheetTemplate {
  id: number
  name: string
  type: 'course' | 'exam'
  is_active: boolean
  logo_path?: string | null
  template_data: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    borderColor: string
    headerText: string
    institutionName: string
    footerText: string
    fontFamily: string
  }
}

interface MarksheetCardProps {
  type: 'course' | 'exam'
  template: MarksheetTemplate
  onRefresh?: () => void
}

export default function MarksheetCard({
  type,
  template,
  onRefresh,
}: MarksheetCardProps) {
  const [previewMarksheet, setPreviewMarksheet] = useState<MarksheetTemplate | null>(null)
  const [activating, setActivating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleActivate = async () => {
    try {
      setActivating(true)
      const res = await fetch(`/api/admin/marksheets/templates/${template.id}/activate`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.success(`${template.name} is now active`)
        onRefresh?.()
      } else {
        toast.error('Failed to activate marksheet template')
      }
    } catch {
      toast.error('Error activating marksheet template')
    } finally {
      setActivating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this marksheet template?')) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/marksheets/templates/${template.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Marksheet template deleted successfully')
        onRefresh?.()
      } else {
        toast.error('Failed to delete template')
      }
    } catch {
      toast.error('Error deleting template')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'relative space-y-6 py-4 md:py-6 shadow-sm transition-all',
          template.is_active
            ? 'ring-2 ring-foreground'
            : 'hover:ring-1 hover:ring-foreground'
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6 pb-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <span className="truncate max-w-[180px]">{template.name}</span>
            {template.is_active && (
              <Badge variant="default" className="rounded-full bg-primary text-xs">
                <Check className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {!template.is_active && (
                <DropdownMenuItem onClick={handleActivate} disabled={activating}>
                  <Check className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/certification/marksheet/${template.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4 px-4 md:px-6">
          {/* Mini Preview Box */}
          <div
            className="cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:shadow-md"
            style={{
              backgroundColor: template.template_data?.backgroundColor || '#ffffff',
              borderColor: template.template_data?.borderColor || '#2563eb',
            }}
            onClick={() => setPreviewMarksheet(template)}
          >
            <div
              className="mb-2 text-xs font-bold truncate"
              style={{ color: template.template_data?.primaryColor || '#1e40af' }}
            >
              {template.template_data?.headerText || 'Course Marksheet'}
            </div>
            <div
              className="text-[8px] truncate"
              style={{ color: template.template_data?.secondaryColor || '#475569' }}
            >
              {template.template_data?.institutionName || 'Institute Name'}
            </div>
          </div>

          {/* Color Indicators */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded border"
                style={{
                  backgroundColor: template.template_data?.primaryColor || '#1e40af',
                }}
              />
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded border"
                style={{
                  backgroundColor: template.template_data?.secondaryColor || '#475569',
                }}
              />
              <span className="text-xs text-muted-foreground">Secondary</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Preview Dialog */}
      {previewMarksheet && (
        <Dialog open={!!previewMarksheet} onOpenChange={(open) => !open && setPreviewMarksheet(null)}>
          <DialogContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-4xl">
            <ScrollArea className="max-h-[90vh]">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle>Preview: {previewMarksheet.name}</DialogTitle>
                </DialogHeader>

                <MarksheetPreview
                  template={previewMarksheet}
                  studentName="John Doe"
                  courseName="Sample Course Name"
                  completionDate="January 1, 2025"
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
