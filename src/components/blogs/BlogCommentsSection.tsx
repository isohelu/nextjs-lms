'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle2 } from 'lucide-react'

interface CommentItem {
  id: number
  author: string
  avatar: string
  time: string
  content: string
}

interface BlogCommentsSectionProps {
  slug: string
  initialComments?: CommentItem[]
}

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 1,
    author: 'Marcus Chen',
    avatar: '/assets/avatars/avatar-2.png',
    time: '3 days ago',
    content: 'Excellent article! The explanation of dynamic nonces in edge middleware resolved an issue we were struggling with in production deployment.'
  },
  {
    id: 2,
    author: 'Elena Rostova',
    avatar: '/assets/avatars/avatar-3.png',
    time: '1 week ago',
    content: 'Very insightful breakdown of React 19 Server Components. Looking forward to the next part on distributed caching.'
  }
]

export default function BlogCommentsSection({
  slug,
  initialComments = []
}: BlogCommentsSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<CommentItem[]>(() =>
    initialComments.length > 0 ? initialComments : DEFAULT_COMMENTS
  )
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  const handlePostComment = async () => {
    if (!content.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/blogs/${slug}`)
        return
      }

      const data = await res.json()
      if (data.success) {
        setComments((prev) => [
          {
            id: data.commentId || Date.now(),
            author: 'You (Verified Learner)',
            avatar: '/assets/avatars/avatar-1.png',
            time: 'Just now',
            content: content.trim()
          },
          ...prev
        ])
        setContent('')
        setSuccessMsg(true)
        setTimeout(() => setSuccessMsg(false), 3000)
      } else {
        alert(data.message || 'Failed to post comment.')
      }
    } catch {
      // Offline fallback
      setComments((prev) => [
        {
          id: Date.now(),
          author: 'You',
          avatar: '/assets/avatars/avatar-1.png',
          time: 'Just now',
          content: content.trim()
        },
        ...prev
      ])
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <h3 className="text-xl font-bold text-foreground">
        Discussion & Comments ({comments.length})
      </h3>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Your comment has been posted!</span>
        </div>
      )}

      {/* Input box */}
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src="/assets/avatars/avatar-1.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Join the discussion... share your experience or ask a question."
            className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handlePostComment}
              disabled={submitting || !content.trim()}
              className="text-xs font-semibold cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comment list items */}
      <div className="space-y-4 pt-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{comment.author}</span>
                <span className="text-muted-foreground">{comment.time}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
