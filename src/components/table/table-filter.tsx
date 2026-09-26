'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TableFilterProps {
  title?: string
  Icon?: React.ReactNode
  search?: string
  onSearchChange?: (val: string) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  tablePageSizes?: number[]
  component?: React.ReactNode
  className?: string
}

export default function TableFilter({
  title,
  Icon,
  search,
  onSearchChange,
  pageSize = 10,
  onPageSizeChange,
  tablePageSizes = [10, 15, 20, 25],
  component,
  className,
}: TableFilterProps) {
  return (
    <div
      className={cn(
        'items-center justify-between p-6 md:flex border-b border-border/60',
        className
      )}
    >
      <div className="flex items-center gap-5">
        {Icon && (
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-md text-primary">
            {Icon}
          </div>
        )}
        {title && (
          <p className="mb-4 text-lg font-semibold md:mb-0 text-foreground">
            {title}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
        {onSearchChange !== undefined && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-9 w-20 text-xs font-medium">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {tablePageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {component && component}
      </div>
    </div>
  )
}
