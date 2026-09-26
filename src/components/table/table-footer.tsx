'use client'

import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface TableFooterProps {
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export default function TableFooter({
  currentPage,
  total,
  pageSize,
  onPageChange,
  className,
}: TableFooterProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const from = total > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const to = Math.min(total, currentPage * pageSize)

  const pages: number[] = []
  for (let i = 1; i <= lastPage; i++) {
    pages.push(i)
  }

  return (
    <div
      className={cn(
        'border-t border-border bg-card/50 p-4 sm:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Entry stats summary */}
        <div className="text-center text-sm text-muted-foreground sm:text-left">
          Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
          <span className="font-semibold text-foreground">{to}</span> of{' '}
          <span className="font-semibold text-foreground">{total}</span> entries
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* First Page */}
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="h-8 w-8 transition-colors disabled:opacity-40"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 w-8 transition-colors disabled:opacity-40"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Dropdown Selector */}
          <div className="mx-1 flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Page</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 min-w-13 px-2 font-medium transition-colors hover:bg-accent"
                >
                  {currentPage}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="max-h-56 overflow-y-auto min-w-15">
                {pages.map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={cn(
                      'cursor-pointer text-center justify-center font-medium',
                      currentPage === p && 'bg-primary/10 text-primary font-bold'
                    )}
                  >
                    {p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted-foreground">of {lastPage}</span>
          </div>

          {/* Next Page */}
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 w-8 transition-colors disabled:opacity-40"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(lastPage)}
            className="h-8 w-8 transition-colors disabled:opacity-40"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
