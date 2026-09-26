import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/repositories/productRepository'
import { saveBase64Image } from '@/lib/upload-utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const product = productRepository.findById(id)
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error: unknown) {
    console.error('Get product error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve product' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const body = await req.json()
    if (body.thumbnail) {
      body.thumbnail = saveBase64Image(body.thumbnail, 'product')
    }
    if (body.banner) {
      body.banner = saveBase64Image(body.banner, 'product_banner')
    }

    if (body.specification_action === 'add') {
      productRepository.addSpecification(id, body.title, body.value)
    } else if (body.specification_action === 'delete') {
      productRepository.deleteSpecification(body.specification_id)
    } else if (body.faq_action === 'add') {
      productRepository.addFaq(id, body.question, body.answer)
    } else if (body.faq_action === 'delete') {
      productRepository.deleteFaq(body.faq_id)
    } else {
      productRepository.update(id, body)
    }

    const updatedProduct = productRepository.findById(id)
    return NextResponse.json({ success: true, message: 'Product updated successfully', product: updatedProduct })
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
    console.error('Update product error:', errorDetails)
    return NextResponse.json({ success: false, message: 'Failed to update product', error: errorDetails }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    const deleted = productRepository.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Product not found or delete failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 })
  }
}
