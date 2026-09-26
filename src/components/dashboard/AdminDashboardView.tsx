'use client'

import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Video,
  UserCheck,
  Users,
  UserPlus
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
  instructors: number
}

interface DashboardState {
  statistics: DashboardStatistics
  revenueData: Record<string, number>
  courseStatusDistribution: Record<string, number>
  pendingWithdrawals: PendingWithdrawal[]
}

const INITIAL_DASHBOARD_STATE: DashboardState = {
  statistics: {
    courses: 16,
    lessons: 0,
    enrollments: 0,
    students: 0,
    instructors: 9,
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
    Approved: 16,
    Upcoming: 0,
    Pending: 0,
    Private: 0,
    Draft: 0,
  },
  pendingWithdrawals: [],
}

export default function AdminDashboardView() {
  const [data, setData] = useState<DashboardState>(INITIAL_DASHBOARD_STATE)
  const [, setLoading] = useState(true)

  useEffect(() => {
    let isSubscribed = true

    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.ok) {
          const json = await response.json()
          if (isSubscribed && json.success) {
            setData({
              statistics: json.statistics || INITIAL_DASHBOARD_STATE.statistics,
              revenueData: json.revenueData || INITIAL_DASHBOARD_STATE.revenueData,
              courseStatusDistribution: json.courseStatusDistribution || INITIAL_DASHBOARD_STATE.courseStatusDistribution,
              pendingWithdrawals: json.pendingWithdrawals || [],
            })
          }
        }
      } catch (error) {
        console.error('Failed to load dynamic admin dashboard data:', error)
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-7">
        {/* 1. Statistics Cards Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title="Courses"
            value={data.statistics.courses}
            icon={<BookOpen className="h-6 w-6 text-[#0284c7]" />}
            iconBgClass="bg-[#e0f2fe]"
          />
          <StatCard
            title="Lessons"
            value={data.statistics.lessons}
            icon={<Video className="h-6 w-6 text-[#16a34a]" />}
            iconBgClass="bg-[#dcfce7]"
          />
          <StatCard
            title="Enrollment"
            value={data.statistics.enrollments}
            icon={<UserCheck className="h-6 w-6 text-[#ea580c]" />}
            iconBgClass="bg-[#ffedd5]"
          />
          <StatCard
            title="Students"
            value={data.statistics.students}
            icon={<Users className="h-6 w-6 text-[#9333ea]" />}
            iconBgClass="bg-[#f3e8ff]"
          />
          <StatCard
            title="Instructors"
            value={data.statistics.instructors}
            icon={<UserPlus className="h-6 w-6 text-[#e11d48]" />}
            iconBgClass="bg-[#ffe4e6]"
          />
        </div>

        {/* 2. Admin Revenue This Year - Area Chart Card */}
        <RevenueChart
          title="Admin Revenue This Year"
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
              viewAllHref="/dashboard/billings/payouts/request"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
