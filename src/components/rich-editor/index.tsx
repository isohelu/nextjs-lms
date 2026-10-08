'use client'

/**
 * Rich Editor — wraps the TipTap-based RichEditor component from `@/components/ui/rich-editor`
 * and exposes it with the exact same API that Laravel imports from `@/components/rich-editor`.
 *
 * Both `Editor` (editable) and `Renderer` (read-only HTML) are exported.
 */

import React, { forwardRef } from 'react'
import RichEditor, { type RichEditorProps } from '@/components/ui/rich-editor'

// ── Editor (editable) ────────────────────────────────────────────────────────

export interface EditorProps extends RichEditorProps {}

export const Editor = forwardRef<any, EditorProps>(function Editor(props, ref) {
  return <RichEditor {...props} />
})

// ── Renderer (read-only HTML display) ────────────────────────────────────────

interface RendererProps {
  /** Raw HTML string to display */
  content?: string
  className?: string
}

export function Renderer({ content, className }: RendererProps) {
  if (!content) return null
  return (
    <div
      className={`rte-renderer prose prose-sm dark:prose-invert max-w-none leading-relaxed ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default Editor
