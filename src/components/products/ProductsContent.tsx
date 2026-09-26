'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/cards/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Grid,
  List,
  ListFilter,
  Star,
  Check,
  X,
  SlidersHorizontal,
  Home,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRODUCTS_DATA, getAllCategories } from '@/lib/data/products'

export default function ProductsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const [productsList, setProductsList] = useState<any[]>(() =>
    PRODUCTS_DATA.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      thumbnail: p.thumbnail,
      price: p.price,
      discount: p.discount,
      discount_price: p.discount_price,
      pricing_type: p.pricing_type,
      category_name: p.product_category?.title || 'Design & Code',
      category_slug: p.product_category?.slug || 'all',
      average_rating: p.average_rating,
      reviews_count: p.reviews_count,
      instructor_name: p.instructor?.user?.name || 'Instructor',
      instructor_photo: p.instructor?.user?.photo || '',
      downloads_count: (p as any).downloads_count || 0,
      file_format: (p as any).file_format || 'ZIP',
      summary: p.summary || '',
    }))
  )

  React.useEffect(() => {
    fetch('/api/products?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(
            data.products.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              thumbnail: p.thumbnail || '/assets/images/blank-image.jpg',
              price: Number(p.price || 0),
              discount: Boolean(p.discount),
              discount_price: p.discount_price ? Number(p.discount_price) : null,
              pricing_type: p.pricing_type || (p.price > 0 ? 'paid' : 'free'),
              category_name: p.category_name || 'Design & Code',
              category_slug: p.category_slug || 'all',
              average_rating: Number(p.average_rating || 5.0),
              reviews_count: Number(p.reviews_count || 0),
              instructor_name: p.instructor_name || 'Instructor',
              instructor_photo: p.instructor_photo || '',
              downloads_count: Number(p.downloads_count || 0),
              file_format: p.file_format || 'ZIP',
              summary: p.summary || '',
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const categories = useMemo(() => {
    const map = new Map<string, { id: number; title: string; slug: string; count: number }>()
    productsList.forEach((p, idx) => {
      const slug = p.category_slug || 'all'
      const title = p.category_name || 'Design & Code'
      if (!map.has(slug)) {
        map.set(slug, { id: idx + 1, title, slug, count: 1 })
      } else {
        map.get(slug)!.count += 1
      }
    })
    return [
      { id: 0, title: 'All Categories', slug: 'all', count: productsList.length },
      ...Array.from(map.values()),
    ]
  }, [productsList])

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesTitle = p.title?.toLowerCase().includes(query)
        const matchesSummary = p.summary?.toLowerCase().includes(query)
        const matchesAuthor = p.instructor_name?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesSummary && !matchesAuthor) return false
      }

      // Category
      if (selectedCategory !== 'all' && p.category_slug !== selectedCategory) {
        return false
      }

      // Price filter
      if (priceFilter === 'free' && p.pricing_type !== 'free') return false
      if (priceFilter === 'paid' && p.pricing_type === 'free') return false

      // Rating
      if (minRating > 0 && (p.average_rating || 0) < minRating) return false

      return true
    })
  }, [productsList, searchTerm, selectedCategory, priceFilter, minRating])

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory)

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceFilter('all')
    setMinRating(0)
  }

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'all' || priceFilter !== 'all' || minRating > 0

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-muted/20 py-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Store</span>
          {selectedCategory !== 'all' && activeCategoryObj && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-primary font-medium">{activeCategoryObj.title}</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="flex items-start gap-8">
          {/* Desktop Left Sidebar Filter */}
          <Card className="hidden lg:block w-72 shrink-0 p-5 sticky top-24 border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Categories</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer',
                      selectedCategory === cat.slug
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span>{cat.title}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px]',
                        selectedCategory === cat.slug
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Pricing</label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {(['all', 'free', 'paid'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceFilter(p)}
                    className={cn(
                      'rounded-md py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer',
                      priceFilter === p
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Rating</label>
              <div className="space-y-1">
                {[
                  { label: 'All Ratings', value: 0 },
                  { label: '4.8 & above', value: 4.8 },
                  { label: '4.5 & above', value: 4.5 },
                  { label: '4.0 & above', value: 4.0 },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setMinRating(r.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer',
                      minRating === r.value
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Star
                      className={cn(
                        'h-3.5 w-3.5',
                        minRating === r.value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                      )}
                    />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {selectedCategory === 'all' ? 'All Products' : activeCategoryObj?.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredProducts.length} digital educational resources
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-1.5"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <ListFilter className="h-4 w-4" />
                  Filters
                </Button>

                {/* Grid vs List View Buttons matching Laravel */}
                <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
                  <Button
                    size="icon"
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewType('grid')}
                    className="h-8 w-8 cursor-pointer"
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewType('list')}
                    className="h-8 w-8 cursor-pointer"
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer / Toggle Area */}
            {mobileFilterOpen && (
              <Card className="lg:hidden p-4 mb-6 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Filter Options</span>
                  <button type="button" onClick={() => setMobileFilterOpen(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setMobileFilterOpen(false)
                      }}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        selectedCategory === cat.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {cat.title} ({cat.count})
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Products Grid or List */}
            {filteredProducts.length > 0 ? (
              <div
                className={cn(
                  viewType === 'list'
                    ? 'space-y-6'
                    : 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
                )}
              >
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={{
                      id: prod.id,
                      title: prod.title,
                      slug: prod.slug,
                      thumbnail: prod.thumbnail,
                      price: prod.price,
                      discount: prod.discount,
                      discount_price: prod.discount_price,
                      pricing_type: prod.pricing_type,
                      category_name: prod.category_name || prod.product_category?.title || 'Design & Code',
                      average_rating: prod.average_rating,
                      reviews_count: prod.reviews_count,
                      instructor_name: prod.instructor_name || prod.instructor?.user?.name || 'Instructor',
                      instructor_photo: prod.instructor_photo || prod.instructor?.user?.photo || '',
                      downloads_count: prod.downloads_count || prod.orders_count || 0,
                      file_format: prod.file_format || prod.specifications?.[0]?.value || 'ZIP',
                      summary: prod.summary || '',
                    }}
                    viewType={viewType}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border border-border">
                <p className="text-base font-semibold text-foreground">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search criteria or resetting filters.
                </p>
                <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4">
                  Reset Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
