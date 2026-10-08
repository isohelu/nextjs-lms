import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const partNumber = req.nextUrl.searchParams.get('part_number') || '1'
    const chunkDir = path.join(process.cwd(), 'public', 'uploads', 'chunks', id)

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true })
    }

    const chunkData = await req.arrayBuffer()
    const chunkBuffer = Buffer.from(chunkData)

    if (chunkBuffer.length === 0) {
      return NextResponse.json({ success: false, message: 'Empty chunk data' }, { status: 400 })
    }

    const partFilePath = path.join(chunkDir, `part_${partNumber.padStart(5, '0')}`)
    await fs.promises.writeFile(partFilePath, chunkBuffer)

    return NextResponse.json({
      success: true,
      part_number: parseInt(partNumber, 10),
      size: chunkBuffer.length,
      message: 'Chunk uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload chunk error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Failed to upload chunk' }, { status: 500 })
  }
}
