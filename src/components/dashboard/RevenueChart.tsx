'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface RevenueChartProps {
  title?: string
  revenueData?: Record<string, number>
}

const DEFAULT_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function RevenueChart({
  title = 'Admin Revenue This Year',
  revenueData = {}
}: RevenueChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Format revenue data for chart
  const chartData = useMemo(() => {
    return DEFAULT_MONTHS.map(month => ({
      month,
      value: Number(revenueData[month] || 0)
    }))
  }, [revenueData])

  // Dynamic Y-axis upper limit (at least 4 as seen in screenshot)
  const yDomain = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.value), 0)
    return [0, Math.max(4, Math.ceil(maxVal))]
  }, [chartData])

  return (
    <Card className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 shadow-xs">
      <h3 className="mb-4 text-lg font-medium text-foreground">
        {title}
      </h3>

      <div className="w-full h-[320px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => value.slice(0, 3)}
                tick={{ fill: 'var(--muted-foreground, #64748b)', fontSize: 12, fontFamily: 'inherit' }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                domain={yDomain}
                tick={{ fill: 'var(--muted-foreground, #64748b)', fontSize: 12, fontFamily: 'inherit' }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
                        <p className="text-xs font-semibold text-muted-foreground">{data.month}</p>
                        <p className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                          ${Number(data.value).toFixed(2)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name={title}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}
      </div>
    </Card>
  )
}
