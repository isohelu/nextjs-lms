import React from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface ReviewData {
  id: string | number
  author_name: string
  author_avatar?: string
  rating: number
  created_at: string
  content: string
  verified?: boolean
}

export default function ReviewCard({
  review,
  className,
}: {
  review: ReviewData
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-card',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={review.author_avatar} alt={review.author_name} />
            <AvatarFallback className="font-semibold text-primary">
              {review.author_name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-foreground text-sm">
                {review.author_name}
              </h4>
              {review.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{review.created_at}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
        {review.content}
      </p>
    </div>
  )
}
