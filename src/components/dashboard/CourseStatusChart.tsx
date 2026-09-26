'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface CourseStatusChartProps {
  title?: string
  courseStatusDistribution?: Record<string, number>
}

const STATUS_COLORS: Record<string, string> = {
  Approved: '#10b981',
  Upcoming: '#0284c7',
  Pending: '#f59e0b',
  Private: '#8b5cf6',
  Draft: '#94a3b8',
}

const FALLBACK_COLORS = ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6', '#94a3b8']

export default function CourseStatusChart({
  title = 'Course Status',
  courseStatusDistribution = {}
}: CourseStatusChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const pieChartData = useMemo(() => {
    const entries = Object.entries(courseStatusDistribution)
    if (entries.length === 0) {
      return [
        { name: 'Approved', value: 0 },
        { name: 'Upcoming', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Private', value: 0 },
        { name: 'Draft', value: 0 },
      ]
    }
    return entries.map(([name, value]) => ({
      name,
      value: Number(value || 0)
    }))
  }, [courseStatusDistribution])

  const totalCourses = useMemo(() => {
    return pieChartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [pieChartData])

  return (
    <Card className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
      <h3 className="mb-4 text-lg font-medium text-foreground">
        {title}
      </h3>

      <div className="flex h-75 w-full items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="45%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                paddingAngle={0}
                label={false}
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]
                    return (
                      <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-md ring-1 ring-black/5">
                        <p className="text-xs font-semibold text-slate-700">{data.name}</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          {data.value} Courses ({totalCourses > 0 ? ((Number(data.value) / totalCourses) * 100).toFixed(0) : 0}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        )}
      </div>
    </Card>
  )
}
