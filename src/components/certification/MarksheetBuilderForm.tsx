'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import MarksheetPreview from './MarksheetPreview'
import { MarksheetTemplate } from './MarksheetCard'

interface MarksheetBuilderFormProps {
  template?: MarksheetTemplate
}

export default function MarksheetBuilderForm({
  template,
}: MarksheetBuilderFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState(template?.logo_path || null)

  const [type, setType] = useState<'course' | 'exam'>(template?.type || 'course')
  const [name, setName] = useState<string>(template?.name || 'My Marksheet Template')
  const [templateData, setTemplateData] = useState(
    template?.template_data || {
      primaryColor: '#1e40af',
      secondaryColor: '#475569',
      backgroundColor: '#ffffff',
      borderColor: '#2563eb',
      headerText: 'Course Marksheet',
      institutionName: 'Institute Name',
      footerText: 'This is an official marksheet',
      fontFamily: 'sans-serif',
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        name,
        type,
        template_data: templateData,
        logo_path: logoPreview,
        is_active: template?.is_active ?? false,
      }

      const url = template?.id
        ? `/api/admin/marksheets/templates/${template.id}`
        : '/api/admin/marksheets/templates'
      const method = template?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(
          template?.id
            ? 'Marksheet template updated successfully'
            : 'Marksheet template created successfully'
        )
        router.push('/dashboard/certification/marksheet')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to save marksheet template')
      }
    } catch {
      toast.error('An error occurred while saving marksheet template')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      {/* Form Settings Section */}
      <div className="space-y-6">
        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Set the template name and target type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select value={type} onValueChange={(val: 'course' | 'exam') => setType(val)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Modern Blue Marksheet"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Logo & Branding</CardTitle>
            <CardDescription>Upload your institution logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Image</Label>
              <div className="space-y-2">
                {logoPreview && (
                  <div className="h-20 w-20 overflow-hidden rounded border bg-muted p-1">
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => setLogoPreview(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Recommended: PNG or SVG, max 1MB</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Customize the marksheet color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={templateData.primaryColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="h-10 w-16 p-1 cursor-pointer"
                  />
                  <Input
                    value={templateData.primaryColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    placeholder="#1e40af"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={templateData.secondaryColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="h-10 w-16 p-1 cursor-pointer"
                  />
                  <Input
                    value={templateData.secondaryColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    placeholder="#475569"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={templateData.backgroundColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="h-10 w-16 p-1 cursor-pointer"
                  />
                  <Input
                    value={templateData.backgroundColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={templateData.borderColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, borderColor: e.target.value }))
                    }
                    className="h-10 w-16 p-1 cursor-pointer"
                  />
                  <Input
                    value={templateData.borderColor}
                    onChange={(e) =>
                      setTemplateData((prev) => ({ ...prev, borderColor: e.target.value }))
                    }
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Choose the font style for your marksheet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={templateData.fontFamily}
                onValueChange={(val) =>
                  setTemplateData((prev) => ({ ...prev, fontFamily: val }))
                }
              >
                <SelectTrigger id="fontFamily">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif (Classic)</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif (Modern)</SelectItem>
                  <SelectItem value="monospace">Monospace (Technical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Marksheet Content</CardTitle>
            <CardDescription>Customize the text content of your marksheet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerText">Header Text</Label>
              <Input
                id="headerText"
                value={templateData.headerText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, headerText: e.target.value }))
                }
                placeholder="Course Marksheet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={templateData.institutionName}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, institutionName: e.target.value }))
                }
                placeholder="Institute Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Textarea
                id="footerText"
                value={templateData.footerText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, footerText: e.target.value }))
                }
                placeholder="This is an official marksheet"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {template?.id ? 'Update Template' : 'Create Template'}
        </Button>
      </div>

      {/* Live Preview Sticky Column */}
      <div className="lg:sticky lg:top-6">
        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your marksheet will look in real time</CardDescription>
          </CardHeader>
          <CardContent>
            <MarksheetPreview
              template={{
                name,
                logo_path: logoPreview,
                template_data: templateData,
              }}
              studentName="John Doe"
              courseName="Sample Course Name"
              completionDate="January 1, 2025"
              logoUrl={logoPreview}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
