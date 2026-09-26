import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const files = formData.getAll('files') as File[]
    const modelType = (formData.get('model_type') as string) || 'Modules\\Store\\Models\\Product'
    const modelId = formData.get('model_id') ? parseInt(formData.get('model_id') as string, 10) : null
    const collectionName = (formData.get('collection_name') as string) || 'default'

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

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

      // Generate a safe unique filename
      const ext = path.extname(item.name) || ''
      const baseName = path.basename(item.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
      const uniqueName = `${Date.now()}_${baseName}${ext}`
      const filePath = path.join(uploadDir, uniqueName)

      fs.writeFileSync(filePath, buffer)
      const fileUrl = `/uploads/${uniqueName}`

      let mediaId: number | null = null

      if (modelId) {
        try {
          const insertStmt = db.prepare(`
            INSERT INTO media (
              model_type, model_id, collection_name, name, file_name,
              mime_type, disk, size, manipulations, custom_properties,
              generated_conversions, responsive_images, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'local', ?, '[]', '[]', '[]', '[]', datetime('now'), datetime('now'))
          `)
          const res = insertStmt.run(
            modelType,
            modelId,
            collectionName,
            item.name,
            uniqueName,
            item.type || 'application/octet-stream',
            item.size
          )
          mediaId = Number(res.lastInsertRowid)
        } catch (dbErr) {
          console.warn('Could not insert media record to SQLite:', dbErr)
        }
      }

      uploadedResults.push({
        id: mediaId,
        url: fileUrl,
        name: item.name,
        fileName: uniqueName,
        size: item.size,
        mimeType: item.type || 'application/octet-stream',
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
