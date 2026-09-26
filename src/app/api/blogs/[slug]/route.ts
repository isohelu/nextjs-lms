import { NextRequest, NextResponse } from 'next/server'
import { blogRepository } from '@/lib/repositories/blogRepository'
import { requireRole } from '@/lib/auth/session'

function resolveBlog(slugOrId: string) {
  if (!isNaN(Number(slugOrId))) {
    const byId = blogRepository.findById(Number(slugOrId))
    if (byId) return byId
  }
  return blogRepository.findBySlug(slugOrId) || blogRepository.findByUuid(slugOrId)
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const blog = resolveBlog(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const comments = blogRepository.getComments(blog.id)

    return NextResponse.json({
      success: true,
      blog,
      comments
    })
  } catch (error: unknown) {
    console.error('Fetch blog post error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve article.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { slug } = await context.params
    const blog = resolveBlog(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const body = await req.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return NextResponse.json({ success: false, message: 'Comment content cannot be empty.' }, { status: 422 })
    }

    const commentId = blogRepository.addComment(blog.id, user.id, content, body.parent_id || null)

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully.',
      commentId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to leave a comment.' }, { status: 401 })
    }
    console.error('Post comment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to post comment.' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await requireRole(['admin', 'instructor'])
    const { slug } = await context.params
    const blog = resolveBlog(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const body = await req.json()
    if (body.thumbnail) {
      const { saveBase64Image } = await import('@/lib/upload-utils')
      body.thumbnail = saveBase64Image(body.thumbnail, 'blog')
    }
    if (body.banner) {
      const { saveBase64Image } = await import('@/lib/upload-utils')
      body.banner = saveBase64Image(body.banner, 'blog_banner')
    }
    const updated = blogRepository.update(blog.id, body)
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Failed to update article.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Article updated successfully.' })
  } catch (error: unknown) {
    console.error('Update blog error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update article.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await requireRole(['admin', 'instructor'])
    const { slug } = await context.params
    const blog = resolveBlog(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const deleted = blogRepository.delete(blog.id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Delete failed.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' })
  } catch (error: unknown) {
    console.error('Delete blog error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete article.' }, { status: 500 })
  }
}
