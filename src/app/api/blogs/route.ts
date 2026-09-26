import { NextRequest, NextResponse } from 'next/server'
import { blogRepository } from '@/lib/repositories/blogRepository'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit

    const statusParam = searchParams.get('status')
    const status = statusParam === 'all' ? undefined : (statusParam || 'published')

    const result = blogRepository.listAll({
      categorySlug: category,
      search,
      status,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      blogs: result.blogs,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    console.error('Fetch blogs error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve blogs.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getSessionUser } = await import('@/lib/auth/session')
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, slug, description, category_id, thumbnail } = body

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Title and description are required' }, { status: 400 })
    }

    const { saveBase64Image } = await import('@/lib/upload-utils')
    const finalThumbnail = saveBase64Image(thumbnail, 'blog')

    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const newId = blogRepository.create({
      userId: user.id,
      title,
      slug: finalSlug,
      description,
      blogCategoryId: category_id ? Number(category_id) : 1,
      thumbnail: finalThumbnail || undefined
    })

    return NextResponse.json({
      success: true,
      id: newId,
      message: 'Article published successfully'
    })
  } catch (error: unknown) {
    console.error('Create blog error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create blog post' }, { status: 500 })
  }
}
