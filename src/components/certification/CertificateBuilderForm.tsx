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
import CertificatePreview from './CertificatePreview'
import { CertificateTemplate } from './CertificateCard'

interface CertificateBuilderFormProps {
  template?: CertificateTemplate
}

export default function CertificateBuilderForm({
  template,
}: CertificateBuilderFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState(template?.logo_path || null)

  const [type, setType] = useState<'course' | 'exam'>(template?.type || 'course')
  const [name, setName] = useState<string>(template?.name || 'My Certificate Template')
  const [templateData, setTemplateData] = useState(
    template?.template_data || {
      primaryColor: '#3730a3',
      secondaryColor: '#4b5563',
      backgroundColor: '#dbeafe',
      borderColor: '#f59e0b',
      titleText: 'Certificate of Completion',
      descriptionText: 'This certificate is proudly presented to',
      completionText: 'for successfully completing the course',
      footerText: 'Authorized Certificate',
      fontFamily: 'serif',
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
        ? `/api/admin/certificates/templates/${template.id}`
        : '/api/admin/certificates/templates'
      const method = template?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(
          template?.id
            ? 'Certificate template updated successfully'
            : 'Certificate template created successfully'
        )
        router.push('/dashboard/certification/certificate')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to save certificate template')
      }
    } catch {
      toast.error('An error occurred while saving certificate template')
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
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Modern Blue Certificate"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Logo & Branding</CardTitle>
            <CardDescription>Upload your institution or course logo</CardDescription>
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
            <CardDescription>Customize the certificate color scheme</CardDescription>
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
                    placeholder="#3730a3"
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
                    placeholder="#4b5563"
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
                    placeholder="#dbeafe"
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
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Choose the font style for your certificate</CardDescription>
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
                  <SelectItem value="cursive">Cursive (Elegant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader>
            <CardTitle>Certificate Text</CardTitle>
            <CardDescription>Customize the text content of your certificate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleText">Title Text</Label>
              <Input
                id="titleText"
                value={templateData.titleText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, titleText: e.target.value }))
                }
                placeholder="Certificate of Completion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionText">Description Text</Label>
              <Textarea
                id="descriptionText"
                value={templateData.descriptionText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, descriptionText: e.target.value }))
                }
                placeholder="This certificate is proudly presented to"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionText">Completion Text</Label>
              <Input
                id="completionText"
                value={templateData.completionText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, completionText: e.target.value }))
                }
                placeholder="for successfully completing the course"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={templateData.footerText}
                onChange={(e) =>
                  setTemplateData((prev) => ({ ...prev, footerText: e.target.value }))
                }
                placeholder="Authorized Certificate"
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
            <CardDescription>See how your certificate will look in real time</CardDescription>
          </CardHeader>
          <CardContent>
            <CertificatePreview
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
