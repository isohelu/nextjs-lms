import { NextRequest, NextResponse } from 'next/server'
import { storageManager } from '@/lib/storage'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      filename,
      mimetype,
      filesize,
      filetype,
      total_chunks,
      storage,
      course_id,
      course_section_id,
    } = body

    if (!filename || !total_chunks) {
      return NextResponse.json(
        { success: false, message: 'filename and total_chunks are required' },
        { status: 400 }
      )
    }

    const initRes = await storageManager.initiateChunkedUpload({
      filename,
      mimetype: mimetype || 'video/mp4',
      filesize: filesize || 0,
      filetype: filetype || 'video',
      total_chunks: parseInt(String(total_chunks), 10),
      storage,
      course_id,
      course_section_id,
    })

    // Store upload record if table exists
    try {
      db.prepare(`
        INSERT INTO chunked_uploads (
          filename, original_filename, file_path, disk, mime_type,
          size, key, status, chunks_completed, total_chunks, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'initialized', 0, ?, datetime('now'), datetime('now'))
      `).run(
        initRes.key,
        filename,
        initRes.key,
        storage || storageManager.getActiveDriver(),
        mimetype || 'video/mp4',
        filesize || 0,
        initRes.key,
        total_chunks
      )
    } catch {
      // Table may not exist or has slight variation; fallback is graceful
    }

    return NextResponse.json({
      success: true,
      key: initRes.key,
      upload_id: initRes.upload_id,
      aws_upload_id: initRes.aws_upload_id,
      part_urls: initRes.part_urls,
      message: initRes.message,
    })
  } catch (error: any) {
    console.error('Chunked upload init error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initialize chunked upload' },
      { status: 500 }
    )
  }
}
