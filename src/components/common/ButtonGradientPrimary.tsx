import React, { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps<typeof Button> {
  containerClass?: string
  shadow?: boolean
  shadowClass?: string
}

export default function ButtonGradientPrimary({
  children,
  className,
  shadow = true,
  shadowClass,
  containerClass,
  ...props
}: Props) {
  return (
    <div className={cn('relative inline-block', containerClass)}>
      {shadow && (
        <div
          className={cn(
            'btn-gradient-glow',
            shadowClass
          )}
        />
      )}

      <Button
        className={cn(
          'relative z-10 h-auto bg-linear-to-r from-primary to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white px-5 py-2.5 shadow-none transition-all',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}
