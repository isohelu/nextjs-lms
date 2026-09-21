'use client'

import React, { useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface LanguageItem {
  id: number
  code: string
  name: string
  flag?: string
  is_active: boolean
}

const defaultLanguages: LanguageItem[] = [
  { id: 1, code: 'en', name: 'English', flag: '🇺🇸', is_active: true },
  { id: 2, code: 'es', name: 'Spanish', flag: '🇪🇸', is_active: true },
  { id: 3, code: 'fr', name: 'French', flag: '🇫🇷', is_active: true },
  { id: 4, code: 'de', name: 'German', flag: '🇩🇪', is_active: true },
  { id: 5, code: 'ar', name: 'Arabic', flag: '🇸🇦', is_active: true },
]

export default function Language() {
  const [locale, setLocale] = useState('en')
  const currentLang = defaultLanguages.find((l) => l.code === locale) || defaultLanguages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer outline-none">
        <Button
          size="icon"
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-transparent p-0 text-lg"
        >
          {currentLang?.flag ? (
            <span aria-hidden="true">{currentLang.flag}</span>
          ) : (
            <Globe className="!h-5 !w-5" />
          )}
          <span className="sr-only">
            {currentLang?.name ?? 'Select language'}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[160px]">
        {defaultLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.id}
            className="cursor-pointer justify-between gap-2 px-3"
            onClick={() => setLocale(lang.code)}
          >
            <span className="flex items-center gap-2">
              {lang.flag && <span aria-hidden="true">{lang.flag}</span>}
              {lang.name}
            </span>
            {lang.code === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
