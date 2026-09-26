'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { EllipsisVertical, Pencil, Trash2, Eye, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ActionRoute {
  label: string
  route?: string
  method: 'get' | 'put' | 'delete'
  message?: string
  role?: boolean
  onClick?: () => void | Promise<void>
}

interface ActionsDropdownProps {
  icon?: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  routes?: ActionRoute[]
  component?: ReactNode
  className?: string
  onDeleteSuccess?: () => void | Promise<void>
}

export default function ActionsDropdown({
  icon = <EllipsisVertical className="h-4 w-4" />,
  side = 'left',
  routes,
  component,
  className,
  onDeleteSuccess,
}: ActionsDropdownProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pendingDeleteAction, setPendingDeleteAction] = useState<ActionRoute | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteTrigger = (route: ActionRoute) => {
    setPendingDeleteAction(route)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAction) return
    setDeleting(true)
    try {
      if (pendingDeleteAction.onClick) {
        await pendingDeleteAction.onClick()
      } else if (pendingDeleteAction.route) {
        const res = await fetch(pendingDeleteAction.route, { method: 'DELETE' })
        if (res.ok && onDeleteSuccess) {
          await onDeleteSuccess()
        }
      }
      if (pendingDeleteAction.onClick && onDeleteSuccess) {
        await onDeleteSuccess()
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
      setPendingDeleteAction(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            {icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} align="end" className={cn('w-44 p-1.5', className)}>
          <DropdownMenuGroup className="space-y-1">
            {component}

            {routes?.map((route, index) => {
              if (route.role === false) {
                return null
              }

              if (route.method === 'delete') {
                return (
                  <DropdownMenuItem
                    key={index}
                    className="h-8 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 text-xs"
                    onSelect={(e) => {
                      e.preventDefault()
                      handleDeleteTrigger(route)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-destructive" />
                    <span>{route.label}</span>
                  </DropdownMenuItem>
                )
              }

              const Icon = route.method === 'get' && route.label.toLowerCase() === 'view' ? Eye : Pencil

              if (route.onClick) {
                return (
                  <DropdownMenuItem
                    key={index}
                    className="h-8 cursor-pointer gap-2 text-xs"
                    onClick={route.onClick}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{route.label}</span>
                  </DropdownMenuItem>
                )
              }

              return (
                <DropdownMenuItem key={index} className="h-8 cursor-pointer p-0 text-xs" asChild>
                  <Link
                    href={route.route || '#'}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{route.label}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-muted-foreground">
              {pendingDeleteAction?.message || 'Are you sure you want to delete this item? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
