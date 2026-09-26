import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { productRepository } from '@/lib/repositories/productRepository'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to download files.' },
        { status: 401 }
      )
    }

    const { id, fileId } = await context.params
    const productId = parseInt(id, 10)
    const mediaId = parseInt(fileId, 10)

    if (isNaN(productId) || isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: 'Invalid identifiers.' }, { status: 400 })
    }

    const product = productRepository.findById(productId)
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 })
    }

    // 1:1 Parity with Laravel ProductPurchasedMiddleware
    let isAuthorized = false

    if (user.role === 'admin') {
      isAuthorized = true
    } else if (user.role === 'instructor' && user.id === product.instructor_id) {
      isAuthorized = true
    } else {
      isAuthorized = productRepository.isPurchased(user.id, productId)
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'You need to purchase this product before downloading its files.' },
        { status: 403 }
      )
    }

    const file = productRepository.getFileById(productId, mediaId)
    if (!file) {
      return NextResponse.json({ success: false, message: 'File not found.' }, { status: 404 })
    }

    // In a production environment with S3/Local disks, stream bytes.
    // For demo/simulated downloads, generate standard downloadable stream header:
    const content = Buffer.from(`Mentor LMS Downloadable Asset: ${file.name}\nGenerated for user: ${user.email}`)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': file.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.file_name || file.name)}"`,
        'Content-Length': String(content.length),
      }
    })
  } catch (error: unknown) {
    console.error('File download error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process file download.' },
      { status: 500 }
    )
  }
}
