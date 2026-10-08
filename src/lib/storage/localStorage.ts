import fs from 'fs'
import path from 'path'
import { UploadResult } from './types'

export class LocalStorageService {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  public async uploadBuffer(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    customFilename?: string
  ): Promise<UploadResult> {
    const ext = path.extname(originalFilename) || ''
    const baseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = customFilename || `${Date.now()}_${baseName}${ext}`
    const filePath = path.join(this.uploadDir, fileName)

    await fs.promises.writeFile(filePath, buffer)

    return {
      url: `/uploads/${fileName}`,
      name: originalFilename,
      fileName,
      size: buffer.length,
      mimeType: mimeType || 'application/octet-stream',
      disk: 'local',
    }
  }

  public async deleteFile(fileName: string): Promise<boolean> {
    try {
      const sanitized = path.basename(fileName)
      const filePath = path.join(this.uploadDir, sanitized)
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
      return true
    } catch (err) {
      console.error('Failed to delete local file:', err)
      return false
    }
  }

  public getFileUrl(fileName: string): string {
    const sanitized = path.basename(fileName)
    return `/uploads/${sanitized}`
  }
}

export const localStorageService = new LocalStorageService()
