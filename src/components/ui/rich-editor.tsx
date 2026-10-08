'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@/components/rich-editor/components/BubbleMenu'
import { mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import CodeBlock from '@tiptap/extension-code-block'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { toast } from 'sonner'
import '@/components/rich-editor/style/editor.css'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Code as CodeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code2,
  Table as TableIcon,
  Undo2,
  Redo2,
  Maximize,
  Minimize,
  CaseSensitive,
  ChevronDown,
  Ban,
  UploadCloud,
  Globe,
  Trash2,
  Check,
  Scaling,
  ExternalLink,
  Play,
  Plus,
  Unlink,
  Grid,
  Square,
  Sparkles,
} from 'lucide-react'
import {
  IconQuote,
  IconTextColor,
  IconTextHighlight,
  IconYoutube,
} from '@/components/rich-editor/icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

// ─────────────────────────────────────────────────────────────────────────────
// Custom Image Extension Supporting Size & Placement
// ─────────────────────────────────────────────────────────────────────────────

export const CustomImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => (attributes.alt ? { alt: attributes.alt } : {}),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => (attributes.title ? { title: attributes.title } : {}),
      },
      width: {
        default: '50%',
        parseHTML: (element) => {
          const widthStyle = element.style.width
          if (widthStyle) return widthStyle
          const widthAttr = element.getAttribute('width')
          if (widthAttr) {
            return widthAttr.endsWith('%') || widthAttr.endsWith('px') ? widthAttr : `${widthAttr}%`
          }
          return null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      placement: {
        default: 'center',
        parseHTML: (element) => {
          const style = element.style
          if (style.marginLeft === '0px' || style.marginLeft === '0') return 'left'
          if (style.marginRight === '0px' || style.marginRight === '0') return 'right'
          return element.getAttribute('data-placement') || 'center'
        },
        renderHTML: (attributes) => {
          return { 'data-placement': attributes.placement || 'center' }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes.width || '50%'
    const placement = HTMLAttributes['data-placement'] || HTMLAttributes.placement || 'center'

    let marginLeft = 'auto'
    let marginRight = 'auto'

    if (placement === 'left') {
      marginLeft = '0'
      marginRight = 'auto'
    } else if (placement === 'right') {
      marginLeft = 'auto'
      marginRight = '0'
    }

    const inlineStyle = `width: ${width}; max-width: 100%; height: auto; display: block; margin-left: ${marginLeft}; margin-right: ${marginRight}; border-radius: 0.5rem;`

    const merged = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      style: inlineStyle,
      class: 'rte-inserted-image',
    })

    return ['img', merged]
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Color Palettes
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  '#000000', '#343434', '#545454', '#737373', '#9A9A9A',
  '#d0021b', '#f5a623', '#f8e71c', '#8b572a', '#417505',
  '#bd10e0', '#9013fe', '#4a90e2', '#50e3c2', '#b8e986',
  '#ffffff',
]

const MORE_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#a1a1aa',
]

const HIGHLIGHT_COLORS = [
  '#fef9c3', '#fef08a', '#fde68a', '#fed7aa', '#fca5a5',
  '#f0abfc', '#c4b5fd', '#a5b4fc', '#93c5fd', '#67e8f9',
  '#6ee7b7', '#86efac', '#d4d4d4', '#ffffff',
]

// ─────────────────────────────────────────────────────────────────────────────
// Heading Options
// ─────────────────────────────────────────────────────────────────────────────

const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
]

export interface RichEditorProps {
  value?: string
  initialContent?: string
  onChange?: (html: string) => void
  onContentChange?: (html: string) => void
  placeholder?: { paragraph?: string; imageCaption?: string } | string
  disabled?: boolean
  readonly?: boolean
  className?: string
  containerClass?: string
  minHeight?: number | string
  contentMinHeight?: number | string
  contentMaxHeight?: number | string
  change?: boolean
  hideMenuBar?: boolean
  hideStatusBar?: boolean
  ssr?: boolean
  output?: 'html' | 'json'
}

export default function RichEditor({
  value,
  initialContent,
  onChange,
  onContentChange,
  placeholder = 'Write your blog content here...',
  disabled = false,
  readonly = false,
  className,
  containerClass,
  minHeight = 220,
  contentMinHeight,
  contentMaxHeight,
  change = false,
  hideMenuBar = false,
  hideStatusBar = false,
}: RichEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [hlOpen, setHlOpen] = useState(false)
  const [alignOpen, setAlignOpen] = useState(false)
  const [moreMarkOpen, setMoreMarkOpen] = useState(false)
  const [customColor, setCustomColor] = useState('')

  // ── Link Dialog State ──────────────────────────────────────────────────────
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(true)

  // ── YouTube Dialog State ───────────────────────────────────────────────────
  const [youtubeOpen, setYoutubeOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeRatio, setYoutubeRatio] = useState<'16:9' | '4:3' | 'custom'>('16:9')

  // ── Table Dialog & Builder State ───────────────────────────────────────────
  const [tableOpen, setTableOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [tableWithHeader, setTableWithHeader] = useState(true)
  const [hoverGridRows, setHoverGridRows] = useState(3)
  const [hoverGridCols, setHoverGridCols] = useState(3)

  // ── Image Dialog State ─────────────────────────────────────────────────────
  const [imageOpen, setImageOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [imageSize, setImageSize] = useState<'25%' | '50%' | '75%' | '100%' | 'custom'>('50%')
  const [customImageWidth, setCustomImageWidth] = useState('350px')
  const [imagePlacement, setImagePlacement] = useState<'left' | 'center' | 'right'>('center')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileDimensions, setFileDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditable = !disabled && !readonly

  const placeholderText =
    typeof placeholder === 'string'
      ? placeholder
      : placeholder?.paragraph || 'Write your blog content here...'

  const effectiveMinHeight =
    typeof contentMinHeight === 'number'
      ? contentMinHeight
      : typeof minHeight === 'number'
        ? minHeight
        : 220

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:text-primary/80 transition-colors',
        },
      }),
      CustomImage,
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden shadow-md max-w-full my-4 border border-border',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'rounded-xl bg-muted/80 text-foreground p-4 font-mono text-xs my-4 overflow-x-auto border border-border',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border w-full my-4 rounded-lg overflow-hidden',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              if (src) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = schema.nodes.image.create({
                    src,
                    width: '50%',
                    placement: 'center',
                  })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                  toast.success('Image dropped into editor (Medium size)!')
                }
              }
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile()
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const src = e.target?.result as string
                  if (src) {
                    editor
                      ?.chain()
                      .focus()
                      .setImage({
                        src,
                        width: '50%',
                        placement: 'center',
                      } as any)
                      .run()
                    toast.success('Image pasted from clipboard (Medium size)!')
                  }
                }
                reader.readAsDataURL(file)
                return true
              }
            }
          }
        }
        return false
      },
    },
    content: value ?? initialContent ?? '',
    editable: isEditable,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? '' : ed.getHTML()
      onChange?.(html)
      onContentChange?.(html)
    },
  })

  // Synchronize incoming external changes
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    const target = value ?? initialContent ?? ''
    if (target !== current && target !== undefined) {
      editor.commands.setContent(target)
    }
  }, [value, initialContent, editor])

  const getHeadingLabel = () => {
    if (!editor) return 'Paragraph'
    for (let i = 1; i <= 4; i++) {
      if (editor.isActive('heading', { level: i })) return `Heading ${i}`
    }
    return 'Paragraph'
  }

  const applyHeading = (val: string) => {
    if (!editor) return
    if (val === 'p') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(val.replace('h', '')) as 1 | 2 | 3 | 4
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const getCurrentAlignIcon = () => {
    if (!editor) return AlignLeft
    if (editor.isActive({ textAlign: 'center' })) return AlignCenter
    if (editor.isActive({ textAlign: 'right' })) return AlignRight
    if (editor.isActive({ textAlign: 'justify' })) return AlignJustify
    return AlignLeft
  }

  const currentColor = editor?.getAttributes('textStyle').color || 'DEFAULT'
  const currentHlColor = editor?.getAttributes('highlight').color || 'DEFAULT'

  // ── LINK ACTIONS ───────────────────────────────────────────────────────────
  const openLinkDialog = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to, ' ')
    setLinkUrl(previousUrl)
    setLinkText(selected)
    setLinkNewTab(editor.getAttributes('link').target === '_blank')
    setLinkOpen(true)
  }

  const saveLinkAction = () => {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setLinkOpen(false)
      toast.info('Link removed')
      return
    }

    let finalUrl = linkUrl.trim()
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`
    }

    if (linkText.trim() && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${finalUrl}" target="${linkNewTab ? '_blank' : '_self'}">${linkText.trim()}</a>`)
        .run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: finalUrl,
          target: linkNewTab ? '_blank' : null,
        })
        .run()
    }

    toast.success('Link applied!')
    setLinkOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  // ── IMAGE ACTIONS ──────────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.warning('Image size exceeds 5MB. Please choose a smaller file.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setFilePreview(src)
      const img = new window.Image()
      img.onload = () => {
        setFileDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const resetImageModal = () => {
    setImageUrl('')
    setImageAlt('')
    setImageTitle('')
    setImageSize('50%')
    setCustomImageWidth('350px')
    setImagePlacement('center')
    setSelectedFile(null)
    setFilePreview(null)
    setFileDimensions(null)
    setIsDragging(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getEffectiveImageWidth = () => {
    if (imageSize === 'custom') {
      const trimmed = customImageWidth.trim()
      if (!trimmed) return '50%'
      return trimmed.endsWith('%') || trimmed.endsWith('px') ? trimmed : `${trimmed}px`
    }
    return imageSize
  }

  const insertImageAction = () => {
    if (!editor) return

    const chosenWidth = getEffectiveImageWidth()

    if (imageTab === 'upload') {
      if (!filePreview) {
        toast.error('Please select or drop an image file first.')
        return
      }
      editor
        .chain()
        .focus()
        .setImage({
          src: filePreview,
          alt: imageAlt.trim() || selectedFile?.name || undefined,
          title: imageTitle.trim() || undefined,
          width: chosenWidth,
          placement: imagePlacement,
        } as any)
        .run()
      toast.success(`🎉 Image uploaded and sized at ${chosenWidth}!`)
      resetImageModal()
      setImageOpen(false)
    } else {
      if (!imageUrl.trim()) {
        toast.error('Please enter a valid image URL.')
        return
      }
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl.trim(),
          alt: imageAlt.trim() || undefined,
          title: imageTitle.trim() || undefined,
          width: chosenWidth,
          placement: imagePlacement,
        } as any)
        .run()
      toast.success(`🎉 Image inserted from URL and sized at ${chosenWidth}!`)
      resetImageModal()
      setImageOpen(false)
    }
  }

  // ── YOUTUBE ACTIONS ────────────────────────────────────────────────────────
  const insertYoutubeAction = () => {
    if (!editor || !youtubeUrl.trim()) return

    editor.commands.setYoutubeVideo({
      src: youtubeUrl.trim(),
      width: youtubeRatio === '4:3' ? 640 : 640,
      height: youtubeRatio === '4:3' ? 480 : 360,
    })

    toast.success('🎬 Video embedded successfully!')
    setYoutubeUrl('')
    setYoutubeOpen(false)
  }

  // ── TABLE ACTIONS ──────────────────────────────────────────────────────────
  const insertTableAction = (rows = tableRows, cols = tableCols) => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: tableWithHeader }).run()
    toast.success(`📊 ${rows} × ${cols} Table created!`)
    setTableOpen(false)
  }

  const words = editor?.storage.characterCount?.words() ?? 0
  const chars = editor?.storage.characterCount?.characters() ?? 0
  const AlignCurrentIcon = getCurrentAlignIcon()

  // Selected image attributes for the floating bubble menu
  const selectedImageAttrs = editor?.getAttributes('image')
  const currentImageWidth = selectedImageAttrs?.width || '50%'
  const currentImagePlacement = selectedImageAttrs?.placement || 'center'

  const updateSelectedImageSize = (width: string) => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { width }).run()
    toast.success(`Image resized to ${width}`)
  }

  const updateSelectedImagePlacement = (placement: 'left' | 'center' | 'right') => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { placement }).run()
    toast.success(`Image aligned to ${placement}`)
  }

  const deleteSelectedImage = () => {
    if (!editor) return
    editor.chain().focus().deleteSelection().run()
    toast.info('Image removed')
  }

  if (!editor) return null

  return (
    <div
      className={cn(
        'rte-editor rounded-lg border border-input shadow-xs transition-[color,box-shadow] relative',
        change
          ? 'selection:bg-primary selection:text-primary-foreground focus-within:border-ring focus-within:ring-1 focus-within:ring-ring hover:border-ring'
          : 'selection:bg-zinc-900 selection:text-zinc-50 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900 hover:border-zinc-900 dark:selection:bg-zinc-50 dark:selection:text-zinc-900 dark:focus-within:border-zinc-50 dark:focus-within:ring-zinc-50 dark:hover:border-zinc-50',
        isFullScreen && 'rte-editor--fullscreen',
        className,
        containerClass,
      )}
    >
      {/* ── FLOATING IMAGE BUBBLE MENU ───────────────────────────────── */}
      {editor && isEditable && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: ed }) => ed.isActive('image')}
          options={{ placement: 'top', offset: 12 }}
          className="flex items-center gap-1.5 p-1.5 bg-popover/95 backdrop-blur-md text-popover-foreground border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-1 pr-1.5 border-r border-border">
            <span className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider flex items-center gap-1">
              <Scaling className="h-3 w-3" />
              Size:
            </span>
            {(['25%', '50%', '75%', '100%'] as const).map((w) => (
              <button
                key={w}
                type="button"
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                  currentImageWidth === w
                    ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={() => updateSelectedImageSize(w)}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border">
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                currentImagePlacement === 'left'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => updateSelectedImagePlacement('left')}
              title="Align Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                currentImagePlacement === 'center'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => updateSelectedImagePlacement('center')}
              title="Align Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                currentImagePlacement === 'right'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => updateSelectedImagePlacement('right')}
              title="Align Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            onClick={deleteSelectedImage}
            title="Delete Image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </BubbleMenu>
      )}

      {/* ── FLOATING TABLE BUBBLE MENU ───────────────────────────────── */}
      {editor && isEditable && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: ed }) => ed.isActive('table')}
          options={{ placement: 'top', offset: 12 }}
          className="flex items-center gap-1 p-1.5 bg-popover/95 backdrop-blur-md text-popover-foreground border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Add Row Above"
          >
            + Row Above
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row Below"
          >
            + Row Below
          </Button>
          <div className="h-4 w-px bg-border mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add Column Before"
          >
            + Col Left
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column After"
          >
            + Col Right
          </Button>
          <div className="h-4 w-px bg-border mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete Current Row"
          >
            Del Row
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete Current Column"
          >
            Del Col
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </BubbleMenu>
      )}

      {/* ── TOP MENU BAR ────────────────────────────────────────────── */}
      {!hideMenuBar && (
        <div className="rte-menu-bar">
          <div className="rte-toolbar rte-toolbar--dense">
            {/* Undo / Redo */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Heading Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button min-w-[6.5rem] justify-between text-xs font-normal"
                >
                  <span className="rte-button__text">{getHeadingLabel()}</span>
                  <span className="rte-icon-arrow ml-1">
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rte-dropdown rte-heading-dropdown">
                {HEADING_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    data-heading={opt.value}
                    data-active={
                      (opt.value === 'p' && editor.isActive('paragraph')) ||
                      (opt.value.startsWith('h') &&
                        editor.isActive('heading', {
                          level: parseInt(opt.value.replace('h', '')),
                        }))
                        ? true
                        : undefined
                    }
                    className="rte-dropdown__item cursor-pointer"
                    onClick={() => applyHeading(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Bold, Italic, Underline */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('bold') || undefined}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('italic') || undefined}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('underline') || undefined}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>

            {/* More Marks Popover (Aa) */}
            <Popover open={moreMarkOpen} onOpenChange={setMoreMarkOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button !px-1.5"
                  title="More format"
                >
                  <CaseSensitive className="h-4 w-4" />
                  <span className="rte-icon-arrow ml-0.5">
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-auto p-1">
                <div className="rte-toolbar rte-toolbar--dense flex items-center gap-0.5">
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('strike') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleStrike().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('superscript') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleSuperscript().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Superscript"
                  >
                    <SuperscriptIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('subscript') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleSubscript().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Subscript"
                  >
                    <SubscriptIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={editor.isActive('code') || undefined}
                    onClick={() => {
                      editor.chain().focus().toggleCode().run()
                      setMoreMarkOpen(false)
                    }}
                    title="Inline Code"
                  >
                    <CodeIcon className="h-4 w-4" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Text Color Button */}
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button relative"
                  title="Text color"
                >
                  <IconTextColor size={18} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 4,
                      right: 4,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor:
                        currentColor === 'DEFAULT'
                          ? 'var(--rte-fg, #1f2328)'
                          : currentColor,
                    }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover rte-cp w-64 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Text Color
                </p>
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setColor(c).run()
                        setColorOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {MORE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setColor(c).run()
                        setColorOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Input
                    className="h-7 text-xs font-mono"
                    placeholder="#000000"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => {
                      if (customColor) {
                        editor.chain().focus().setColor(customColor).run()
                        setCustomColor('')
                        setColorOpen(false)
                      }
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs px-2"
                    title="Remove color"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setColorOpen(false)
                    }}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Text Highlight Button */}
            <Popover open={hlOpen} onOpenChange={setHlOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button relative"
                  title="Highlight color"
                >
                  <IconTextHighlight size={18} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 4,
                      right: 4,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor:
                        currentHlColor === 'DEFAULT'
                          ? '#fde68a'
                          : currentHlColor,
                    }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover rte-cp w-60 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Highlight Color
                </p>
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="rte-color__btn"
                      style={{ backgroundColor: c }}
                      data-active={c === currentHlColor || undefined}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color: c }).run()
                        setHlOpen(false)
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setHlOpen(false)
                    }}
                  >
                    Remove Highlight
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Text Align Popover */}
            <Popover open={alignOpen} onOpenChange={setAlignOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rte-button rte-button--ghost rte-menu__button !px-1.5"
                  title="Text alignment"
                >
                  <AlignCurrentIcon className="h-4 w-4" />
                  <span className="rte-icon-arrow ml-0.5">
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-auto p-1">
                <div className="rte-toolbar rte-toolbar--dense flex items-center gap-0.5">
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'left' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('left').run()
                      setAlignOpen(false)
                    }}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'center' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('center').run()
                      setAlignOpen(false)
                    }}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'right' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('right').run()
                      setAlignOpen(false)
                    }}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
                    data-active={
                      editor.isActive({ textAlign: 'justify' }) || undefined
                    }
                    onClick={() => {
                      editor.chain().focus().setTextAlign('justify').run()
                      setAlignOpen(false)
                    }}
                    title="Justify"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Bullet List & Ordered List */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('bulletList') || undefined}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <List className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('orderedList') || undefined}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </button>

            {/* Divider */}
            <div className="rte-toolbar__divider bg-neutral-200 dark:bg-neutral-800" />

            {/* Blockquote */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('blockquote') || undefined}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
            >
              <IconQuote size={18} />
            </button>

            {/* Link Button */}
            <button
              type="button"
              className={cn(
                'rte-button rte-button--ghost rte-button--icon-only rte-menu__button',
                editor.isActive('link') && 'rte-button--active text-primary'
              )}
              onClick={openLinkDialog}
              title="Insert or Edit Link"
            >
              <Link2 className="h-4 w-4" />
            </button>

            {/* Image Button Trigger */}
            <button
              type="button"
              className={cn(
                'rte-button rte-button--ghost rte-button--icon-only rte-menu__button',
                imageOpen && 'rte-button--active text-primary'
              )}
              onClick={() => setImageOpen(true)}
              title="Insert Image (Upload, Drag-and-Drop or URL with Custom Size)"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* YouTube Embed Button */}
            <button
              type="button"
              className={cn(
                'rte-button rte-button--ghost rte-button--icon-only rte-menu__button',
                youtubeOpen && 'rte-button--active text-primary'
              )}
              onClick={() => setYoutubeOpen(true)}
              title="Embed Video (YouTube, Vimeo, etc.)"
            >
              <IconYoutube size={18} />
            </button>

            {/* Code Block */}
            <button
              type="button"
              className="rte-button rte-button--ghost rte-button--icon-only rte-menu__button"
              data-active={editor.isActive('codeBlock') || undefined}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <Code2 className="h-4 w-4" />
            </button>

            {/* Table Button & Dropdown */}
            <Popover open={tableOpen} onOpenChange={setTableOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'rte-button rte-button--ghost rte-button--icon-only rte-menu__button',
                    editor.isActive('table') && 'rte-button--active text-primary'
                  )}
                  title="Insert Table Grid"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="rte-popover w-64 p-3 space-y-3" align="start">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Grid className="h-3.5 w-3.5 text-primary" />
                    <span>Insert Table</span>
                  </p>
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    {hoverGridRows} × {hoverGridCols}
                  </span>
                </div>

                {/* Interactive Grid Hover Box */}
                <div
                  className="grid grid-cols-6 gap-1 p-2 bg-muted/40 rounded-lg border border-border cursor-pointer"
                  onMouseLeave={() => {
                    setHoverGridRows(tableRows)
                    setHoverGridCols(tableCols)
                  }}
                >
                  {Array.from({ length: 6 }).map((_, r) =>
                    Array.from({ length: 6 }).map((_, c) => {
                      const isActive = r < hoverGridRows && c < hoverGridCols
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={cn(
                            'h-4 w-4 rounded-xs border transition-colors',
                            isActive
                              ? 'bg-primary border-primary shadow-xs'
                              : 'bg-background border-border/80'
                          )}
                          onMouseEnter={() => {
                            setHoverGridRows(r + 1)
                            setHoverGridCols(c + 1)
                          }}
                          onClick={() => {
                            insertTableAction(r + 1, c + 1)
                          }}
                        />
                      )
                    })
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="table-header-check"
                    checked={tableWithHeader}
                    onCheckedChange={(checked) => setTableWithHeader(!!checked)}
                  />
                  <label
                    htmlFor="table-header-check"
                    className="text-xs font-medium leading-none cursor-pointer select-none text-muted-foreground"
                  >
                    Include Header Row
                  </label>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="w-full h-8 text-xs font-bold"
                  onClick={() => insertTableAction(hoverGridRows, hoverGridCols)}
                >
                  Create {hoverGridRows} × {hoverGridCols} Table
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* ── EDITOR CONTENT AREA ─────────────────────────────────────── */}
      <div
        className="rte-editor__container cursor-text"
        onClick={() => editor.chain().focus().run()}
        style={{
          minHeight: isFullScreen ? undefined : `${effectiveMinHeight}px`,
          maxHeight: contentMaxHeight
            ? typeof contentMaxHeight === 'number'
              ? `${contentMaxHeight}px`
              : contentMaxHeight
            : undefined,
        }}
      >
        <EditorContent
          editor={editor}
          className="rte-editor__content focus:outline-none [&_.ProseMirror]:outline-none"
        />
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────── */}
      {!hideStatusBar && (
        <div className="rte-status-bar">
          <div className="rte-toolbar rte-toolbar--dense">
            <button
              type="button"
              className="rte-button rte-button--ghost rte-menu__button text-xs"
              data-active={isFullScreen || undefined}
              onClick={() => setIsFullScreen((prev) => !prev)}
              title="Fullscreen"
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4 mr-1" />
              ) : (
                <Maximize className="h-4 w-4 mr-1" />
              )}
              <span className="rte-button__text">Fullscreen</span>
            </button>
          </div>

          <div className="rte-counter">
            <span className="rte-word-count">Words: {words}</span>
            <span className="rte-charater">Characters: {chars}</span>
          </div>
        </div>
      )}

      {/* ── PROFESSIONAL LINK INSERT / EDIT MODAL ───────────────────── */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
          <div className="p-6 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {editor.isActive('link') ? 'Edit Hyperlink' : 'Insert Hyperlink'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Link text to a public URL, internal route, email, or telephone.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Destination URL *
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-10 text-xs"
                  placeholder="https://example.com/page"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveLinkAction()}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Display Text (Optional)
              </Label>
              <Input
                className="h-10 text-xs"
                placeholder="e.g. Learn More"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="link-newtab"
                checked={linkNewTab}
                onCheckedChange={(checked) => setLinkNewTab(!!checked)}
              />
              <label
                htmlFor="link-newtab"
                className="text-xs font-medium leading-none cursor-pointer select-none text-foreground flex items-center gap-1.5"
              >
                <span>Open link in a new browser tab</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </label>
            </div>
          </div>

          <div className="p-4 px-6 border-t border-border bg-muted/20 flex items-center justify-between">
            {editor.isActive('link') ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run()
                  setLinkOpen(false)
                  toast.info('Link removed')
                }}
              >
                <Unlink className="h-3.5 w-3.5 mr-1" />
                Remove Link
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setLinkOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs font-bold h-9 px-5 shadow-sm"
                onClick={saveLinkAction}
              >
                Apply Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PROFESSIONAL VIDEO / YOUTUBE MODAL ──────────────────────── */}
      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
          <div className="p-6 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 shadow-xs">
                <IconYoutube size={22} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Embed Video
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Insert responsive video players from YouTube or public video links.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                YouTube or Video URL *
              </Label>
              <div className="relative">
                <Play className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-10 text-xs"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertYoutubeAction()}
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold text-foreground">
                Aspect Ratio
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    'p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left',
                    youtubeRatio === '16:9'
                      ? 'bg-[#D8FC38]/15 border-[#D8FC38] text-foreground font-bold'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  )}
                  onClick={() => setYoutubeRatio('16:9')}
                >
                  <p className="font-bold">16:9 Widescreen</p>
                  <p className="text-xs text-muted-foreground font-normal">Standard responsive HD</p>
                </button>
                <button
                  type="button"
                  className={cn(
                    'p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left',
                    youtubeRatio === '4:3'
                      ? 'bg-[#D8FC38]/15 border-[#D8FC38] text-foreground font-bold'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  )}
                  onClick={() => setYoutubeRatio('4:3')}
                >
                  <p className="font-bold">4:3 Classic</p>
                  <p className="text-xs text-muted-foreground font-normal">Traditional format</p>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 px-6 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={() => setYoutubeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs font-bold h-9 px-5 shadow-sm"
              onClick={insertYoutubeAction}
              disabled={!youtubeUrl.trim()}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Embed Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PROFESSIONAL IMAGE INSERT & SIZING MODAL ───────────────── */}
      <Dialog
        open={imageOpen}
        onOpenChange={(open) => {
          setImageOpen(open)
          if (!open) resetImageModal()
        }}
      >
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#D8FC38] text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Insert Image</span>
                  <Badge className="text-xs uppercase font-bold bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 border-transparent">
                    Media
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Upload an image from your device, configure custom size & alignment, or insert via direct URL.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <Tabs
              value={imageTab}
              onValueChange={(val) => setImageTab(val as 'upload' | 'url')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4 h-10 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger
                  value="upload"
                  className="flex items-center justify-center gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs cursor-pointer transition-all"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span>Upload & Drag-and-Drop</span>
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="flex items-center justify-center gap-2 text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs cursor-pointer transition-all"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Image URL</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Upload & Drag Drop */}
              <TabsContent value="upload" className="space-y-4 mt-0 focus-visible:outline-none">
                {!filePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      if (e.dataTransfer.files?.[0]) {
                        handleFileSelect(e.dataTransfer.files[0])
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center',
                      isDragging
                        ? 'border-primary bg-primary/10 scale-[0.99] shadow-inner'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0])
                        }
                      }}
                    />
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      Drag and drop your image here, or <span className="text-primary underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Supports PNG, JPG, WEBP, GIF or SVG up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Live Image Preview Card */}
                    <div className="relative rounded-2xl border border-border bg-muted/20 p-3.5 flex items-center gap-4 overflow-hidden">
                      <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-border shadow-xs flex items-center justify-center">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {selectedFile?.name || 'Uploaded Image'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''}
                          </span>
                          {fileDimensions && (
                            <>
                              <span>•</span>
                              <span>
                                {fileDimensions.width} × {fileDimensions.height} px
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Change File
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2.5 text-destructive hover:bg-destructive/10"
                            onClick={resetImageModal}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Image URL */}
              <TabsContent value="url" className="space-y-4 mt-0 focus-visible:outline-none">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Image Direct URL *</span>
                    <span className="text-xs text-muted-foreground font-normal">HTTP or HTTPS public link</span>
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 h-10 text-xs"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && insertImageAction()}
                    />
                  </div>
                </div>

                {/* Live URL Image Preview */}
                {imageUrl.trim() && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-border bg-black/5 flex items-center justify-center p-2">
                    <img
                      src={imageUrl.trim()}
                      alt="URL Preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* ── Image Size & Placement Configuration ──────────────────── */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Scaling className="h-3.5 w-3.5 text-primary" />
                  <span>Image Size Settings</span>
                </Label>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  Current: <strong className="text-foreground">{imageSize === 'custom' ? customImageWidth : imageSize}</strong>
                </span>
              </div>

              {/* Preset Size Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Small (25%)', value: '25%' },
                  { label: 'Medium (50%)', value: '50%' },
                  { label: 'Large (75%)', value: '75%' },
                  { label: 'Full (100%)', value: '100%' },
                  { label: 'Custom', value: 'custom' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setImageSize(preset.value as any)}
                    className={cn(
                      'px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center',
                      imageSize === preset.value
                        ? 'bg-[#D8FC38] text-slate-950 font-bold border-[#D8FC38] shadow-xs'
                        : 'bg-background hover:bg-muted text-foreground border-border'
                    )}
                  >
                    {preset.value === '50%' ? '50% (Recommended)' : preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Width Input */}
              {imageSize === 'custom' && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in-50">
                  <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Custom Width:
                  </Label>
                  <Input
                    className="h-8 text-xs font-mono max-w-[140px]"
                    placeholder="e.g. 350px or 60%"
                    value={customImageWidth}
                    onChange={(e) => setCustomImageWidth(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    (e.g., 300px, 450px, or 65%)
                  </span>
                </div>
              )}

              {/* Alignment Selector */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Image Alignment
                </Label>
                <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer',
                      imagePlacement === 'left'
                        ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setImagePlacement('left')}
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                    <span>Left</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer',
                      imagePlacement === 'center'
                        ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setImagePlacement('center')}
                  >
                    <AlignCenter className="h-3.5 w-3.5" />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer',
                      imagePlacement === 'right'
                        ? 'bg-[#D8FC38] text-slate-950 font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setImagePlacement('right')}
                  >
                    <AlignRight className="h-3.5 w-3.5" />
                    <span>Right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Accessibility & SEO Settings (Alt Text & Caption) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Alt Text (SEO & Accessibility)
                </Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Architecture diagram of Next.js 15"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Image Title / Caption (Optional)
                </Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Figure 1: System Workflow"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 px-6 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={() => {
                resetImageModal()
                setImageOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs font-bold h-9 px-5 shadow-sm cursor-pointer"
              onClick={insertImageAction}
              disabled={imageTab === 'upload' ? !filePreview : !imageUrl.trim()}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Insert Image ({imageSize === 'custom' ? customImageWidth : imageSize})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
