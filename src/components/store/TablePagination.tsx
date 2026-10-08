'use client'

import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: TablePaginationProps) {
  if (totalItems === 0) return null

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  const pagesList = Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1)

  return (
    <div
      className={cn(
        'border-t border-border bg-card/50 p-4 sm:p-6 rounded-b-xl',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Entry stats summary matching Laravel */}
        <div className="text-center text-sm text-muted-foreground sm:text-left">
          Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
          <span className="font-semibold text-foreground">{to}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> entries
        </div>

        {/* Pagination Controls */}
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center justify-center gap-2">
            {/* First Page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(1)}
                  className="h-8 w-8 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>First Page</TooltipContent>
            </Tooltip>

            {/* Previous Page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="h-8 w-8 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous Page</TooltipContent>
            </Tooltip>

            {/* Page Dropdown Selector */}
            <div className="mx-1 flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Page</span>
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 min-w-[52px] px-2 font-medium transition-colors hover:bg-accent cursor-pointer"
                      >
                        {currentPage}
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent>Select Page</TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="center"
                  className="max-h-[200px] min-w-[65px] overflow-y-auto"
                >
                  {pagesList.map((pageNum) => (
                    <DropdownMenuItem
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={cn(
                        'justify-center text-center font-medium transition-colors cursor-pointer',
                        currentPage === pageNum && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {pageNum}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-muted-foreground">of {totalPages}</span>
            </div>

            {/* Next Page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="h-8 w-8 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next Page</TooltipContent>
            </Tooltip>

            {/* Last Page */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(totalPages)}
                  className="h-8 w-8 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Last Page</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
