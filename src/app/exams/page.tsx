'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Grid,
  List,
  Filter,
  X,
  Award,
  Clock,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import ExamCard, { ExamData } from '@/components/cards/ExamCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { EXAMS_DATA } from '@/lib/data/exams'

export default function ExamsPage() {
  const [examsList, setExamsList] = useState<ExamData[]>(EXAMS_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedPricing, setSelectedPricing] = useState<string[]>([])
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  React.useEffect(() => {
    fetch('/api/exams?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.exams) && data.exams.length > 0) {
          setExamsList(
            data.exams.map((e: any) => ({
              id: e.id,
              title: e.title,
              slug: e.slug,
              thumbnail: e.thumbnail || '/assets/images/students-1.jpg',
              level: e.level || 'all',
              duration_minutes: Number(e.duration_minutes || e.duration || 90),
              total_questions: Number(e.total_questions || e.questions_count || 10),
              pass_mark: Number(e.pass_mark || 70),
              price: Number(e.price || 0),
              discount: Boolean(e.discount),
              discount_price: e.discount_price ? Number(e.discount_price) : null,
              pricing_type: e.pricing_type || (e.price > 0 ? 'paid' : 'free'),
              instructor_name: e.instructor_name || 'Expert Instructor',
              instructor_photo: e.instructor_photo || '',
              category_name: e.category_name || 'Certification',
              short_description: e.short_description || '',
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    examsList.forEach((e) => {
      if (e.category_name) set.add(e.category_name)
    })
    return ['All', ...Array.from(set)]
  }, [examsList])

  const levels = ['beginner', 'intermediate', 'advanced']
  const pricingOptions = ['free', 'paid']

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const togglePricing = (pricing: string) => {
    setSelectedPricing(prev =>
      prev.includes(pricing) ? prev.filter(p => p !== pricing) : [...prev, pricing]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedLevels([])
    setSelectedPricing([])
  }

  const filteredExams = useMemo(() => {
    return examsList.filter(exam => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = exam.title.toLowerCase().includes(query)
        const matchesDesc = exam.short_description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDesc) return false
      }

      // Category
      if (selectedCategory !== 'All' && exam.category_name !== selectedCategory) {
        return false
      }

      // Level
      if (selectedLevels.length > 0 && exam.level && !selectedLevels.includes(exam.level)) {
        return false
      }

      // Pricing
      if (selectedPricing.length > 0) {
        const isFree = exam.pricing_type === 'free' || (exam.price ?? 0) === 0
        if (selectedPricing.includes('free') && !isFree && !selectedPricing.includes('paid')) return false
        if (selectedPricing.includes('paid') && isFree && !selectedPricing.includes('free')) return false
      }

      return true
    })
  }, [searchQuery, selectedCategory, selectedLevels, selectedPricing])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Banner */}
      <div className="border-b border-border bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Exams</span>
            {selectedCategory !== 'All' && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Certification & Practice Exams
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Validate your professional skills with industry-standard timed assessments, detailed performance analytics, and verified credentials.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Filter Exams</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span>{cat}</span>
                    <span className="text-xs opacity-75">
                      {cat === 'All' ? EXAMS_DATA.length : EXAMS_DATA.filter(e => e.category_name === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Difficulty Level
              </h3>
              <div className="space-y-2.5">
                {levels.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={() => toggleLevel(level)}
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="text-sm font-medium capitalize cursor-pointer text-foreground"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Pricing
              </h3>
              <div className="space-y-2.5">
                {pricingOptions.map(p => (
                  <div key={p} className="flex items-center space-x-2">
                    <Checkbox
                      id={`price-${p}`}
                      checked={selectedPricing.includes(p)}
                      onCheckedChange={() => togglePricing(p)}
                    />
                    <Label
                      htmlFor={`price-${p}`}
                      className="text-sm font-medium capitalize cursor-pointer text-foreground"
                    >
                      {p === 'free' ? 'Free Assessments' : 'Paid Certifications'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search exams by title or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex items-center gap-1.5 border-border"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {(selectedCategory !== 'All' || selectedLevels.length > 0 || selectedPricing.length > 0) && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>

                <div className="text-sm text-muted-foreground hidden sm:block">
                  Showing <span className="font-semibold text-foreground">{filteredExams.length}</span> exams
                </div>

                <div className="flex items-center border border-border rounded-lg p-0.5 bg-card">
                  <button
                    onClick={() => setViewType('grid')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      viewType === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      viewType === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer / Collapsible */}
            {isMobileFilterOpen && (
              <div className="lg:hidden mb-6 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-bold text-sm">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsMobileFilterOpen(false)} className="h-7 w-7 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-full font-medium',
                          selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exams Grid / List */}
            {filteredExams.length > 0 ? (
              <div className={cn(
                viewType === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredExams.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    viewType={viewType}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
                <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground">No exams match your criteria</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, difficulty levels, or selecting another category.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                  Reset all filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
