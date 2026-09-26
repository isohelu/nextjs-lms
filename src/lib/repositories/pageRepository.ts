import { db } from '@/lib/db'

export interface PageSectionData {
  id: number
  page_id: number
  slug: string
  title: string | null
  sub_title: string | null
  description: string | null
  properties: Record<string, any>
  thumbnail: string | null
  active: boolean
  sort: number
}

export interface PageData {
  id: number
  title: string
  slug: string
  type: string
  active?: boolean
  description?: string | null
  sections: PageSectionData[]
}

export interface PageWithSections {
  page: PageData
  sectionsMap: Record<string, PageSectionData>
  topCourses: any[]
  topCategories: any[]
  topInstructors: any[]
  newCourses: any[]
  blogs: any[]
}

export const pageRepository = {
  getPageBySlug(slug: string): PageWithSections | null {
    try {
      const pageRow = db
        .prepare('SELECT id, title, slug, type, description FROM pages WHERE slug = ?')
        .get(slug) as any

      if (!pageRow) return null

      const sectionRows = db
        .prepare('SELECT id, page_id, slug, title, sub_title, description, properties, thumbnail, sort FROM page_sections WHERE page_id = ? ORDER BY sort ASC')
        .all(pageRow.id) as any[]

      const sections: PageSectionData[] = sectionRows.map((s) => {
        let parsedProps: Record<string, any> = {}
        try {
          if (s.properties) {
            parsedProps = typeof s.properties === 'string' ? JSON.parse(s.properties) : s.properties
          }
        } catch {
          parsedProps = {}
        }
        return {
          id: s.id,
          page_id: s.page_id,
          slug: s.slug,
          title: s.title,
          sub_title: s.sub_title,
          description: s.description,
          properties: parsedProps,
          thumbnail: s.thumbnail,
          active: true,
          sort: s.sort,
        }
      })

      const sectionsMap: Record<string, PageSectionData> = {}
      sections.forEach((sec) => {
        sectionsMap[sec.slug] = sec
      })

      // Fetch dynamic contents
      let topCourses: any[] = []
      let newCourses: any[] = []
      let topCategories: any[] = []
      let topInstructors: any[] = []
      let blogs: any[] = []

      // Top Courses
      const topCourseIds = sectionsMap['top_courses']?.properties?.contents || []
      if (topCourseIds.length > 0) {
        const placeholders = topCourseIds.map(() => '?').join(',')
        topCourses = db
          .prepare(
            `SELECT c.*, cat.title as category_title 
             FROM courses c 
             LEFT JOIN course_categories cat ON c.course_category_id = cat.id 
             WHERE c.id IN (${placeholders}) AND c.status = 'approved'`
          )
          .all(...topCourseIds)
      } else {
        topCourses = db
          .prepare(
            `SELECT c.*, cat.title as category_title 
             FROM courses c 
             LEFT JOIN course_categories cat ON c.course_category_id = cat.id 
             WHERE c.status = 'approved' LIMIT 6`
          )
          .all()
      }

      // New Courses
      const newCourseIds = sectionsMap['new_courses']?.properties?.contents || []
      if (newCourseIds.length > 0) {
        const placeholders = newCourseIds.map(() => '?').join(',')
        newCourses = db
          .prepare(
            `SELECT c.*, cat.title as category_title 
             FROM courses c 
             LEFT JOIN course_categories cat ON c.course_category_id = cat.id 
             WHERE c.id IN (${placeholders}) AND c.status = 'approved'`
          )
          .all(...newCourseIds)
      } else {
        newCourses = db
          .prepare(
            `SELECT c.*, cat.title as category_title 
             FROM courses c 
             LEFT JOIN course_categories cat ON c.course_category_id = cat.id 
             WHERE c.status = 'approved' ORDER BY c.id DESC LIMIT 6`
          )
          .all()
      }

      // Top Categories
      const catIds = sectionsMap['top_categories']?.properties?.contents || []
      if (catIds.length > 0) {
        const placeholders = catIds.map(() => '?').join(',')
        topCategories = db
          .prepare(`SELECT * FROM course_categories WHERE id IN (${placeholders}) ORDER BY sort ASC`)
          .all(...catIds)
      } else {
        topCategories = db.prepare(`SELECT * FROM course_categories ORDER BY sort ASC LIMIT 8`).all()
      }

      // Top Instructors
      const instructorIds = sectionsMap['top_instructors']?.properties?.contents || []
      if (instructorIds.length > 0) {
        const placeholders = instructorIds.map(() => '?').join(',')
        topInstructors = db
          .prepare(`SELECT id, name, email, avatar, headline FROM users WHERE id IN (${placeholders})`)
          .all(...instructorIds)
      } else {
        topInstructors = db
          .prepare(`SELECT id, name, email, avatar, headline FROM users WHERE role = 'instructor' LIMIT 6`)
          .all()
      }

      // Blogs
      const blogIds = sectionsMap['blogs']?.properties?.contents || []
      if (blogIds.length > 0) {
        const placeholders = blogIds.map(() => '?').join(',')
        blogs = db
          .prepare(`SELECT * FROM blogs WHERE id IN (${placeholders}) AND status = 'published'`)
          .all(...blogIds)
      } else {
        blogs = db.prepare(`SELECT * FROM blogs WHERE status = 'published' LIMIT 3`).all()
      }

      return {
        page: {
          id: pageRow.id,
          title: pageRow.title,
          slug: pageRow.slug,
          type: pageRow.type,
          description: pageRow.description,
          sections,
        },
        sectionsMap,
        topCourses,
        topCategories,
        topInstructors,
        newCourses,
        blogs,
      }
    } catch (err) {
      console.error('Error in pageRepository.getPageBySlug:', err)
      return null
    }
  },
}

export default pageRepository
