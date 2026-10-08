'use client'

import React, { useMemo } from 'react'
import { AlertCircle, Download, ExternalLink, FileText } from 'lucide-react'

interface DocumentViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  fileName?: string
  applicantName?: string
}

type DocumentType = 'pdf' | 'office' | 'image' | 'text' | 'unsupported'

export default function DocumentViewer({
  src,
  fileName,
  applicantName,
  className,
  ...props
}: DocumentViewerProps) {
  const normalizedSrc = useMemo(() => {
    if (!src || !src.trim()) return ''
    if (
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('/') ||
      src.startsWith('data:') ||
      src.startsWith('blob:')
    ) {
      return src
    }
    return `/${src}`
  }, [src])

  const documentInfo = useMemo(() => {
    if (!normalizedSrc) {
      return { extension: '', type: 'unsupported' as DocumentType, empty: true }
    }

    const getFileExtension = (url: string): string => {
      const urlWithoutQuery = url.split('?')[0]
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase() || ''
      return extension
    }

    const getDocumentType = (extension: string): DocumentType => {
      const pdfFormats = ['pdf']
      const officeFormats = [
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'odt',
        'ods',
        'odp',
      ]
      const imageFormats = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg',
      ]
      const textFormats = ['txt', 'rtf', 'csv']

      if (pdfFormats.includes(extension) || normalizedSrc.toLowerCase().includes('.pdf')) {
        return 'pdf'
      }
      if (officeFormats.includes(extension)) return 'office'
      if (imageFormats.includes(extension)) return 'image'
      if (textFormats.includes(extension)) return 'text'

      return 'unsupported'
    }

    const extension = getFileExtension(normalizedSrc)
    const type = getDocumentType(extension)

    return { extension, type, empty: false }
  }, [normalizedSrc])

  const renderDocument = () => {
    const baseClassName =
      'h-full max-h-[calc(100vh-60px)] min-h-[80vh] w-full border-none'

    if (documentInfo.empty) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center bg-muted/10">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-base font-semibold text-foreground">
            {applicantName ? `${applicantName}'s Resume` : 'Resume Document'}
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            No resume file has been attached to this candidate application.
          </p>
        </div>
      )
    }

    switch (documentInfo.type) {
      case 'pdf':
        return (
          <div className="relative h-full min-h-[80vh]">
            <iframe
              src={normalizedSrc}
              width="100%"
              height="100%"
              allowFullScreen
              title="PDF Document"
              className={baseClassName}
            />
            <div className="absolute top-3 right-4 flex gap-2 z-20">
              <a
                href={normalizedSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open</span>
              </a>
              <a
                href={normalizedSrc}
                download={fileName || 'resume.pdf'}
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
                title="Download document"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )

      case 'office': {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          normalizedSrc
        )}`
        return (
          <div className="relative h-full min-h-[80vh]">
            <iframe
              src={officeViewerUrl}
              width="100%"
              height="100%"
              allowFullScreen
              title={`${documentInfo.extension.toUpperCase()} Document`}
              className={baseClassName}
            />
            <div className="absolute top-3 right-4 flex gap-2 z-20">
              <a
                href={normalizedSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open</span>
              </a>
              <a
                href={normalizedSrc}
                download={fileName || `document.${documentInfo.extension}`}
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
                title="Download document"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )
      }

      case 'image':
        return (
          <div className="relative flex min-h-[80vh] items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <img
              src={normalizedSrc}
              alt={fileName || 'Resume Document'}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <div className="absolute top-3 right-4 flex gap-2 z-20">
              <a
                href={normalizedSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full</span>
              </a>
              <a
                href={normalizedSrc}
                download={fileName || 'resume-image'}
                className="flex items-center gap-1.5 rounded-md bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-white dark:hover:bg-zinc-900 border border-border"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="relative h-full min-h-[80vh]">
            <iframe
              src={normalizedSrc}
              width="100%"
              height="100%"
              title="Text Document"
              className={baseClassName}
            />
          </div>
        )

      default:
        return (
          <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-8 text-center text-muted-foreground">
            <AlertCircle className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Unsupported Document Format
            </h3>
            <p className="mb-6 max-w-md text-xs text-muted-foreground">
              This document format cannot be previewed directly in browser.
            </p>
            <div className="flex gap-3">
              <a
                href={normalizedSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </a>
              <a
                href={normalizedSrc}
                download={fileName || 'resume'}
                className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={`h-full w-full ${className || ''}`} {...props}>
      {renderDocument()}
    </div>
  )
}
