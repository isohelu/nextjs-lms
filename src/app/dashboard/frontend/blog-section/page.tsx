'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import BlogSectionEditor from '@/components/dashboard/BlogSectionEditor'

export default function BlogSectionAdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <BlogSectionEditor />
      </div>
    </DashboardLayout>
  )
}
