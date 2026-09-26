import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'

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
    const { title, type, resource, resource_url } = body
    const finalResource = resource || resource_url

    const updated = courseRepository.updateLessonResource(id, {
      title,
      type,
      resource: finalResource,
    })

    return NextResponse.json({
      success: true,
      message: 'Resource updated successfully',
      resource: updated,
    })
  } catch (error: unknown) {
    console.error('Update lesson resource error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update resource' }, { status: 500 })
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

    const deleted = courseRepository.deleteLessonResource(id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Resource not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Delete lesson resource error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete resource' }, { status: 500 })
  }
}
