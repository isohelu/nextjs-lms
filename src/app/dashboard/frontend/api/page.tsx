'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FileCode,
  Sparkles,
  CheckCircle2,
  Layers,
  Save,
  Info
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardFrontendApiPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'exams' | 'blogs' | 'instructors'>('courses')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/frontend/pages" className="hover:text-foreground">Frontend</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Page API</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Frontend Collections API</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure dynamic homepage carousel collections (Top Rated, Best Seller, New Releases, Featured).
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Frontend collection preferences updated successfully!</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {(['courses', 'exams', 'blogs', 'instructors'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`capitalize text-xs font-semibold rounded-lg ${
                activeTab === tab ? 'bg-[#007867] hover:bg-[#007867]/90 text-white' : ''
              }`}
            >
              {tab} Collections
            </Button>
          ))}
        </div>

        {/* Collections Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm">Best Selection (Hero Feature)</h3>
              <Badge variant="outline">Single Item</Badge>
            </div>
            <p className="text-xs text-muted-foreground">The primary highlight item on the homepage showcase banner.</p>
            <select className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs">
              <option>Default System Top Rated</option>
              <option>Manual Selection #1</option>
              <option>Manual Selection #2</option>
            </select>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm">Top Rated Strip (Carousel)</h3>
              <Badge variant="outline">Up to 8 Items</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Appears in the &apos;Most Popular&apos; carousel strip across all home styles.</p>
            <select className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs">
              <option>Dynamic Algorithm (Highest Reviews)</option>
              <option>Editorial Choice Only</option>
            </select>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm">New Releases (Latest)</h3>
              <Badge variant="outline">Automatic Date Order</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Automatically ordered by publication date.</p>
            <select className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs">
              <option>Newest First (DESC)</option>
              <option>Oldest First (ASC)</option>
            </select>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm">Featured Section</h3>
              <Badge variant="outline">Curated Tag</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Items marked with the &apos;Featured&apos; badge in curriculum.</p>
            <select className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs">
              <option>Include All Featured Items</option>
              <option>Randomize on Page Load</option>
            </select>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold">
            <Save className="h-4 w-4 mr-2" />
            Save Collection Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
