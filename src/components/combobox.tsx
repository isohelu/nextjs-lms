'use client'

import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ComboboxItem {
  id?: number | string
  child_id?: number | string
  label: string
  value: string
}

interface ComboboxProps {
  data: ComboboxItem[]
  placeholder: string
  onSelect: (selected: ComboboxItem) => void
  defaultValue?: string
  name?: string
  className?: string
}

export default function Combobox({
  data = [],
  placeholder,
  onSelect,
  defaultValue = '',
  name,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  const filteredData = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedItem = data.find((item) => item.value === value)

  const handleSelect = (item: ComboboxItem) => {
    setValue(item.value)
    onSelect(item)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-10 w-full justify-between rounded-lg bg-transparent! px-3 py-2 text-sm font-normal transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground',
            !selectedItem && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverContent className="w-(--radix-popover-trigger-width) p-1.5" align="start">
        <div className="flex items-center border-b border-border/60 px-2.5 pb-2 pt-1">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto pt-1">
          {filteredData.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.value}
                onClick={() => handleSelect(item)}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs select-none transition-colors hover:bg-accent hover:text-accent-foreground',
                  value === item.value && 'bg-accent/70 font-medium'
                )}
              >
                <span className="truncate">{item.label}</span>
                {value === item.value && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
