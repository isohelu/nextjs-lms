'use client'

/**
 * Rich Editor — wraps the TipTap-based RichEditor component from `@/components/ui/rich-editor`
 * and exposes it with the same API that the codebase imports from `@/components/rich-editor`.
 *
 * Both `Editor` (editable) and `Renderer` (read-only HTML) are exported.
 */

import RichEditor, { type RichEditorProps } from '@/components/ui/rich-editor'

// ── Editor (editable) ────────────────────────────────────────────────────────

export interface EditorProps {
  /** Current HTML string value */
  value?: string
  /** Called whenever the editor content changes */
  onContentChange?: (value: string) => void
  onChange?: (value: string) => void
  /** Placeholder text for the empty state */
  placeholder?: { paragraph?: string; imageCaption?: string } | string
  /** Minimum height in px */
  contentMinHeight?: number | string
  contentMaxHeight?: number | string
  /** Pre-populate content (used when value is not controlled) */
  initialContent?: string
  /** Extra class on the container */
  containerClass?: string
  /** If true, render as read-only */
  readonly?: boolean
  disabled?: boolean
  /** Legacy props — accepted but ignored (parity with old Editor API) */
  ssr?: boolean
  output?: 'html' | 'json'
}

export function Editor({
  value,
  initialContent,
  onContentChange,
  onChange,
  placeholder,
  contentMinHeight = 256,
  containerClass,
  readonly = false,
  disabled = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ssr: _ssr,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  output: _output,
}: EditorProps) {
  const placeholderText =
    typeof placeholder === 'string'
      ? placeholder
      : placeholder?.paragraph || 'Enter detailed description...'

  const handleChange = (html: string) => {
    onContentChange?.(html)
    onChange?.(html)
  }

  return (
    <RichEditor
      value={value ?? initialContent ?? ''}
      onChange={handleChange}
      placeholder={placeholderText}
      minHeight={typeof contentMinHeight === 'number' ? contentMinHeight : 256}
      disabled={readonly || disabled}
      className={containerClass}
    />
  )
}

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
      className={`prose prose-sm dark:prose-invert max-w-none leading-relaxed ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
