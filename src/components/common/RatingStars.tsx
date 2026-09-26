import React, { type ReactElement } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  rating: number
  starClass?: string
  wrapperClass?: string
}

export default function RatingStars({ rating, starClass, wrapperClass }: Props) {
  const renderRatingStars = (rating: number) => {
    const stars: ReactElement[] = []
    const fullStars = Math.floor(rating || 0)

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={cn(
              'h-5 w-5 fill-yellow-400 text-yellow-400',
              starClass
            )}
          />
        )
      } else {
        stars.push(
          <Star
            key={i}
            className={cn('h-5 w-5 text-yellow-400', starClass)}
          />
        )
      }
    }

    return stars
  }

  return (
    <div className={cn('flex items-center gap-px', wrapperClass)}>
      {renderRatingStars(rating)}
    </div>
  )
}
