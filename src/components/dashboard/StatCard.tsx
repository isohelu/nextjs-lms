'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  iconBgClass?: string
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgClass = 'bg-gray-100 dark:bg-muted',
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="mt-1 text-2xl font-semibold text-foreground">{value}</h4>
        </div>
        <div className={cn('rounded-full p-3 flex items-center justify-center', iconBgClass)}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
