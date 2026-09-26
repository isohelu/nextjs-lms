import fs from 'fs'
import path from 'path'

/**
 * Ensures that if a thumbnail or image string is a data:image/... base64 URI,
 * it is safely decoded and written to public/uploads/ as a real file,
 * returning the public relative URL path (e.g. /uploads/1727021...png).
 * If already a normal URL or path, returns it unchanged.
 */
export function saveBase64Image(dataUri?: string | null, prefix: string = 'thumb'): string | null {
  if (!dataUri || typeof dataUri !== 'string') return null
  if (!dataUri.startsWith('data:image/')) return dataUri

  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
    if (!matches) return null

    let ext = matches[1].toLowerCase()
    if (ext === 'jpeg') ext = 'jpg'
    else if (ext.includes('+')) ext = ext.split('+')[0]

    const buffer = Buffer.from(matches[2], 'base64')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uniqueName = `${Date.now()}_${prefix}_${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    fs.writeFileSync(filePath, buffer)
    return `/uploads/${uniqueName}`
  } catch (err) {
    console.error('Failed to save base64 image to disk:', err)
    return null
  }
}
