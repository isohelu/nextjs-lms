'use client'

import React, { useState, useEffect, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Grid, List, ListFilter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ProductCard from '@/components/cards/ProductCard'
import ProductFilter, { CategoryItem } from '@/components/store/ProductFilter'
import TablePagination from '@/components/store/TablePagination'
import { cn } from '@/lib/utils'

export default function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const initialCategory = searchParams.get('category') || 'all'
  const initialPrice = searchParams.get('price') || 'all'
  const initialSort = searchParams.get('sort') || 'newest'
  const initialSearch = searchParams.get('products_search') || searchParams.get('search') || ''
  const initialPage = parseInt(searchParams.get('page') || searchParams.get('products_page') || '1', 10)
  const initialView = (searchParams.get('view') as 'grid' | 'list') || 'grid'

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedPrice, setSelectedPrice] = useState(initialPrice)
  const [selectedSort, setSelectedSort] = useState(initialSort)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [viewType, setViewType] = useState<'grid' | 'list'>(initialView)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Fetch categories
  useEffect(() => {
    fetch('/api/product-categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data)
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
  }, [])

  // Sync state with URL params
  const updateUrlAndFetch = useCallback(
    (params: {
      category?: string
      price?: string
      sort?: string
      search?: string
      page?: number
      view?: 'grid' | 'list'
    }) => {
      const cat = params.category !== undefined ? params.category : selectedCategory
      const prc = params.price !== undefined ? params.price : selectedPrice
      const srt = params.sort !== undefined ? params.sort : selectedSort
      const srch = params.search !== undefined ? params.search : searchTerm
      const pg = params.page !== undefined ? params.page : 1
      const vw = params.view !== undefined ? params.view : viewType

      const query = new URLSearchParams()
      if (cat && cat !== 'all') query.set('category', cat)
      if (prc && prc !== 'all') query.set('price', prc)
      if (srt && srt !== 'newest') query.set('sort', srt)
      if (srch && srch.trim()) query.set('products_search', srch.trim())
      if (pg > 1) query.set('products_page', pg.toString())
      if (vw !== 'grid') query.set('view', vw)

      const queryString = query.toString()
      startTransition(() => {
        router.push(queryString ? `/products?${queryString}` : '/products', { scroll: false })
      })

      // Fetch products from API
      setIsLoading(true)
      const fetchUrl = `/api/products?limit=12&page=${pg}${
        cat && cat !== 'all' ? `&category=${cat}` : ''
      }${prc && prc !== 'all' ? `&price=${prc}` : ''}${
        srt ? `&sort=${srt}` : ''
      }${srch ? `&products_search=${encodeURIComponent(srch.trim())}` : ''}`

      fetch(fetchUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products)) {
            setProducts(data.products)
            setTotalProducts(data.total || 0)
            setTotalPages(data.totalPages || 1)
            setCurrentPage(pg)
          }
        })
        .catch((err) => console.error('Failed to fetch products:', err))
        .finally(() => setIsLoading(false))
    },
    [selectedCategory, selectedPrice, selectedSort, searchTerm, viewType, router]
  )

  // Initial fetch on mount
  useEffect(() => {
    updateUrlAndFetch({
      category: initialCategory,
      price: initialPrice,
      sort: initialSort,
      search: initialSearch,
      page: initialPage,
      view: initialView,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    updateUrlAndFetch({ category: slug, page: 1 })
  }

  const handlePriceChange = (price: string) => {
    setSelectedPrice(price)
    updateUrlAndFetch({ price, page: 1 })
  }

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
    updateUrlAndFetch({ sort, page: 1 })
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    updateUrlAndFetch({ search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrlAndFetch({ page })
  }

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewType(view)
    updateUrlAndFetch({ view })
  }

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory)

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 flex items-start gap-6 py-6">
      {/* Desktop Left Sticky Sidebar Filter matching Laravel */}
      <div className="hidden lg:block w-64 shrink-0">
        <Card className="sticky top-24 p-4 border border-border">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            selectedPrice={selectedPrice}
            selectedSort={selectedSort}
            searchTerm={searchTerm}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearchChange}
          />
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Header matching Laravel Layout */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Filter Sheet */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="cursor-pointer">
                    <ListFilter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] border-border p-0">
                  <ScrollArea className="h-full p-4">
                    <ProductFilter
                      categories={categories}
                      selectedCategory={selectedCategory}
                      selectedPrice={selectedPrice}
                      selectedSort={selectedSort}
                      searchTerm={searchTerm}
                      onCategoryChange={handleCategoryChange}
                      onPriceChange={handlePriceChange}
                      onSortChange={handleSortChange}
                      onSearchChange={handleSearchChange}
                      setOpen={setMobileOpen}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>

            <div>
              <h2 className="text-lg font-semibold capitalize md:text-2xl md:font-bold text-foreground">
                {currentCategoryObj ? currentCategoryObj.title : 'All'} Products
              </h2>
              {currentCategoryObj?.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentCategoryObj.description}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Showing {totalProducts} digital educational resources
                </p>
              )}
            </div>
          </div>

          {/* Grid & List View Toggle Buttons */}
          <div className="flex gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={viewType === 'grid' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('grid')}
                    className="cursor-pointer"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={viewType === 'list' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('list')}
                    className="cursor-pointer"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Product Grid / List */}
        {isLoading ? (
          <div
            className={cn(
              viewType === 'list'
                ? 'space-y-7'
                : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="h-72 animate-pulse bg-muted/60 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className={cn(
              viewType === 'list'
                ? 'space-y-7'
                : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  thumbnail: product.thumbnail || '/assets/images/blank-image.jpg',
                  price: Number(product.price || 0),
                  discount: Boolean(product.discount),
                  discount_price: product.discount_price ? Number(product.discount_price) : null,
                  pricing_type: product.pricing_type || (product.price > 0 ? 'paid' : 'free'),
                  category_name: product.category_title || 'Design & Code',
                  category_slug: product.category_slug || 'all',
                  average_rating: Number(product.average_rating || 5.0),
                  reviews_count: Number(product.reviews_count || 0),
                  instructor_name: product.instructor_name || 'System Administrator',
                  instructor_photo: product.instructor_photo || null,
                  product_category: {
                    title: product.category_title,
                    slug: product.category_slug,
                  },
                  instructor: {
                    user: {
                      name: product.instructor_name || 'System Administrator',
                      photo: product.instructor_photo || null,
                    },
                  },
                }}
                viewType={viewType}
              />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-muted-foreground border border-border">
            No products found
          </Card>
        )}

        {/* TableFooter Pagination matching Laravel */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalProducts}
          itemsPerPage={12}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      </div>
    </div>
  )
}
