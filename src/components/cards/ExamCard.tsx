'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, HelpCircle, Award, Star, ShoppingBag, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export interface ExamData {
  id: string | number
  title: string
  slug: string
  thumbnail?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all levels'
  duration_minutes: number
  total_questions: number
  pass_percentage: number
  price?: number
  discount_price?: number
  pricing_type?: 'free' | 'paid'
  average_rating?: number
  reviews_count?: number
  instructor_name?: string
  instructor_avatar?: string
  category_name?: string
  short_description?: string
}

interface ExamCardProps {
  exam: ExamData
  viewType?: 'grid' | 'list'
  className?: string
}

export default function ExamCard({ exam, viewType = 'grid', className }: ExamCardProps) {
  const { addItem, openCart } = useCartStore()
  const isFree = exam.pricing_type === 'free' || (exam.price ?? 0) === 0
  const isList = viewType === 'list'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: `exam-${exam.id}`,
      title: exam.title,
      slug: exam.slug,
      thumbnail: exam.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      price: isFree ? 0 : (exam.discount_price ?? exam.price ?? 0),
      discount_price: exam.discount_price,
      type: 'exam',
      instructor_name: exam.instructor_name,
    })
    openCart()
  }

  return (
    <Card
      className={cn(
        'group flex h-full overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-300 shadow-card hover:shadow-card-hover',
        isList ? 'flex-col sm:flex-row' : 'flex-col justify-between',
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn('relative p-2.5 pb-0', isList && 'sm:w-72 sm:pb-2.5 sm:pr-0 shrink-0')}>
        <Link href={`/exams/${exam.slug}`}>
          <div className={cn(
            'relative w-full overflow-hidden rounded-xl bg-muted',
            isList ? 'h-48 sm:h-full min-h-47.5' : 'h-48'
          )}>
            <img
              src={exam.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80'}
              alt={exam.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {exam.level && (
              <Badge
                variant="secondary"
                className="absolute top-3 left-3 bg-background/90 backdrop-blur text-xs font-semibold capitalize shadow-sm"
              >
                {exam.level}
              </Badge>
            )}
            <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
              {exam.pass_percentage}% to pass
            </div>
          </div>
        </Link>
      </div>

      {/* Details Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              {exam.category_name || 'Certification Exam'}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{exam.average_rating || 4.9}</span>
              <span className="text-muted-foreground font-normal">({exam.reviews_count || 120})</span>
            </div>
          </div>

          <Link href={`/exams/${exam.slug}`} className="block mt-1.5">
            <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary min-h-11">
              {exam.title}
            </h3>
          </Link>

          {isList && exam.short_description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {exam.short_description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{exam.duration_minutes} Mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>{exam.total_questions} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Verified Certificate</span>
            </div>
          </div>
        </div>

        {/* Card Footer Price & Action */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
          <div>
            {isFree ? (
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  ${exam.discount_price ?? exam.price}
                </span>
                {exam.discount_price && exam.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${exam.price}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isFree && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 border-border hover:bg-muted"
                onClick={handleAddToCart}
                title="Add to cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              className="h-9 px-4 font-semibold shadow-sm"
              asChild
            >
              <Link href={`/exams/${exam.slug}`}>
                Take Exam
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
