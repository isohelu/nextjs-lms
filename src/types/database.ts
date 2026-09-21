export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description?: string
  instructor_name: string
  instructor_title?: string
  instructor_avatar?: string
  price: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  duration_hours: number
  rating: number
  students_count: number
  thumbnail_url?: string
  category_id?: string
  category?: Category
  is_published: boolean
  created_at: string
  updated_at: string
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  content?: string
  video_url?: string
  duration_minutes: number
  order_index: number
  is_free_preview: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress_percent: number
  enrolled_at: string
  completed_at?: string
  course?: Course
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  completed: boolean
  completed_at: string
}

export interface Profile {
  id: string
  full_name?: string
  avatar_url?: string
  role: 'student' | 'instructor' | 'admin'
  bio?: string
  created_at: string
  updated_at: string
}
