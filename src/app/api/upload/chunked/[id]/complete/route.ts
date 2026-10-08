import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { storageManager, s3StorageService, r2StorageService } from '@/lib/storage'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => ({}))
    const { parts, key, storage } = body

    const activeStorage = storage || storageManager.getActiveDriver()
    const settings = storageManager.getSettings()

    // 1. S3 Complete
    if (activeStorage === 's3' && parts && key) {
      const res = await s3StorageService.completeMultipart(key, id, parts, settings)
      return NextResponse.json({
        success: true,
        message: 'Upload completed successfully',
        upload_id: id,
        file_path: res.key,
        file_url: res.url,
        signed_url: res.url,
        file_name: path.basename(key),
      })
    }

    // 2. R2 Complete
    if (activeStorage === 'r2' && parts && key) {
      const res = await r2StorageService.completeMultipart(key, id, parts, settings)
      return NextResponse.json({
        success: true,
        message: 'Upload completed successfully',
        upload_id: id,
        file_path: res.key,
        file_url: res.url,
        signed_url: res.url,
        file_name: path.basename(key),
      })
    }

    // 3. Local Chunk Stitching
    const chunkDir = path.join(process.cwd(), 'public', 'uploads', 'chunks', id)
    if (!fs.existsSync(chunkDir)) {
      return NextResponse.json(
        { success: false, message: 'Chunk folder not found or already completed' },
        { status: 404 }
      )
    }

    const chunkFiles = (await fs.promises.readdir(chunkDir)).sort()
    const finalFileName = `${id}_lesson_video.mp4`
    const finalFilePath = path.join(process.cwd(), 'public', 'uploads', finalFileName)
    const writeStream = fs.createWriteStream(finalFilePath)

    for (const chunkFile of chunkFiles) {
      const data = await fs.promises.readFile(path.join(chunkDir, chunkFile))
      writeStream.write(data)
    }
    writeStream.end()

    // Clean up chunks
    for (const chunkFile of chunkFiles) {
      await fs.promises.unlink(path.join(chunkDir, chunkFile)).catch(() => {})
    }
    await fs.promises.rmdir(chunkDir).catch(() => {})

    const finalUrl = `/uploads/${finalFileName}`

    return NextResponse.json({
      success: true,
      message: 'Upload completed successfully',
      upload_id: id,
      file_path: finalFileName,
      file_url: finalUrl,
      signed_url: finalUrl,
      file_name: finalFileName,
    })
  } catch (error: any) {
    console.error('Complete chunk upload error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to complete upload' }, { status: 500 })
  }
}
