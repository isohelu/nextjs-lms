'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface CategoryItem {
  id: number
  title: string
  slug: string
  description?: string | null
  products_count?: number
}

interface ProductFilterProps {
  categories: CategoryItem[]
  selectedCategory: string
  selectedPrice: string
  selectedSort: string
  searchTerm: string
  onCategoryChange: (slug: string) => void
  onPriceChange: (price: string) => void
  onSortChange: (sort: string) => void
  onSearchChange: (search: string) => void
  setOpen?: (open: boolean) => void
}

export default function ProductFilter({
  categories,
  selectedCategory,
  selectedPrice,
  selectedSort,
  searchTerm,
  onCategoryChange,
  onPriceChange,
  onSortChange,
  onSearchChange,
  setOpen,
}: ProductFilterProps) {
  return (
    <div className="space-y-6">
      {/* Search Input matching Laravel SearchInput */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="flex h-10 w-full min-w-0 rounded-lg border border-input bg-transparent py-[15px] pr-4 pl-10 text-sm font-normal text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Search className="absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold text-sm text-foreground">Categories</h3>
        <RadioGroup value={selectedCategory || 'all'} className="space-y-2">
          <p
            className="flex items-center cursor-pointer text-sm text-foreground hover:text-primary transition-colors"
            onClick={() => {
              onCategoryChange('all')
              if (setOpen) setOpen(false)
            }}
          >
            <RadioGroupItem
              className="cursor-pointer"
              id="category-all"
              value="all"
            />
            <label htmlFor="category-all" className="cursor-pointer pl-2.5 flex-1">
              All
            </label>
          </p>

          {categories
            .filter((c) => c.slug !== 'default')
            .map((c) => (
              <p
                key={c.id}
                className="flex items-center capitalize cursor-pointer text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => {
                  onCategoryChange(c.slug)
                  if (setOpen) setOpen(false)
                }}
              >
                <RadioGroupItem
                  className="cursor-pointer"
                  id={`category-${c.id}`}
                  value={c.slug}
                />
                <label
                  htmlFor={`category-${c.id}`}
                  className="cursor-pointer pl-2.5 flex-1"
                >
                  {c.title}
                </label>
              </p>
            ))}
        </RadioGroup>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 font-semibold text-sm text-foreground">Price</h3>
        <RadioGroup value={selectedPrice || 'all'} className="space-y-2">
          {['all', 'free', 'paid'].map((price) => (
            <p
              key={price}
              className="flex items-center capitalize cursor-pointer text-sm text-foreground hover:text-primary transition-colors"
              onClick={() => {
                onPriceChange(price)
                if (setOpen) setOpen(false)
              }}
            >
              <RadioGroupItem
                className="cursor-pointer"
                value={price}
                id={`price-${price}`}
              />
              <label
                htmlFor={`price-${price}`}
                className="cursor-pointer pl-2.5 capitalize flex-1"
              >
                {price}
              </label>
            </p>
          ))}
        </RadioGroup>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="mb-3 font-semibold text-sm text-foreground">Sort By</h3>
        <RadioGroup value={selectedSort || 'newest'} className="space-y-2">
          {[
            { value: 'newest', label: 'Newest' },
            { value: 'expensive', label: 'Highest Price' },
            { value: 'inexpensive', label: 'Lowest Price' },
            { value: 'bestsellers', label: 'Bestsellers' },
            { value: 'best_rates', label: 'Top Rated' },
          ].map((sort) => (
            <p
              key={sort.value}
              className="flex items-center cursor-pointer text-sm text-foreground hover:text-primary transition-colors"
              onClick={() => {
                onSortChange(sort.value)
                if (setOpen) setOpen(false)
              }}
            >
              <RadioGroupItem
                className="cursor-pointer"
                value={sort.value}
                id={`sort-${sort.value}`}
              />
              <label
                htmlFor={`sort-${sort.value}`}
                className="cursor-pointer pl-2.5 flex-1"
              >
                {sort.label}
              </label>
            </p>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
