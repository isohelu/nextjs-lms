'use client'

import React, { useRef, useState } from 'react'
import { Calendar, ClipboardList, Download, FileImage, FileText, Loader2, Award } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import jsPDF from 'jspdf'

export interface MarksheetTemplateData {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  borderColor: string
  headerText: string
  institutionName: string
  footerText: string
  fontFamily: string
}

export interface MarksheetTemplate {
  id: number
  name: string
  logo_path?: string | null
  template_data: MarksheetTemplateData | string
  is_active?: boolean | number
  type?: string
}

export interface StudentMarks {
  assignment: {
    total: number
    obtained: number
    percentage: number
  }
  quiz: {
    total: number
    obtained: number
    percentage: number
  }
  overall: {
    percentage: number
    grade: string
  }
}

interface DynamicMarksheetProps {
  template?: MarksheetTemplate | null
  courseName: string
  studentName: string
  completionDate: string
  studentMarks?: StudentMarks | null
}

const DEFAULT_MARKSHEET_DATA: MarksheetTemplateData = {
  primaryColor: '#1e40af',
  secondaryColor: '#475569',
  backgroundColor: '#ffffff',
  borderColor: '#2563eb',
  headerText: 'Official Academic Marksheet',
  institutionName: 'Mentor LMS Global Learning Academy',
  footerText: 'This is an official and verified academic record.',
  fontFamily: 'sans-serif',
}

const DEFAULT_MARKS: StudentMarks = {
  assignment: { total: 100, obtained: 95, percentage: 95 },
  quiz: { total: 100, obtained: 92, percentage: 92 },
  overall: { percentage: 94, grade: 'A+' },
}

export default function DynamicMarksheet({
  template,
  courseName,
  studentName,
  completionDate,
  studentMarks = DEFAULT_MARKS,
}: DynamicMarksheetProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('pdf')
  const [downloading, setDownloading] = useState(false)
  const marksheetRef = useRef<HTMLDivElement>(null)
  const dimensions = { width: 700, height: 900 }

  const marks = studentMarks || DEFAULT_MARKS

  const templateData: MarksheetTemplateData = (() => {
    if (!template?.template_data) return DEFAULT_MARKSHEET_DATA
    if (typeof template.template_data === 'string') {
      try {
        return JSON.parse(template.template_data)
      } catch {
        return DEFAULT_MARKSHEET_DATA
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

  const drawMarksheet = async (
    ctx: CanvasRenderingContext2D,
    dims: { width: number; height: number },
    logoImage: HTMLImageElement | null = null
  ) => {
    // 1. Background fill
    ctx.fillStyle = templateData.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, dims.width, dims.height)

    // 2. Outer border
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 6
    ctx.strokeRect(15, 15, dims.width - 30, dims.height - 30)

    const leftMargin = 70
    const rightMargin = dims.width - 70
    const middleX = dims.width / 2
    let currentY = 55

    // 3. Header Section (Logo + Institution Name + Header Title)
    const logoSize = 56
    const logoX = leftMargin
    const textStartX = leftMargin + logoSize + 18

    if (logoImage) {
      ctx.drawImage(logoImage, logoX, currentY, logoSize, logoSize)
    }

    ctx.textAlign = 'left'
    ctx.font = `bold 24px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(templateData.headerText || 'Academic Marksheet', textStartX, currentY + 22)

    ctx.font = `15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText(templateData.institutionName || 'Mentor LMS Academy', textStartX, currentY + 45)

    currentY += logoSize + 25

    // Divider line under header
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(leftMargin, currentY)
    ctx.lineTo(rightMargin, currentY)
    ctx.stroke()
    currentY += 35

    // 4. Student Details Grid (2 Columns)
    const col1X = leftMargin
    const col2X = middleX + 15
    const labelOffset = 22

    // Row 1: Student Name & Course
    ctx.font = `14px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Student Name', col1X, currentY)

    ctx.font = `bold 18px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(studentName || 'Student Name', col1X, currentY + labelOffset)

    ctx.font = `14px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Course Title', col2X, currentY)

    ctx.font = `bold 17px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    
    // Course name text truncate/wrap
    const maxCourseWidth = rightMargin - col2X
    const courseMetrics = ctx.measureText(courseName || 'Course Name')
    if (courseMetrics.width > maxCourseWidth) {
      ctx.fillText((courseName || 'Course Name').substring(0, 24) + '...', col2X, currentY + labelOffset)
    } else {
      ctx.fillText(courseName || 'Course Name', col2X, currentY + labelOffset)
    }

    currentY += 75

    // Row 2: Completion Date & Overall Grade
    ctx.font = `14px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Completion Date', col1X, currentY)

    ctx.font = `16px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(completionDate || new Date().toLocaleDateString(), col1X, currentY + labelOffset)

    ctx.font = `14px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Overall Grade & Standing', col2X, currentY)

    ctx.font = `bold 20px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(`${marks.overall.grade} (${marks.overall.percentage}%)`, col2X, currentY + labelOffset)

    currentY += 70

    // 5. Marks Breakdown Table Section
    ctx.textAlign = 'left'
    ctx.font = `bold 19px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText('Curriculum Assessment Breakdown', leftMargin, currentY)
    currentY += 25

    const tableWidth = rightMargin - leftMargin

    // Table Header
    ctx.fillStyle = `${templateData.primaryColor}20`
    ctx.fillRect(leftMargin, currentY, tableWidth, 42)

    ctx.font = `bold 15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText('Assessment Category', leftMargin + 16, currentY + 26)

    ctx.textAlign = 'right'
    ctx.fillText('Score Achieved', rightMargin - 16, currentY + 26)

    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 1.5
    ctx.strokeRect(leftMargin, currentY, tableWidth, 42)
    currentY += 42

    // Row 1: Assignments
    ctx.fillStyle = templateData.backgroundColor || '#ffffff'
    ctx.fillRect(leftMargin, currentY, tableWidth, 42)

    ctx.textAlign = 'left'
    ctx.font = `15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Assignments & Homework Deliverables', leftMargin + 16, currentY + 26)

    ctx.textAlign = 'right'
    ctx.font = `bold 15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(`${marks.assignment.obtained} / ${marks.assignment.total} (${marks.assignment.percentage}%)`, rightMargin - 16, currentY + 26)

    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(leftMargin, currentY, tableWidth, 42)
    currentY += 42

    // Row 2: Section Quizzes
    ctx.fillStyle = templateData.backgroundColor || '#ffffff'
    ctx.fillRect(leftMargin, currentY, tableWidth, 42)

    ctx.textAlign = 'left'
    ctx.font = `15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#475569'
    ctx.fillText('Module Quizzes & Assessments', leftMargin + 16, currentY + 26)

    ctx.textAlign = 'right'
    ctx.font = `bold 15px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(`${marks.quiz.obtained} / ${marks.quiz.total} (${marks.quiz.percentage}%)`, rightMargin - 16, currentY + 26)

    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(leftMargin, currentY, tableWidth, 42)
    currentY += 42

    // Row 3: Total Final Result
    ctx.fillStyle = `${templateData.primaryColor}10`
    ctx.fillRect(leftMargin, currentY, tableWidth, 45)

    ctx.textAlign = 'left'
    ctx.font = `bold 16px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText('Cumulative Performance Result', leftMargin + 16, currentY + 28)

    ctx.textAlign = 'right'
    ctx.font = `bold 18px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.primaryColor || '#1e40af'
    ctx.fillText(`Grade: ${marks.overall.grade} (${marks.overall.percentage}%)`, rightMargin - 16, currentY + 28)

    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 1.5
    ctx.strokeRect(leftMargin, currentY, tableWidth, 45)
    currentY += 75

    // 6. Footer Divider & Text
    ctx.strokeStyle = templateData.borderColor || '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(leftMargin, currentY)
    ctx.lineTo(rightMargin, currentY)
    ctx.stroke()
    currentY += 30

    ctx.textAlign = 'center'
    ctx.font = `14px ${templateData.fontFamily || 'sans-serif'}`
    ctx.fillStyle = templateData.secondaryColor || '#64748b'
    ctx.fillText(templateData.footerText || 'This is an official academic record.', dims.width / 2, currentY)

    ctx.font = '11px monospace'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`Verification Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-LMS`, dims.width / 2, currentY + 22)
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

      await drawMarksheet(ctx, dimensions, logoImage)

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${studentName}_${courseName}_Marksheet.png`.replace(/[^a-zA-Z0-9_-]/g, '_')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('🎉 Marksheet saved as PNG image!')
      }, 'image/png')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PNG marksheet.')
    } finally {
      setDownloading(false)
    }
  }

  const downloadAsPDF = async () => {
    setDownloading(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
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

      await drawMarksheet(ctx, dimensions, logoImage)

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, dimensions.width, dimensions.height)
      pdf.save(`${studentName}_${courseName}_Marksheet.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_'))
      toast.success('🎉 Marksheet saved as PDF document!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF marksheet.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadMarksheet = async () => {
    if (downloadFormat === 'pdf') {
      await downloadAsPDF()
    } else {
      await downloadAsPNG()
    }
  }

  return (
    <Card className="mx-auto max-w-3xl space-y-6 p-6 border-border bg-card">
      {/* Live Marksheet Visual Card */}
      <div
        ref={marksheetRef}
        className="relative rounded-2xl border-4 p-8 shadow-lg transition-all space-y-6"
        style={{
          backgroundColor: templateData.backgroundColor,
          borderColor: templateData.borderColor,
          fontFamily: templateData.fontFamily,
        }}
      >
        {/* Header */}
        <div
          className="border-b-2 pb-4 flex items-center justify-between"
          style={{
            borderColor: templateData.borderColor,
          }}
        >
          <div className="flex items-center gap-3.5">
            {template?.logo_path ? (
              <img src={template.logo_path} alt="Logo" className="h-12 w-12 object-contain" />
            ) : (
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: `${templateData.primaryColor}15`,
                  color: templateData.primaryColor,
                }}
              >
                <ClipboardList className="h-6 w-6" />
              </div>
            )}
            <div>
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ color: templateData.primaryColor }}
              >
                {templateData.headerText}
              </h2>
              <p
                className="text-xs font-medium"
                style={{ color: templateData.secondaryColor }}
              >
                {templateData.institutionName}
              </p>
            </div>
          </div>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold opacity-75" style={{ color: templateData.secondaryColor }}>
              Student Name
            </span>
            <p className="text-base font-bold" style={{ color: templateData.primaryColor }}>
              {studentName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold opacity-75" style={{ color: templateData.secondaryColor }}>
              Course
            </span>
            <p className="text-base font-bold truncate" style={{ color: templateData.primaryColor }}>
              {courseName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold opacity-75" style={{ color: templateData.secondaryColor }}>
              Completion Date
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" style={{ color: templateData.secondaryColor }} />
              <p className="font-semibold" style={{ color: templateData.primaryColor }}>
                {completionDate}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold opacity-75" style={{ color: templateData.secondaryColor }}>
              Overall Grade
            </span>
            <p className="text-xl font-black" style={{ color: templateData.primaryColor }}>
              {marks.overall.grade} ({marks.overall.percentage}%)
            </p>
          </div>
        </div>

        {/* Assessment Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold" style={{ color: templateData.primaryColor }}>
            Assessment Breakdown
          </h4>
          <div
            className="overflow-hidden rounded-xl border text-xs"
            style={{ borderColor: templateData.borderColor }}
          >
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: `${templateData.primaryColor}15` }}>
                  <th className="p-3 font-bold" style={{ color: templateData.primaryColor }}>Exam Type</th>
                  <th className="p-3 font-bold text-right" style={{ color: templateData.primaryColor }}>Total Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-medium" style={{ color: templateData.secondaryColor }}>Assignments</td>
                  <td className="p-3 font-bold text-right" style={{ color: templateData.primaryColor }}>
                    {marks.assignment.obtained} / {marks.assignment.total}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium" style={{ color: templateData.secondaryColor }}>Quizzes</td>
                  <td className="p-3 font-bold text-right" style={{ color: templateData.primaryColor }}>
                    {marks.quiz.obtained} / {marks.quiz.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className="border-t pt-3 text-center text-xs"
          style={{ borderColor: `${templateData.borderColor}40`, color: templateData.secondaryColor }}
        >
          <p className="italic">{templateData.footerText}</p>
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
            <RadioGroupItem value="pdf" id="marksheet-pdf" />
            <Label htmlFor="marksheet-pdf" className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              PDF Document
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="png" id="marksheet-png" />
            <Label htmlFor="marksheet-png" className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <FileImage className="h-4 w-4 text-emerald-500" />
              PNG Image
            </Label>
          </div>
        </RadioGroup>

        <Button
          className="w-full font-bold shadow-md h-10"
          onClick={handleDownloadMarksheet}
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
