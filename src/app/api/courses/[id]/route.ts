import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'
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

    const course = courseRepository.findById(id)
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const sections = courseRepository.getCurriculum(id)
    const live_classes = courseRepository.getLiveClasses(id)
    const faqs = courseRepository.getFaqs(id)
    const requirements = courseRepository.getRequirements(id)
    const outcomes = courseRepository.getOutcomes(id)
    const approvalStatus = courseRepository.calculateApprovalStatus(id)

    return NextResponse.json({
      success: true,
      approvalStatus,
      course: {
        ...course,
        sections,
        live_classes,
        faqs,
        requirements,
        outcomes,
      },
    })
  } catch (error: unknown) {
    console.error('Get course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve course' }, { status: 500 })
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
    if (body.thumbnail && typeof body.thumbnail === 'string' && body.thumbnail.startsWith('data:')) {
      body.thumbnail = saveBase64Image(body.thumbnail, 'course')
    }
    if (body.banner && typeof body.banner === 'string' && body.banner.startsWith('data:')) {
      body.banner = saveBase64Image(body.banner, 'course_banner')
    }
    const updated = courseRepository.update(id, body)
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    const sections = courseRepository.getCurriculum(id)
    const live_classes = courseRepository.getLiveClasses(id)
    const faqs = courseRepository.getFaqs(id)
    const requirements = courseRepository.getRequirements(id)
    const outcomes = courseRepository.getOutcomes(id)
    const approvalStatus = courseRepository.calculateApprovalStatus(id)

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      approvalStatus,
      course: {
        ...updated,
        sections,
        live_classes,
        faqs,
        requirements,
        outcomes,
      },
    })
  } catch (error: unknown) {
    console.error('Update course error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update course'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
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

    const deleted = courseRepository.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Course not found or delete failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Course deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete course' }, { status: 500 })
  }
}
