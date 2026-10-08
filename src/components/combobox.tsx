'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ComboboxData {
  id?: number | string
  child_id?: number | string
  label: string
  value: string
}

export type ComboboxItem = ComboboxData

interface Props {
  data: ComboboxData[]
  placeholder: string
  onSelect: (selected: ComboboxData) => void
  defaultValue?: string
  translate?: any
  name?: string
  change?: boolean
  className?: string
}

const Combobox = ({
  data,
  placeholder,
  onSelect,
  defaultValue,
  translate,
  name,
  change = false,
  className,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue || '')
  const [search, setSearch] = useState('')
  const initialRenderRef = useRef(true)

  useEffect(() => {
    const isInitial = initialRenderRef.current

    if (defaultValue && (isInitial || defaultValue !== value)) {
      const defaultItem = data.find((item) => item.value === defaultValue)

      if (defaultItem) {
        queueMicrotask(() => {
          setValue(defaultValue)
          if (!isInitial) {
            onSelect(defaultItem)
          }
        })
      }
    }

    initialRenderRef.current = false
  }, [defaultValue, data, value, onSelect])

  const handleSelect = (selected: ComboboxData) => {
    const newValue = selected.value === value ? '' : selected.value
    setValue(newValue)
    onSelect(selected)
    setOpen(false)
  }

  const selectedItem = data.find((item) => item.value === value)

  const filteredData = search.trim()
    ? data.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.value.toLowerCase().includes(search.toLowerCase())
      )
    : data

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between rounded-lg !bg-transparent text-xs font-normal transition-[color,box-shadow]',
            change
              ? 'hover:border-ring focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:border-ring data-[state=open]:ring-1 data-[state=open]:ring-ring'
              : 'hover:border-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900 data-[state=open]:border-zinc-900 data-[state=open]:ring-1 data-[state=open]:ring-zinc-900 dark:hover:border-zinc-50 dark:focus-visible:border-zinc-50 dark:focus-visible:ring-zinc-50 dark:data-[state=open]:border-zinc-50 dark:data-[state=open]:ring-zinc-50',
            className
          )}
        >
          <span className="truncate">{selectedItem ? selectedItem.label : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 shadow-lg border border-border bg-popover" align="start">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2 px-1">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={translate?.input?.search_placeholder || 'Search...'}
            className="w-full bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="max-h-[220px] overflow-y-auto mt-1 space-y-0.5">
          {filteredData.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">
              {translate?.frontend?.no_element_found || 'No results found.'}
            </p>
          ) : (
            filteredData.map((item) => (
              <button
                key={`${item.value}-${item.label}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  value === item.value && 'bg-accent/80 font-medium'
                )}
              >
                <span className="truncate">{item.label}</span>
                <Check
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-primary ml-2',
                    value === item.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Combobox
