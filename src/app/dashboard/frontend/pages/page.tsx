'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Palette,
  Eye,
  ExternalLink,
  CheckCircle2,
  Layers,
  FileCode,
  Layout,
  Globe
} from 'lucide-react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const HOME_PAGES = [
  { id: 1, title: 'Home Style 1 (Default)', slug: '/', status: 'Active', hero: 'Hero Modern Gradient with CTA' },
  { id: 2, title: 'Home Style 2 (Corporate)', slug: '/demo/home-2', status: 'Available', hero: 'Dark Theme High-Impact Carousel' },
  { id: 3, title: 'Home Style 3 (Interactive)', slug: '/demo/home-3', status: 'Available', hero: 'Split Hero with Featured Categories' },
  { id: 4, title: 'Home Style 4 (University)', slug: '/demo/home-4', status: 'Available', hero: 'Academic Card Grid with Counter Stats' },
  { id: 5, title: 'Home Style 5 (Modern LMS)', slug: '/demo/home-5', status: 'Available', hero: 'Floating Badges & Course Preview Strip' },
]

const INNER_PAGES = [
  { id: 101, title: 'About Us', slug: '/about-us', type: 'Public Info' },
  { id: 102, title: 'Contact Us', slug: '/contact-us', type: 'Support' },
  { id: 103, title: 'Our Team & Leadership', slug: '/our-team', type: 'Public Info' },
  { id: 104, title: 'Careers & Hiring', slug: '/careers', type: 'Company' },
  { id: 105, title: 'Job Circulars', slug: '/job-circulars', type: 'Recruitment' },
  { id: 106, title: 'Privacy Policy', slug: '/privacy-policy', type: 'Legal' },
  { id: 107, title: 'Terms and Conditions', slug: '/terms-and-conditions', type: 'Legal' },
  { id: 108, title: 'Refund Policy', slug: '/refund-policy', type: 'Legal' },
  { id: 109, title: 'Cookie Policy', slug: '/cookie-policy', type: 'Legal' },
]

export default function DashboardFrontendPagesPage() {
  const [activeHomeId, setActiveHomeId] = useState(1)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs
          title="Pages"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Frontend Pages' },
          ]}
          className="mb-4"
        />

        {/* Home Pages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Home Page Variations (5 Presets)</h2>
              <p className="text-xs text-muted-foreground">Select the active landing page design for your LMS storefront.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOME_PAGES.map((page) => {
              const isSelected = activeHomeId === page.id
              return (
                <Card
                  key={page.id}
                  className={`p-5 border shadow-xs transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#007867] ring-1 ring-[#007867]/30 bg-[#007867]/2'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-[#007867]/10 flex items-center justify-center text-[#007867]">
                        <Layout className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {isSelected ? 'Active Homepage' : 'Available'}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{page.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{page.hero}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <Button
                      variant={isSelected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setActiveHomeId(page.id)}
                      className="text-xs h-8"
                    >
                      {isSelected ? 'Current Active' : 'Activate'}
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs text-[#007867] hover:text-[#007867]">
                      <Link href={page.slug} target="_blank">
                        Preview <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Inner Pages Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Inner & Legal Pages</h2>
            <p className="text-xs text-muted-foreground">Pre-built informational and policy templates.</p>
          </div>

          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Page Title</th>
                    <th className="py-3 px-4">URL Route</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INNER_PAGES.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {page.title}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {page.slug}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {page.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          Published
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#007867] hover:text-[#007867]">
                          <Link href={page.slug} target="_blank">
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
