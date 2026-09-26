'use client'

import React, { useState, useEffect, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import InputError from '@/components/input-error'

interface Props {
  value?: string
  maxTags?: number
  whitelist?: string[]
  placeholder?: string
  onChange?: (values: string[]) => void
  enforceWhitelist?: boolean
  defaultTags?: string[]
  className?: string
  change?: boolean
}

const TagInput = ({
  value,
  maxTags = 10,
  placeholder = 'Enter tags...',
  onChange,
  defaultTags = [],
  className,
}: Props) => {
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (defaultTags && defaultTags.length > 0) {
      setTags(defaultTags)
    }
  }, [defaultTags])

  const addTag = (tagText: string) => {
    const trimmed = tagText.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      setError('Tag already exists')
      return
    }
    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`)
      return
    }
    const newTags = [...tags, trimmed]
    setTags(newTags)
    setInputValue('')
    setError('')
    onChange?.(newTags)
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, i) => i !== indexToRemove)
    setTags(newTags)
    setError('')
    onChange?.(newTags)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="w-full space-y-1.5">
      <div
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow]',
          'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
          className
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue)
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-30 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
      </div>
      {error && <InputError message={error} />}
    </div>
  )
}

export default TagInput
