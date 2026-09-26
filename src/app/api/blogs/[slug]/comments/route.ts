import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import { blogRepository } from '@/lib/repositories/blogRepository'

const commentSchema = z.object({
  content: z.string().min(2, 'Comment must be at least 2 characters'),
  parent_id: z.number().int().optional().nullable()
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth()
    const { slug } = await context.params
    const blog = blogRepository.findBySlug(slug) || blogRepository.findByUuid(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const commentId = blogRepository.addComment(blog.id, user.id, parsed.data.content, parsed.data.parent_id)

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully.',
      commentId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to leave a comment.' }, { status: 401 })
    }
    console.error('Post blog comment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to post comment.' }, { status: 500 })
  }
}
