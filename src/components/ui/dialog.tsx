"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> & {
    render?: React.ReactElement
  }
>(({ render, children, asChild, ...props }, ref) => {
  if (render) {
    return (
      <DialogPrimitive.Trigger ref={ref} asChild {...props}>
        {render}
      </DialogPrimitive.Trigger>
    )
  }
  return (
    <DialogPrimitive.Trigger ref={ref} asChild={asChild} {...props}>
      {children}
    </DialogPrimitive.Trigger>
  )
})
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
    preventOutsideClose?: boolean
  }
>(({ className, children, showCloseButton = true, preventOutsideClose = true, onPointerDownOutside, onInteractOutside, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement | null
        if (
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('[data-slot="select-content"]') ||
          target?.closest('[data-slot="popover-content"]') ||
          target?.closest('[role="listbox"]') ||
          target?.closest('[role="option"]') ||
          target?.closest('[role="menu"]') ||
          target?.closest('[data-radix-select-viewport]')
        ) {
          e.preventDefault()
          return
        }
        if (preventOutsideClose) {
          e.preventDefault()
        }
        onPointerDownOutside?.(e)
      }}
      onInteractOutside={(e) => {
        const target = e.target as HTMLElement | null
        if (
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('[data-slot="select-content"]') ||
          target?.closest('[data-slot="popover-content"]') ||
          target?.closest('[role="listbox"]') ||
          target?.closest('[role="option"]') ||
          target?.closest('[role="menu"]') ||
          target?.closest('[data-radix-select-viewport]')
        ) {
          e.preventDefault()
          return
        }
        if (preventOutsideClose) {
          e.preventDefault()
        }
        onInteractOutside?.(e)
      }}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 text-sm text-card-foreground shadow-xl duration-150 outline-none sm:max-w-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-header"
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "-mx-6 -mb-6 mt-2 flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/40 p-4 sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  >
    {children}
    {showCloseButton && (
      <DialogPrimitive.Close asChild>
        <button type="button" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
          Close
        </button>
      </DialogPrimitive.Close>
    )}
  </div>
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(
      "font-heading text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
