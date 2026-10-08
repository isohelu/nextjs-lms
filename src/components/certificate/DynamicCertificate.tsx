'use client'

import React, { useRef, useState } from 'react'
import { Award, Calendar, Download, FileImage, FileText, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import jsPDF from 'jspdf'

export interface CertificateTemplateData {
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

export interface CertificateTemplate {
  id: number
  name: string
  logo_path?: string | null
  template_data: CertificateTemplateData | string
  is_active?: boolean | number
  type?: string
}

interface DynamicCertificateProps {
  template?: CertificateTemplate | null
  courseName: string
  studentName: string
  completionDate: string
  credentialCode?: string
}

const DEFAULT_CERTIFICATE_DATA: CertificateTemplateData = {
  primaryColor: '#1e40af',
  secondaryColor: '#475569',
  backgroundColor: '#eff6ff',
  borderColor: '#2563eb',
  titleText: 'Certificate of Achievement',
  descriptionText: 'This certificate is proudly presented to',
  completionText: 'for successfully completing the curriculum for',
  footerText: 'Authorized and Verified Educational Credential',
  fontFamily: 'serif',
}

export default function DynamicCertificate({
  template,
  courseName,
  studentName,
  completionDate,
  credentialCode = 'MLMS-CERT-2026-9901',
}: DynamicCertificateProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('pdf')
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const dimensions = { width: 900, height: 600 }

  const templateData: CertificateTemplateData = (() => {
    if (!template?.template_data) return DEFAULT_CERTIFICATE_DATA
    if (typeof template.template_data === 'string') {
      try {
        return JSON.parse(template.template_data)
      } catch {
        return DEFAULT_CERTIFICATE_DATA
      }
    }
    return template.template_data
  })()

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ')
    let line = ''
    let testLine = ''
    const lines: { text: string; width: number }[] = []

    for (let n = 0; n < words.length; n++) {
      testLine += `${words[n]} `
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lines.push({ text: line.trim(), width: ctx.measureText(line).width })
        testLine = `${words[n]} `
        line = `${words[n]} `;
      } else {
        line = testLine
      }
    }

    lines.push({ text: line.trim(), width: ctx.measureText(line).width })

    let currentY = y
    lines.forEach((lineObj) => {
      ctx.fillText(lineObj.text, x, currentY)
      currentY += lineHeight
    })

    return currentY
  }

  const drawCertificate = async (
    ctx: CanvasRenderingContext2D,
    dims: { width: number; height: number },
    logoImage: HTMLImageElement | null = null
  ) => {
    // 1. Background fill
    ctx.fillStyle = templateData.backgroundColor || '#eff6ff'
    ctx.fillRect(0, 0, dims.width, dims.height)

    // Subtle guilloché / security pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
    for (let i = 0; i < dims.width; i += 20) {
      for (let j = 0; j < dims.height; j += 20) {
        ctx.fillRect(i, j, 1, 1)
      }
    }

    // 2. Outer decorative border
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, dims.width - 40, dims.height - 40)

    // 3. Inner border
    ctx.strokeStyle = templateData.primaryColor || '#1e40af'
    ctx.lineWidth = 2
    ctx.strokeRect(38, 38, dims.width - 76, dims.height - 76)

    // Alignment
    ctx.textAlign = 'center'
    let currentY = 95

    // Logo if exists
    if (logoImage) {
      const logoSize = 64
      const logoX = (dims.width - logoSize) / 2
      const logoY = 55
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
      currentY = logoY + logoSize + 30
    }

    // Academy header
    ctx.font = 'bold 12px sans-serif'
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('MENTOR LMS GLOBAL ACCREDITATION', dims.width / 2, currentY - 20)

    // Title
    ctx.font = `bold 38px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(templateData.titleText || 'Certificate of Achievement', dims.width / 2, currentY)
    currentY += 15

    // Underline beneath title
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(dims.width / 2 - 130, currentY)
    ctx.lineTo(dims.width / 2 + 130, currentY)
    ctx.stroke()
    currentY += 40

    // Description
    ctx.font = `18px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    currentY = wrapText(
      ctx,
      templateData.descriptionText || 'This is proudly presented to',
      dims.width / 2,
      currentY,
      dims.width - 120,
      26
    )
    currentY += 30

    // Student name
    ctx.font = `bold 34px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(studentName || 'Student Name', dims.width / 2, currentY)

    // Underline for student name
    const nameWidth = ctx.measureText(studentName || 'Student Name').width
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(dims.width / 2 - nameWidth / 2 - 15, currentY + 8)
    ctx.lineTo(dims.width / 2 + nameWidth / 2 + 15, currentY + 8)
    ctx.stroke()
    currentY += 45

    // Completion text
    ctx.font = `18px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText(
      templateData.completionText || 'for successfully completing all requirements for',
      dims.width / 2,
      currentY
    )
    currentY += 35

    // Course name
    ctx.font = `bold 24px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(courseName || 'Course Name', dims.width / 2, currentY)
    currentY += 35

    // Completion date
    ctx.font = `15px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#64748b'
    ctx.fillText(`Completed on: ${completionDate || new Date().toLocaleDateString()}`, dims.width / 2, currentY)

    // Footer & verification seal
    const footerY = dims.height - 65
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, footerY - 20)
    ctx.lineTo(dims.width - 60, footerY - 20)
    ctx.stroke()

    ctx.font = `13px ${templateData.fontFamily || 'serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#64748b'
    ctx.fillText(templateData.footerText || 'Authorized and Verified Educational Credential', dims.width / 2, footerY)

    ctx.font = '10px monospace'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`Credential ID: ${credentialCode}`, dims.width / 2, footerY + 18)
  }

  const downloadAsPNG = async () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not create canvas context')

      canvas.width = dimensions.width
      canvas.height = dimensions.height

      let logoImage: HTMLImageElement | null = null
      if (template?.logo_path) {
        try {
          logoImage = await loadImage(template.logo_path)
        } catch {}
      }

      await drawCertificate(ctx, dimensions, logoImage)

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${studentName}_${courseName}_Certificate.png`.replace(/[^a-zA-Z0-9_-]/g, '_')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('🎉 Certificate saved as PNG image!')
      }, 'image/png')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PNG certificate.')
    } finally {
      setDownloading(false)
    }
  }

  const downloadAsPDF = async () => {
    setDownloading(true)
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [dimensions.width, dimensions.height],
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not create canvas context')

      canvas.width = dimensions.width
      canvas.height = dimensions.height

      let logoImage: HTMLImageElement | null = null
      if (template?.logo_path) {
        try {
          logoImage = await loadImage(template.logo_path)
        } catch {}
      }

      await drawCertificate(ctx, dimensions, logoImage)

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, dimensions.width, dimensions.height)
      pdf.save(`${studentName}_${courseName}_Certificate.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_'))
      toast.success('🎉 Certificate saved as PDF document!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF certificate.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadCertificate = async () => {
    if (downloadFormat === 'pdf') {
      await downloadAsPDF()
    } else {
      await downloadAsPNG()
    }
  }

  return (
    <Card className="mx-auto max-w-3xl space-y-6 p-6 border-border bg-card">
      {/* Live Rendered Certificate Visual Preview */}
      <div
        ref={certificateRef}
        className="relative flex flex-col justify-center rounded-2xl border-4 p-8 text-center shadow-lg transition-all"
        style={{
          backgroundColor: templateData.backgroundColor,
          borderColor: templateData.borderColor,
          fontFamily: templateData.fontFamily,
        }}
      >
        {/* Inner decorative double border */}
        <div
          className="absolute inset-3 rounded-xl border-2 pointer-events-none"
          style={{
            borderColor: templateData.primaryColor,
          }}
        />

        <div className="relative z-10 space-y-4">
          {/* Logo or Seal */}
          {template?.logo_path ? (
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center">
              <img src={template.logo_path} alt="Logo" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center shadow-md"
                style={{
                  backgroundColor: `${templateData.primaryColor}15`,
                  color: templateData.borderColor,
                }}
              >
                <Award className="h-8 w-8" />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <span className="text-xs uppercase font-bold tracking-widest opacity-80" style={{ color: templateData.secondaryColor }}>
              Mentor LMS Official Accreditation
            </span>
            <h2
              className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight"
              style={{
                color: templateData.primaryColor,
              }}
            >
              {templateData.titleText}
            </h2>
            <div
              className="mx-auto mt-2 h-0.5 w-32 rounded-full"
              style={{
                backgroundColor: templateData.borderColor,
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p
              className="font-serif text-sm leading-relaxed"
              style={{
                color: templateData.secondaryColor,
              }}
            >
              {templateData.descriptionText}
            </p>

            {/* Student Name */}
            <div className="relative py-1">
              <p
                className="mx-4 font-serif text-2xl sm:text-3xl font-bold tracking-wide"
                style={{
                  color: templateData.primaryColor,
                }}
              >
                {studentName}
              </p>
              <div
                className="absolute bottom-0 left-1/2 h-0.5 w-44 -translate-x-1/2 transform rounded-full"
                style={{
                  backgroundColor: templateData.borderColor,
                }}
              />
            </div>

            {/* Completion Text */}
            <p
              className="font-serif text-sm"
              style={{
                color: templateData.secondaryColor,
              }}
            >
              {templateData.completionText}
            </p>

            {/* Course Name */}
            <p
              className="font-serif text-lg sm:text-xl font-bold"
              style={{
                color: templateData.primaryColor,
              }}
            >
              {courseName}
            </p>

            {/* Completion Date */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs">
              <Calendar
                className="h-3.5 w-3.5"
                style={{
                  color: templateData.secondaryColor,
                }}
              />
              <span
                className="font-serif"
                style={{
                  color: templateData.secondaryColor,
                }}
              >
                Completed on: {completionDate}
              </span>
            </div>
          </div>

          {/* Footer & Credential ID */}
          <div
            className="mt-4 border-t pt-3 flex items-center justify-between text-xs"
            style={{
              borderColor: `${templateData.borderColor}40`,
              color: templateData.secondaryColor,
            }}
          >
            <span className="font-serif italic">{templateData.footerText}</span>
            <div className="flex items-center gap-1 font-mono text-xs opacity-75">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{credentialCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Format Selector & Download Controls */}
      <div className="space-y-4 pt-2">
        <RadioGroup
          value={downloadFormat}
          onValueChange={(val) => setDownloadFormat(val as 'png' | 'pdf')}
          className="flex justify-center space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="cert-pdf" />
            <Label htmlFor="cert-pdf" className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              PDF Document
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="png" id="cert-png" />
            <Label htmlFor="cert-png" className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <FileImage className="h-4 w-4 text-emerald-500" />
              PNG Image
            </Label>
          </div>
        </RadioGroup>

        <Button
          className="w-full font-bold shadow-md h-10"
          onClick={handleDownloadCertificate}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {downloadFormat.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download as {downloadFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
