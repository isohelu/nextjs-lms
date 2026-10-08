'use client'

import React from 'react'
import { Calendar, ClipboardList } from 'lucide-react'

export interface MarksheetPreviewProps {
  template: {
    name?: string
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
  studentName?: string
  courseName?: string
  completionDate?: string
  logoUrl?: string | null
}

export default function MarksheetPreview({
  template,
  studentName = 'John Doe',
  courseName = 'Sample Course Name',
  completionDate = 'January 1, 2025',
  logoUrl,
}: MarksheetPreviewProps) {
  const { template_data } = template

  const overallGrade = 'A'
  const overallPercentage = 91

  return (
    <div
      className="relative min-h-[500px] rounded-lg border-4 p-8 shadow-lg"
      style={{
        backgroundColor: template_data?.backgroundColor || '#ffffff',
        borderColor: template_data?.borderColor || '#2563eb',
        fontFamily: template_data?.fontFamily || 'sans-serif',
      }}
    >
      {/* Header Section */}
      <div
        className="mb-6 border-b-2 pb-4"
        style={{ borderColor: template_data?.borderColor || '#2563eb' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(logoUrl || template.logo_path) ? (
              <div className="h-16 w-16">
                <img
                  src={logoUrl || template.logo_path || ''}
                  alt="Logo"
                  className="h-full w-full object-contain max-h-16"
                />
              </div>
            ) : (
              <ClipboardList
                className="h-12 w-12"
                style={{ color: template_data?.primaryColor || '#1e40af' }}
              />
            )}
            <div>
              <h2
                className="text-2xl font-bold"
                style={{
                  color: template_data?.primaryColor || '#1e40af',
                  fontFamily: template_data?.fontFamily || 'sans-serif',
                }}
              >
                {template_data?.headerText || 'Course Marksheet'}
              </h2>
              <p
                className="text-lg"
                style={{
                  color: template_data?.secondaryColor || '#475569',
                  fontFamily: template_data?.fontFamily || 'sans-serif',
                }}
              >
                {template_data?.institutionName || 'Institute Name'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p
            className="text-sm"
            style={{ color: template_data?.secondaryColor || '#475569' }}
          >
            Student Name
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: template_data?.primaryColor || '#1e40af' }}
          >
            {studentName}
          </p>
        </div>
        <div>
          <p
            className="text-sm"
            style={{ color: template_data?.secondaryColor || '#475569' }}
          >
            Course
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: template_data?.primaryColor || '#1e40af' }}
          >
            {courseName}
          </p>
        </div>
        <div>
          <p
            className="text-sm"
            style={{ color: template_data?.secondaryColor || '#475569' }}
          >
            Completion Date
          </p>
          <div className="flex items-center gap-2">
            <Calendar
              className="h-4 w-4"
              style={{ color: template_data?.secondaryColor || '#475569' }}
            />
            <p
              className="font-medium"
              style={{ color: template_data?.primaryColor || '#1e40af' }}
            >
              {completionDate}
            </p>
          </div>
        </div>
        <div>
          <p
            className="text-sm"
            style={{ color: template_data?.secondaryColor || '#475569' }}
          >
            Overall Grade
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: template_data?.primaryColor || '#1e40af' }}
          >
            {overallGrade} ({overallPercentage}%)
          </p>
        </div>
      </div>

      {/* Exam Type Section */}
      <div className="mb-6">
        <h3
          className="mb-3 text-lg font-semibold"
          style={{ color: template_data?.primaryColor || '#1e40af' }}
        >
          Exam Type
        </h3>
        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: template_data?.borderColor || '#2563eb' }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: `${template_data?.primaryColor || '#1e40af'}20`,
                }}
              >
                <th
                  className="border-b p-3 text-left font-semibold"
                  style={{
                    color: template_data?.primaryColor || '#1e40af',
                    borderColor: template_data?.borderColor || '#2563eb',
                  }}
                >
                  Exam Type
                </th>
                <th
                  className="border-b p-3 text-right font-semibold"
                  style={{
                    color: template_data?.primaryColor || '#1e40af',
                    borderColor: template_data?.borderColor || '#2563eb',
                  }}
                >
                  Total Marks
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                className="border-b"
                style={{ borderColor: template_data?.borderColor || '#2563eb' }}
              >
                <td
                  className="p-3"
                  style={{ color: template_data?.secondaryColor || '#475569' }}
                >
                  Assignment
                </td>
                <td
                  className="p-3 text-right font-medium"
                  style={{ color: template_data?.primaryColor || '#1e40af' }}
                >
                  10/50
                </td>
              </tr>
              <tr>
                <td
                  className="p-3"
                  style={{ color: template_data?.secondaryColor || '#475569' }}
                >
                  Quiz
                </td>
                <td
                  className="p-3 text-right font-medium"
                  style={{ color: template_data?.primaryColor || '#1e40af' }}
                >
                  0/0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-8 border-t-2 pt-4 text-center"
        style={{ borderColor: template_data?.borderColor || '#2563eb' }}
      >
        <p
          className="text-sm"
          style={{
            color: template_data?.secondaryColor || '#475569',
            fontFamily: template_data?.fontFamily || 'sans-serif',
          }}
        >
          {template_data?.footerText || 'This is an official marksheet'}
        </p>
      </div>
    </div>
  )
}
