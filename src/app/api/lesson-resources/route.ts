import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId') || searchParams.get('section_lesson_id') || searchParams.get('lesson_id') || searchParams.get('course_lesson_id')
    if (!lessonId) {
      return NextResponse.json({ success: false, message: 'lessonId is required' }, { status: 400 })
    }

    const resources = courseRepository.getLessonResources(parseInt(lessonId, 10))
    return NextResponse.json({ success: true, resources })
  } catch (error: unknown) {
    console.error('Get lesson resources error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve resources' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, resource, resource_url, file } = body
    const finalType = body.type || 'file'
    const finalResource = resource || resource_url || file || ''
    const lessonId = body.section_lesson_id || body.course_lesson_id || body.lesson_id || body.lessonId

    if (!title || !lessonId) {
      return NextResponse.json(
        { success: false, message: 'Title and lesson ID are required' },
        { status: 400 }
      )
    }

    const created = courseRepository.addLessonResource({
      title,
      type: finalType,
      resource: finalResource,
      section_lesson_id: parseInt(String(lessonId), 10),
    })

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resource: created,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Create lesson resource error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create resource' }, { status: 500 })
  }
}
