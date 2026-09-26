'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  PlayCircle,
  Code2,
  Table as TableIcon,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  Highlighter,
  Palette,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RichEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minHeight?: number
  maxHeight?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar Button helper
// ─────────────────────────────────────────────────────────────────────────────

interface ToolbarBtnProps {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

const ToolbarBtn = ({ active, disabled, onClick, title, children }: ToolbarBtnProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => {
      e.preventDefault()
      onClick()
    }}
    className={cn(
      'inline-flex items-center justify-center rounded p-1 text-sm transition-colors',
      'hover:bg-muted hover:text-foreground',
      active ? 'bg-muted text-foreground' : 'text-muted-foreground',
      disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
    )}
  >
    {children}
  </button>
)

const Divider = () => (
  <span className="mx-0.5 h-5 w-px bg-border shrink-0" aria-hidden="true" />
)

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette (matches Laravel toolbar)
// ─────────────────────────────────────────────────────────────────────────────

const TEXT_COLORS = [
  '#000000', '#343434', '#545454', '#737373', '#9A9A9A',
  '#d0021b', '#f5a623', '#f8e71c', '#8b572a', '#417505',
  '#bd10e0', '#9013fe', '#4a90e2', '#50e3c2', '#b8e986',
  '#ffffff',
]

const HIGHLIGHT_COLORS = [
  '#fef9c3', '#fef08a', '#fde68a', '#fed7aa', '#fca5a5',
  '#f0abfc', '#c4b5fd', '#a5b4fc', '#93c5fd', '#67e8f9',
  '#6ee7b7', '#86efac', '#d4d4d4', '#ffffff',
]

// ─────────────────────────────────────────────────────────────────────────────
// Heading labels
// ─────────────────────────────────────────────────────────────────────────────

const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
]

// ─────────────────────────────────────────────────────────────────────────────
// RichEditor Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RichEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  className,
  minHeight = 220,
}: RichEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [youtubeOpen, setYoutubeOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [hlOpen, setHlOpen] = useState(false)
  const [alignOpen, setAlignOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Youtube.configure({ width: 480, height: 270 }),
      CodeBlockLowlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? '' : ed.getHTML()
      onChange?.(html)
    },
  })

  // Sync external value changes (e.g. when data loads from API)
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const getHeadingValue = () => {
    if (!editor) return 'paragraph'
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `h${i}`
    }
    return 'paragraph'
  }

  const applyHeading = (val: string) => {
    if (!editor) return
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(val.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const insertLink = () => {
    if (!editor || !linkUrl) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setLinkOpen(false)
  }

  const insertImage = () => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setImageOpen(false)
  }

  const insertYoutube = () => {
    if (!editor || !youtubeUrl) return
    editor.commands.setYoutubeVideo({ src: youtubeUrl })
    setYoutubeUrl('')
    setYoutubeOpen(false)
  }

  const insertTable = () => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const words = editor?.storage.characterCount?.words() ?? 0
  const chars = editor?.storage.characterCount?.characters() ?? 0

  if (!editor) return null

  return (
    <div
      className={cn(
        'rte-wrapper flex flex-col rounded-lg border border-input bg-background text-foreground shadow-xs transition-[border-color,box-shadow]',
        'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
        isFullScreen && 'fixed inset-0 z-50 rounded-none border-none shadow-none',
        className,
      )}
    >
      {/* ── MENU BAR ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">

        {/* Undo / Redo */}
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        {/* Heading select */}
        <Select value={getHeadingValue()} onValueChange={applyHeading}>
          <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent px-1.5 text-xs shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Divider />

        {/* Bold / Italic / Underline */}
        <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        {/* Text Colour */}
        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Text color"
              className="inline-flex items-center justify-center rounded p-1 hover:bg-muted"
            >
              <Palette className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Text color</p>
            <div className="grid grid-cols-8 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  className="h-5 w-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setColorOpen(false) }}
                />
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-muted-foreground underline" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setColorOpen(false) }}>Remove color</button>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover open={hlOpen} onOpenChange={setHlOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Highlight"
              className="inline-flex items-center justify-center rounded p-1 hover:bg-muted"
            >
              <Highlighter className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Highlight color</p>
            <div className="grid grid-cols-7 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  className="h-5 w-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); setHlOpen(false) }}
                />
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-muted-foreground underline" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setHlOpen(false) }}>Remove highlight</button>
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Align */}
        <Popover open={alignOpen} onOpenChange={setAlignOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Text alignment"
              className="inline-flex items-center justify-center rounded p-1 hover:bg-muted"
            >
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex gap-0.5">
              {[
                { icon: AlignLeft, align: 'left', title: 'Align left' },
                { icon: AlignCenter, align: 'center', title: 'Align center' },
                { icon: AlignRight, align: 'right', title: 'Align right' },
                { icon: AlignJustify, align: 'justify', title: 'Justify' },
              ].map(({ icon: Icon, align, title }) => (
                <ToolbarBtn key={align} title={title} active={editor.isActive({ textAlign: align })} onClick={() => { editor.chain().focus().setTextAlign(align).run(); setAlignOpen(false) }}>
                  <Icon className="h-4 w-4" />
                </ToolbarBtn>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Lists */}
        <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        {/* Blockquote */}
        <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarBtn>

        {/* Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Insert link"
              className={cn('inline-flex items-center justify-center rounded p-1 hover:bg-muted', editor.isActive('link') && 'bg-muted text-foreground')}
            >
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <Label className="text-xs">URL</Label>
            <Input
              className="mt-1 h-8 text-xs"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertLink()}
            />
            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" className="h-7 text-xs" onClick={insertLink}>Insert</Button>
              {editor.isActive('link') && (
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false) }}>Remove</Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <PopoverTrigger asChild>
            <button type="button" title="Insert image" className="inline-flex items-center justify-center rounded p-1 hover:bg-muted">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <Label className="text-xs">Image URL</Label>
            <Input
              className="mt-1 h-8 text-xs"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertImage()}
            />
            <Button type="button" size="sm" className="mt-2 h-7 text-xs" onClick={insertImage}>Insert Image</Button>
          </PopoverContent>
        </Popover>

        {/* YouTube */}
        <Popover open={youtubeOpen} onOpenChange={setYoutubeOpen}>
          <PopoverTrigger asChild>
            <button type="button" title="Embed YouTube video" className="inline-flex items-center justify-center rounded p-1 hover:bg-muted">
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <Label className="text-xs">YouTube URL</Label>
            <Input
              className="mt-1 h-8 text-xs"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertYoutube()}
            />
            <Button type="button" size="sm" className="mt-2 h-7 text-xs" onClick={insertYoutube}>Embed Video</Button>
          </PopoverContent>
        </Popover>

        {/* Code Block */}
        <ToolbarBtn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="h-4 w-4" />
        </ToolbarBtn>

        {/* Table */}
        <ToolbarBtn title="Insert table" onClick={insertTable}>
          <TableIcon className="h-4 w-4" />
        </ToolbarBtn>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Fullscreen */}
        <ToolbarBtn title={isFullScreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setIsFullScreen((f) => !f)}>
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </ToolbarBtn>
      </div>

      {/* ── EDITOR CONTENT ───────────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-auto px-4 py-3 text-sm focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit]"
        style={{ minHeight: isFullScreen ? undefined : minHeight }}
      />

      {/* ── STATUS BAR ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-4 border-t border-border px-3 py-1 text-xs text-muted-foreground">
        <span>Words: {words}</span>
        <span>Characters: {chars}</span>
      </div>
    </div>
  )
}
