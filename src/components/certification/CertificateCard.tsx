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
import { Award, Check, Edit, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import CertificatePreview from './CertificatePreview'

export interface CertificateTemplate {
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
    titleText: string
    descriptionText: string
    completionText: string
    footerText: string
    fontFamily: string
  }
}

interface CertificateCardProps {
  type: 'course' | 'exam'
  template: CertificateTemplate
  onRefresh?: () => void
}

export default function CertificateCard({
  type,
  template,
  onRefresh,
}: CertificateCardProps) {
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null)
  const [activating, setActivating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleActivate = async () => {
    try {
      setActivating(true)
      const res = await fetch(`/api/admin/certificates/templates/${template.id}/activate`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.success(`${template.name} is now active`)
        onRefresh?.()
      } else {
        toast.error('Failed to activate certificate template')
      }
    } catch {
      toast.error('Error activating certificate template')
    } finally {
      setActivating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this certificate template?')) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/certificates/templates/${template.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Certificate template deleted successfully')
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
            <Award className="h-5 w-5 text-muted-foreground" />
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
                <Link href={`/dashboard/certification/certificate/${template.id}/edit`}>
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
              backgroundColor: template.template_data?.backgroundColor || '#dbeafe',
              borderColor: template.template_data?.borderColor || '#f59e0b',
            }}
            onClick={() => setPreviewTemplate(template)}
          >
            <div
              className="mb-2 text-xs font-bold truncate"
              style={{ color: template.template_data?.primaryColor || '#3730a3' }}
            >
              {template.template_data?.titleText || 'Certificate of Completion'}
            </div>
            <div
              className="text-[8px] truncate"
              style={{ color: template.template_data?.secondaryColor || '#4b5563' }}
            >
              {template.template_data?.descriptionText || 'This certificate is proudly presented to'}
            </div>
          </div>

          {/* Color Indicators */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded border"
                style={{
                  backgroundColor: template.template_data?.primaryColor || '#3730a3',
                }}
              />
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded border"
                style={{
                  backgroundColor: template.template_data?.secondaryColor || '#4b5563',
                }}
              />
              <span className="text-xs text-muted-foreground">Secondary</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl">
            <ScrollArea className="max-h-[90vh]">
              <div className="p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
                </DialogHeader>

                <CertificatePreview
                  template={previewTemplate}
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
