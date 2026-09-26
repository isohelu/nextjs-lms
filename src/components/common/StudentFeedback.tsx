'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import RatingStars from '@/components/common/RatingStars'

export interface RatingDistributionItem {
  stars: number
  count: number
  percentage: number
}

export interface CourseTotalReview {
  total_reviews: number
  average_rating: number
  rating_distribution: RatingDistributionItem[]
}

interface StudentFeedbackProps {
  totalReviews?: CourseTotalReview
}

export default function StudentFeedback({ totalReviews }: StudentFeedbackProps) {
  const reviewsData: CourseTotalReview = totalReviews || {
    total_reviews: 48,
    average_rating: 4.8,
    rating_distribution: [
      { stars: 5, count: 38, percentage: 79.16 },
      { stars: 4, count: 7, percentage: 14.58 },
      { stars: 3, count: 2, percentage: 4.16 },
      { stars: 2, count: 1, percentage: 2.08 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  }

  const averageRating = Number(reviewsData.average_rating || 0).toFixed(1)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Student Feedback
        </h2>
        <p className="font-semibold text-muted-foreground text-sm">
          {reviewsData.total_reviews}{' '}
          {reviewsData.total_reviews === 1 ? 'Review' : 'Reviews'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 rounded-xl bg-card/60 p-6 border border-border">
        {/* Overall Rating */}
        <div className="flex min-w-30 flex-col items-center justify-center">
          <div className="mb-1 text-5xl sm:text-6xl font-extrabold text-amber-500">
            {averageRating}
          </div>
          <div className="mb-2">
            <RatingStars rating={Number(averageRating)} starClass="h-4 w-4" />
          </div>
          <div className="text-sm font-medium text-amber-500">
            Course Rating
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="w-full space-y-2 sm:flex-1">
          {reviewsData.rating_distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              {/* Stars */}
              <div className="flex w-24 shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                <span>{item.stars}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[11px] text-muted-foreground">
                  ({item.count})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="min-w-0 flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <div className="w-14 shrink-0 text-right">
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {Number(item.percentage).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
