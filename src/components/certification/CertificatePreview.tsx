'use client'

import React from 'react'
import { Award, Calendar } from 'lucide-react'

export interface CertificatePreviewProps {
  template: {
    name?: string
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
  studentName?: string
  courseName?: string
  completionDate?: string
  logoUrl?: string | null
}

export default function CertificatePreview({
  template,
  studentName = 'John Doe',
  courseName = 'Sample Course Name',
  completionDate = 'January 1, 2025',
  logoUrl,
}: CertificatePreviewProps) {
  const { template_data } = template

  return (
    <div
      className="relative flex min-h-[400px] flex-col justify-center rounded-lg border-4 p-8 text-center shadow-lg"
      style={{
        backgroundColor: template_data?.backgroundColor || '#dbeafe',
        borderColor: template_data?.borderColor || '#f59e0b',
        fontFamily: template_data?.fontFamily || 'serif',
      }}
    >
      {/* Inner decorative border */}
      <div
        className="absolute inset-4 rounded border-2 pointer-events-none"
        style={{
          borderColor: template_data?.primaryColor || '#3730a3',
        }}
      />

      <div className="relative z-10 space-y-6">
        {/* Logo */}
        {(logoUrl || template.logo_path) ? (
          <div className="certificate-logo mx-auto mb-4 flex h-16 items-center justify-center">
            <img
              src={logoUrl || template.logo_path || ''}
              alt="Logo"
              className="h-full w-full object-contain max-h-16"
            />
          </div>
        ) : (
          <Award
            className="mx-auto mb-3 h-12 w-12"
            style={{
              color: template_data?.borderColor || '#f59e0b',
            }}
          />
        )}

        {/* Title */}
        <div>
          <h2
            className="mb-2 text-3xl font-bold"
            style={{
              color: template_data?.primaryColor || '#3730a3',
              fontFamily: template_data?.fontFamily || 'serif',
            }}
          >
            {template_data?.titleText || 'Certificate of Completion'}
          </h2>
          <div
            className="mx-auto h-1 w-32"
            style={{
              backgroundColor: template_data?.borderColor || '#f59e0b',
            }}
          />
        </div>

        {/* Description */}
        <p
          className="text-lg"
          style={{
            color: template_data?.secondaryColor || '#4b5563',
            fontFamily: template_data?.fontFamily || 'serif',
          }}
        >
          {template_data?.descriptionText || 'This certificate is proudly presented to'}
        </p>

        {/* Student Name */}
        <div className="relative py-4">
          <p
            className="text-3xl font-bold"
            style={{
              color: template_data?.primaryColor || '#3730a3',
              fontFamily: template_data?.fontFamily || 'serif',
            }}
          >
            {studentName}
          </p>
          <div
            className="mx-auto mt-2 h-0.5 w-48"
            style={{
              backgroundColor: template_data?.borderColor || '#f59e0b',
            }}
          />
        </div>

        {/* Completion Text */}
        <p
          className="text-lg"
          style={{
            color: template_data?.secondaryColor || '#4b5563',
            fontFamily: template_data?.fontFamily || 'serif',
          }}
        >
          {template_data?.completionText || 'for successfully completing the course'}
        </p>

        {/* Course Name */}
        <p
          className="text-2xl font-semibold"
          style={{
            color: template_data?.primaryColor || '#3730a3',
            fontFamily: template_data?.fontFamily || 'serif',
          }}
        >
          {courseName}
        </p>

        {/* Completion Date */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Calendar
            className="h-4 w-4"
            style={{
              color: template_data?.secondaryColor || '#4b5563',
            }}
          />
          <p
            className="text-sm"
            style={{
              color: template_data?.secondaryColor || '#4b5563',
              fontFamily: template_data?.fontFamily || 'serif',
            }}
          >
            Completed on: {completionDate}
          </p>
        </div>

        {/* Footer */}
        <div
          className="mt-6 border-t pt-4"
          style={{
            borderColor: template_data?.borderColor || '#f59e0b',
          }}
        >
          <p
            className="text-sm"
            style={{
              color: template_data?.secondaryColor || '#4b5563',
              fontFamily: template_data?.fontFamily || 'serif',
            }}
          >
            {template_data?.footerText || 'Authorized Certificate'}
          </p>
        </div>
      </div>
    </div>
  )
}
