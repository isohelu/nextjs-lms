import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-semibold shadow-xs transition-colors active:scale-[0.98]',
        primary:
          'bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 font-semibold shadow-xs transition-colors active:scale-[0.98]',
        defaultBlack:
          'bg-zinc-900 text-zinc-50 shadow-xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98]',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 active:scale-[0.98]',
        outline:
          'border border-border hover:border-slate-400 bg-background shadow-xs hover:bg-accent/60 hover:text-accent-foreground active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-slate-950 dark:text-white underline-offset-4 hover:underline hover:text-slate-700 dark:hover:text-slate-200',
      },
      size: {
        default: 'h-10 px-5 py-2.5 has-[>svg]:px-3.5 text-sm sm:text-base',
        sm: 'h-8.5 rounded-md px-3.5 has-[>svg]:px-2.5 text-xs sm:text-sm',
        lg: 'h-11 rounded-lg px-6 has-[>svg]:px-4 text-base font-semibold',
        icon: 'size-10',
        'icon-sm': 'size-8.5',
        'icon-xs': 'size-7',
        'icon-lg': 'size-11',
        xs: 'h-7 px-2.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  change?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  change = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    change?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  const resolvedVariant = variant || 'default'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
