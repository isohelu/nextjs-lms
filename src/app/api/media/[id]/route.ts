import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import db from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params
    const mediaId = parseInt(resolved.id, 10)
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: 'Invalid media ID' }, { status: 400 })
    }

    const row = db.prepare('SELECT file_name FROM media WHERE id = ?').get(mediaId) as { file_name?: string } | undefined
    if (row && row.file_name) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', row.file_name)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkErr) {
          console.warn('Could not delete physical file:', unlinkErr)
        }
      }
    }

    const delRes = db.prepare('DELETE FROM media WHERE id = ?').run(mediaId)
    return NextResponse.json({ success: delRes.changes > 0, message: 'Media removed' })
  } catch (err: unknown) {
    console.error('Delete media error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete media' }, { status: 500 })
  }
}
