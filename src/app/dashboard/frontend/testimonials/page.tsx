'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TestimonialsSectionEditor from '@/components/dashboard/TestimonialsSectionEditor'

export default function TestimonialsAdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <TestimonialsSectionEditor />
      </div>
    </DashboardLayout>
  )
}
