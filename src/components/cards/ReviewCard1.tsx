import React from 'react'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Review1Item {
  id: string | number
  name: string
  image?: string
  rating: number | string
  address: string
  description: string
}

export default function ReviewCard1({
  review,
  className,
}: {
  review: Review1Item
  className?: string
}) {
  const ratingNum = Math.min(5, Math.max(1, parseInt(String(review.rating)) || 5))

  return (
    <Card className={cn("flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: ratingNum }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>
      <p className="mb-6 grow text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
        &ldquo;{review.description}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-2 border-t border-border/40">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
          <img
            src={review.image || '/assets/avatars/avatar-1.png'}
            alt={review.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/assets/avatars/avatar-1.png'
            }}
          />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">{review.name}</p>
          <p className="text-[11px] text-muted-foreground">{review.address}</p>
        </div>
      </div>
    </Card>
  )
}
