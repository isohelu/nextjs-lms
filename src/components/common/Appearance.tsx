'use client'

import React, { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppearance, initializeTheme } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  buttonClass?: string
}

export default function Appearance({ className, buttonClass, ...props }: Props) {
  const { appearance, updateAppearance } = useAppearance()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initializeTheme()
    setMounted(true)
  }, [])

  const getCurrentIcon = () => {
    if (!mounted) return <Monitor className="!h-5 !w-5" />
    switch (appearance) {
      case 'dark':
        return <Moon className="!h-5 !w-5" />
      case 'light':
        return <Sun className="!h-5 !w-5" />
      default:
        return <Monitor className="!h-5 !w-5" />
    }
  }

  return (
    <div className={className} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn('h-9 w-9 rounded-full', buttonClass)}
          >
            {getCurrentIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => updateAppearance('light')}
            className="cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Light
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateAppearance('dark')}
            className="cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Dark
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateAppearance('system')}
            className="cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
