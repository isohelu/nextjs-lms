import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { storageManager } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const files = formData.getAll('files') as File[]
    const modelType = (formData.get('model_type') as string) || 'Modules\\Store\\Models\\Product'
    const modelId = formData.get('model_id') ? parseInt(formData.get('model_id') as string, 10) : null
    const collectionName = (formData.get('collection_name') as string) || 'default'

    const filesToProcess: File[] = []
    if (file && file.size > 0) {
      filesToProcess.push(file)
    }
    for (const f of files) {
      if (f && f.size > 0) {
        filesToProcess.push(f)
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    const uploadedResults = []

    for (const item of filesToProcess) {
      const bytes = await item.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload via active Storage Driver (S3, R2, or Local)
      const uploadRes = await storageManager.uploadFile(
        buffer,
        item.name,
        item.type || 'application/octet-stream'
      )

      let mediaId: number | null = null

      if (modelId) {
        try {
          const insertStmt = db.prepare(`
            INSERT INTO media (
              model_type, model_id, collection_name, name, file_name,
              mime_type, disk, size, manipulations, custom_properties,
              generated_conversions, responsive_images, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', '[]', '[]', datetime('now'), datetime('now'))
          `)
          const res = insertStmt.run(
            modelType,
            modelId,
            collectionName,
            uploadRes.name,
            uploadRes.fileName,
            uploadRes.mimeType,
            uploadRes.disk,
            uploadRes.size
          )
          mediaId = Number(res.lastInsertRowid)
        } catch (dbErr) {
          console.warn('Could not insert media record to SQLite:', dbErr)
        }
      }

      uploadedResults.push({
        id: mediaId,
        url: uploadRes.url,
        name: uploadRes.name,
        fileName: uploadRes.fileName,
        size: uploadRes.size,
        mimeType: uploadRes.mimeType,
        disk: uploadRes.disk,
      })
    }

    if (uploadedResults.length === 1) {
      return NextResponse.json({
        success: true,
        ...uploadedResults[0],
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
    })
  } catch (error: unknown) {
    console.error('File upload error:', error)
    return NextResponse.json({ success: false, message: 'Failed to upload file' }, { status: 500 })
  }
}
