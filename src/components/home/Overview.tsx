'use client'

import React from 'react'
import {
  Code2,
  Users2,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react'

export default function Overview() {
  const highlights = [
    {
      icon: Code2,
      tag: 'Hands-on Learning',
      title: 'Project-First Curriculum',
      description: 'Build portfolio-ready full-stack applications with guided milestones and live test suites.',
      accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1E4D3B] dark:text-emerald-400',
    },
    {
      icon: Users2,
      tag: 'Senior Mentorship',
      title: '1-on-1 Code Reviews',
      description: 'Receive asynchronous and live feedback from verified staff engineers to refine your software architecture.',
      accentBg: 'bg-orange-500/10 dark:bg-orange-500/20 text-[#FF6B2C]',
    },
    {
      icon: Award,
      tag: 'Verified Credentials',
      title: 'Accredited Certificates',
      description: 'Earn tamper-proof digital certificates verifiable via unique QR codes for LinkedIn and employer validation.',
      accentBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Zap,
      tag: 'Adaptive Engine',
      title: 'Real-Time Progress Tracking',
      description: 'Stay on course with interactive streak badges, quiz analytics, and personalized recommendations.',
      accentBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    },
  ]

  const stats = [
    { value: '68k+', label: 'Active Students Enrolled' },
    { value: '98.4%', label: 'Course Completion Rate' },
    { value: '4.9/5', label: 'Average Learner Rating' },
    { value: '1,200+', label: 'Hired in Global Tech' },
  ]

  return (
    <section className="relative py-8 sm:py-10 lg:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 px-3.5 py-1 text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#D8FC38]" />
            THE COMPLETE LEARNING OS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed for Real-World{' '}
            <span className="underline decoration-[#D8FC38] decoration-4 underline-offset-8">Competence &amp; Mastery</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to master advanced technologies, practice with live feedback, and elevate your engineering career.
          </p>
        </div>

        {/* 4 Feature Bento Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="h-full">
                <div className="group relative flex flex-col justify-between h-full rounded-[22px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-[#D8FC38]/60 hover:shadow-xl">
                  <div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accentBg} transition-transform duration-200 ease-out group-hover:scale-105`}>
                      <Icon className="h-5 w-5 stroke-[2]" />
                    </div>

                    <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {item.tag}
                    </span>

                    <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#D8FC38]" />
                    <span>Verified standard</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Numbers Ribbon */}
        <div className="mt-10 sm:mt-12 rounded-[26px] bg-slate-950 border border-slate-800/90 p-6 sm:p-8 text-white shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {stats.map((st, i) => (
              <div key={i} className={i > 0 ? 'pt-4 sm:pt-0' : ''}>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {st.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-300">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
