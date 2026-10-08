export interface LiveEventItem {
  id: string
  title: string
  category: 'masterclass' | 'exam' | 'workshop'
  categoryLabel: string
  date: string
  day: string
  month: string
  time: string
  instructor: string
  instructorRole: string
  avatar: string
  thumbnail: string
  targetHours: number
  targetMinutes: number
  targetSeconds: number
  seatsLeft: number
  price?: number
  isLiveNow?: boolean
  slug: string
  liveRoomUrl?: string
}

export interface MasterclassScheduleCardItem {
  id: string
  title: string
  description: string
  category: 'masterclass' | 'certification' | 'workshop' | 'exam'
  categoryLabel: string
  dateDay: string
  dateMonth: string
  dateWeekday: string
  time: string
  rating: number
  reviewsCount: number
  studentsCount: number
  instructorName: string
  instructorAvatar: string
  thumbnail: string
  duration: string
  level: string
  slug: string
  badgeVariant: 'emerald' | 'blue' | 'orange' | 'purple'
  seatsLeft: number
  price: number // 0 for free
  liveRoomUrl?: string
}

export interface LiveSchedulesSectionData {
  // Section 1 Header (Live Sessions & Accredited Exams)
  sec1Badge: string
  sec1Title: string
  sec1Description: string

  // Section 2 Header & Sidebar (Upcoming Masterclasses)
  sec2Badge: string
  sec2TitleLine1: string
  sec2TitleLine2: string
  sec2TitleLine3: string
  sec2Description: string
  sec2ButtonText: string
  sec2ButtonUrl: string

  // Section 1 Events (Top live countdown cards)
  liveEvents: LiveEventItem[]

  // Section 2 Schedules (Upcoming masterclasses cards)
  schedules: MasterclassScheduleCardItem[]
}

export const DEFAULT_LIVE_SCHEDULES_DATA: LiveSchedulesSectionData = {
  sec1Badge: 'Live Sessions & Accredited Exams',
  sec1Title: 'Events & Accredited Exams For You',
  sec1Description:
    'Join live instructor-led workshops and participate in scheduled proctored exams to earn recognized industry certifications.',

  sec2Badge: 'Upcoming Schedules',
  sec2TitleLine1: 'Upcoming',
  sec2TitleLine2: 'Masterclasses &',
  sec2TitleLine3: 'Exam Schedules',
  sec2Description:
    'Reserve your seat early for upcoming accredited assessments and cohort sessions. Learn from industry experts and level up your skills.',
  sec2ButtonText: 'View All Schedules',
  sec2ButtonUrl: '/schedules',

  liveEvents: [
    {
      id: '1',
      title: 'Full-Stack Next.js 15 Server Actions & Supabase Live Lab',
      category: 'masterclass',
      categoryLabel: 'Live Masterclass',
      date: '19',
      day: 'Sunday',
      month: 'OCT',
      time: '8:00 PM EST',
      instructor: 'David Miller',
      instructorRole: 'Staff Frontend Engineer',
      avatar: '/assets/avatars/avatar-1.png',
      thumbnail: '/assets/images/hero-student-cinema.jpg',
      targetHours: 7,
      targetMinutes: 40,
      targetSeconds: 39,
      seatsLeft: 14,
      isLiveNow: true,
      slug: 'nextjs-15-live-lab',
      liveRoomUrl: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'AI Autonomous Agents & LLM Tool Use Proctored Exam',
      category: 'exam',
      categoryLabel: 'Accredited Exam',
      date: '22',
      day: 'Wednesday',
      month: 'OCT',
      time: '6:30 PM EST',
      instructor: 'Elena Rostova',
      instructorRole: 'AI Research Engineer',
      avatar: '/assets/avatars/avatar-2.png',
      thumbnail: '/assets/images/students-2.jpg',
      targetHours: 28,
      targetMinutes: 15,
      targetSeconds: 45,
      seatsLeft: 8,
      slug: 'ai-agents-accreditation-exam',
      liveRoomUrl: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '3',
      title: 'Design Systems Architecture: Figma Tokens to Tailwind v4',
      category: 'workshop',
      categoryLabel: 'Live Workshop',
      date: '25',
      day: 'Saturday',
      month: 'OCT',
      time: '5:00 PM EST',
      instructor: 'Marcus Chen',
      instructorRole: 'Principal UX Architect',
      avatar: '/assets/avatars/avatar-3.png',
      thumbnail: '/assets/images/students-3.jpg',
      targetHours: 49,
      targetMinutes: 30,
      targetSeconds: 20,
      seatsLeft: 22,
      slug: 'design-systems-live-workshop',
      liveRoomUrl: 'https://meet.google.com/abc-defg-hij',
    },
  ],

  schedules: [
    {
      id: 'mc-1',
      title: 'Production Next.js 15 & PostgreSQL Masterclass',
      description:
        'Build and deploy real-world applications with Next.js 15 and PostgreSQL from scratch.',
      category: 'masterclass',
      categoryLabel: 'Masterclass',
      dateDay: '28',
      dateMonth: 'Oct',
      dateWeekday: 'Tue',
      time: '7:00 PM EST',
      rating: 4.8,
      reviewsCount: 124,
      studentsCount: 180,
      instructorName: 'Alexander Wright',
      instructorAvatar: '/assets/avatars/avatar-1.png',
      thumbnail: '/assets/images/students-1.jpg',
      duration: '28 hrs',
      level: 'Advanced',
      slug: 'nextjs-postgresql-masterclass',
      badgeVariant: 'emerald',
      seatsLeft: 18,
      price: 0,
      liveRoomUrl: 'https://meet.google.com/nextjs-masterclass',
    },
    {
      id: 'mc-2',
      title: 'Kubernetes Multi-Region Container Orchestration Exam',
      description: 'Hands-on exam preparation with real scenarios and expert guidance.',
      category: 'certification',
      categoryLabel: 'Certification',
      dateDay: '02',
      dateMonth: 'Nov',
      dateWeekday: 'Thu',
      time: '4:00 PM EST',
      rating: 4.9,
      reviewsCount: 146,
      studentsCount: 215,
      instructorName: 'Sarah Jenkins',
      instructorAvatar: '/assets/avatars/avatar-2.png',
      thumbnail: '/assets/images/students-2.jpg',
      duration: '32 hrs',
      level: 'Intermediate',
      slug: 'kubernetes-multi-region-exam',
      badgeVariant: 'blue',
      seatsLeft: 12,
      price: 49,
      liveRoomUrl: 'https://meet.google.com/k8s-exam-prep',
    },
    {
      id: 'mc-3',
      title: 'Modern Micro-Frontends & Distributed Web Architecture',
      description: 'Learn modern frontend architecture patterns with hands-on projects.',
      category: 'workshop',
      categoryLabel: 'Workshop',
      dateDay: '08',
      dateMonth: 'Nov',
      dateWeekday: 'Wed',
      time: '6:00 PM EST',
      rating: 5.0,
      reviewsCount: 168,
      studentsCount: 250,
      instructorName: 'Marcus Chen',
      instructorAvatar: '/assets/avatars/avatar-3.png',
      thumbnail: '/assets/images/students-3.jpg',
      duration: '36 hrs',
      level: 'All Levels',
      slug: 'modern-micro-frontends-workshop',
      badgeVariant: 'orange',
      seatsLeft: 25,
      price: 0,
      liveRoomUrl: 'https://meet.google.com/microfrontends-workshop',
    },
    {
      id: 'mc-4',
      title: 'AWS Solutions Architect Professional Exam Prep',
      description:
        'Complete exam preparation with practice tests and expert review sessions.',
      category: 'exam',
      categoryLabel: 'Exam',
      dateDay: '18',
      dateMonth: 'Nov',
      dateWeekday: 'Mon',
      time: '5:00 PM EST',
      rating: 4.8,
      reviewsCount: 190,
      studentsCount: 285,
      instructorName: 'Elena Rostova',
      instructorAvatar: '/assets/avatars/avatar-4.png',
      thumbnail: '/assets/images/hero-student-laptop.jpg',
      duration: '40 hrs',
      level: 'Advanced',
      slug: 'aws-solutions-architect-prep',
      badgeVariant: 'purple',
      seatsLeft: 9,
      price: 69,
      liveRoomUrl: 'https://meet.google.com/aws-solutions-prep',
    },
  ],
}
