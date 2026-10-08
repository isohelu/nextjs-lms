'use client'

import { BubbleMenuPlugin, type BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { Editor } from '@tiptap/core'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export type BubbleMenuProps = {
  editor: Editor | null
  className?: string
  children: React.ReactNode
  pluginKey?: string
  shouldShow?: (props: {
    editor: Editor
    element: HTMLElement
    view: any
    state: any
    oldState?: any
    from: number
    to: number
  }) => boolean
  updateDelay?: number
  resizeDelay?: number
  appendTo?: HTMLElement | (() => HTMLElement)
  options?: any
}

export const BubbleMenu = ({
  editor,
  className,
  children,
  pluginKey = 'bubbleMenu',
  shouldShow,
  updateDelay = 100,
  resizeDelay = 50,
  appendTo,
  options = {},
}: BubbleMenuProps) => {
  const [menuElement] = useState<HTMLDivElement>(() => {
    if (typeof document !== 'undefined') {
      return document.createElement('div')
    }
    return null as any
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed || !menuElement) {
      return
    }

    const plugin = BubbleMenuPlugin({
      editor,
      element: menuElement,
      pluginKey,
      shouldShow: shouldShow ?? null,
      updateDelay,
      resizeDelay,
      appendTo,
      options,
    })

    editor.registerPlugin(plugin)

    return () => {
      editor.unregisterPlugin(pluginKey)
      if (menuElement && menuElement.parentNode) {
        menuElement.parentNode.removeChild(menuElement)
      }
    }
  }, [editor, menuElement, pluginKey, shouldShow, updateDelay, resizeDelay, appendTo, options])

  if (!menuElement) return null

  return createPortal(
    <div className={cn('rte-bubble-menu', className)}>{children}</div>,
    menuElement
  )
}

export default BubbleMenu
