export interface DemoUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  avatar?: string
  dashboardUrl: string
}

export const DEMO_PASSWORD = 'password123'

export const DEMO_USERS: Record<string, DemoUser> = {
  'admin@mentor.test': {
    id: 'demo-admin-1',
    name: 'System Administrator',
    email: 'admin@mentor.test',
    role: 'admin',
    dashboardUrl: '/dashboard',
  },
  'admin@mentorlms.com': {
    id: 'demo-admin-2',
    name: 'System Administrator',
    email: 'admin@mentorlms.com',
    role: 'admin',
    dashboardUrl: '/dashboard',
  },
  'admin@admin.com': {
    id: 'demo-admin-3',
    name: 'System Administrator',
    email: 'admin@admin.com',
    role: 'admin',
    dashboardUrl: '/dashboard',
  },
  'instructor@mentor.test': {
    id: 'demo-instructor-1',
    name: 'Lead Instructor',
    email: 'instructor@mentor.test',
    role: 'instructor',
    dashboardUrl: '/dashboard',
  },
  'instructor@mentorlms.com': {
    id: 'demo-instructor-2',
    name: 'Lead Instructor',
    email: 'instructor@mentorlms.com',
    role: 'instructor',
    dashboardUrl: '/dashboard',
  },
  'david@mentor.test': {
    id: 'demo-instructor-3',
    name: 'David Miller',
    email: 'david@mentor.test',
    role: 'instructor',
    dashboardUrl: '/dashboard',
  },
  'student@mentor.test': {
    id: 'demo-student-1',
    name: 'Alex Johnson',
    email: 'student@mentor.test',
    role: 'student',
    dashboardUrl: '/student/courses',
  },
  'student@mentorlms.com': {
    id: 'demo-student-2',
    name: 'Alex Johnson',
    email: 'student@mentorlms.com',
    role: 'student',
    dashboardUrl: '/student/courses',
  },
}

export function getDemoUser(email: string): DemoUser | null {
  const normalized = email.trim().toLowerCase()
  return DEMO_USERS[normalized] || null
}
