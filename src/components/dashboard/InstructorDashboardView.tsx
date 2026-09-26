'use client'

import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Video,
  UserCheck,
  Users,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import CourseStatusChart from '@/components/dashboard/CourseStatusChart'
import PendingWithdrawalsCard, { PendingWithdrawal } from '@/components/dashboard/PendingWithdrawalsCard'

interface DashboardStatistics {
  courses: number
  lessons: number
  enrollments: number
  students: number
}

interface InstructorDashboardState {
  statistics: DashboardStatistics
  revenueData: Record<string, number>
  courseStatusDistribution: Record<string, number>
  pendingWithdrawals: PendingWithdrawal[]
}

const INITIAL_INSTRUCTOR_STATE: InstructorDashboardState = {
  statistics: {
    courses: 0,
    lessons: 0,
    enrollments: 0,
    students: 0,
  },
  revenueData: {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  },
  courseStatusDistribution: {
    Approved: 0,
    Upcoming: 0,
    Pending: 0,
    Private: 0,
    Draft: 0,
  },
  pendingWithdrawals: [],
}

export default function InstructorDashboardView() {
  const [data, setData] = useState<InstructorDashboardState>(INITIAL_INSTRUCTOR_STATE)
  const [, setLoading] = useState(true)

  useEffect(() => {
    let isSubscribed = true

    async function fetchInstructorData() {
      try {
        const response = await fetch('/api/instructor/dashboard')
        if (response.ok) {
          const json = await response.json()
          if (isSubscribed && json.success) {
            setData({
              statistics: json.statistics || INITIAL_INSTRUCTOR_STATE.statistics,
              revenueData: json.revenueData || INITIAL_INSTRUCTOR_STATE.revenueData,
              courseStatusDistribution: json.courseStatusDistribution || INITIAL_INSTRUCTOR_STATE.courseStatusDistribution,
              pendingWithdrawals: json.pendingWithdrawals || [],
            })
          }
        }
      } catch (error) {
        console.error('Failed to load dynamic instructor dashboard data:', error)
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    fetchInstructorData()

    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <DashboardLayout role="instructor">
      <div className="space-y-7">
        {/* 1. Statistics Cards Row (4 cards for instructor) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Courses"
            value={data.statistics.courses}
            icon={<BookOpen className="h-5 w-5 text-blue-500" />}
            iconBgClass="bg-blue-50 dark:bg-blue-950/40"
          />
          <StatCard
            title="Lessons"
            value={data.statistics.lessons}
            icon={<Video className="h-5 w-5 text-green-500" />}
            iconBgClass="bg-green-50 dark:bg-green-950/40"
          />
          <StatCard
            title="Enrollment"
            value={data.statistics.enrollments}
            icon={<UserCheck className="h-5 w-5 text-amber-500" />}
            iconBgClass="bg-amber-50 dark:bg-amber-950/40"
          />
          <StatCard
            title="Students"
            value={data.statistics.students}
            icon={<Users className="h-5 w-5 text-purple-500" />}
            iconBgClass="bg-purple-50 dark:bg-purple-950/40"
          />
        </div>

        {/* 2. Instructor Revenue This Year - Area Chart Card */}
        <RevenueChart
          title="Instructor Revenue This Year"
          revenueData={data.revenueData}
        />

        {/* 3. Course Status Distribution & Latest Pending Withdrawals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <CourseStatusChart
              title="Course Status"
              courseStatusDistribution={data.courseStatusDistribution}
            />
          </div>
          <div className="lg:col-span-8">
            <PendingWithdrawalsCard
              title="Latest Pending Withdrawal Request"
              withdrawals={data.pendingWithdrawals}
              viewAllHref="/dashboard/billings/payouts"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
