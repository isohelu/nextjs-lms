import db from '@/lib/db'

export interface CourseRecord {
  id: number
  title: string
  slug: string
  course_type?: string
  status?: string
  level?: string
  short_description?: string | null
  description?: string | null
  language?: string
  pricing_type?: 'free' | 'paid'
  price?: number
  discount?: number
  discount_price?: number | null
  thumbnail?: string | null
  banner?: string | null
  preview?: string | null
  expiry_type?: string
  expiry_duration?: string | null
  drip_content?: number | string
  instructor_id?: number
  course_category_id?: number
  course_category_child_id?: number | null
  created_at?: string
  updated_at?: string
  // Virtual / joined fields
  category_title?: string
  category_child_title?: string
  instructor_name?: string
  instructor_email?: string
  instructor_photo?: string
  enrollments_count?: number
  assignments_count?: number
}

export interface SectionRecord {
  id: number
  title: string
  sort: number
  course_id: number
  lessons: LessonRecord[]
  quizzes?: any[]
}

export interface LessonRecord {
  id: number
  title: string
  sort: number
  status?: string
  lesson_type?: string
  lesson_src?: string | null
  duration?: string | null
  is_free?: number
  description?: string | null
  course_section_id: number
}

export const courseRepository = {
  listAll(options: {
    categorySlug?: string
    search?: string
    status?: string
    limit?: number
    offset?: number
    instructorId?: number
  } = {}): { courses: CourseRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.status) {
      whereClause += ' AND c.status = ?'
      params.push(options.status)
    }

    if (options.instructorId) {
      whereClause += ' AND c.instructor_id = ?'
      params.push(options.instructorId)
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      whereClause += ' AND cat.slug = ?'
      params.push(options.categorySlug)
    }

    if (options.search) {
      whereClause += ' AND (c.title LIKE ? OR c.short_description LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 20
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT c.id, c.title, c.slug, c.level, c.price, c.discount, c.discount_price,
              c.pricing_type, c.thumbnail, c.short_description, c.status, c.created_at,
              cat.title as category_title,
              child.title as category_child_title,
              u.name as instructor_name, u.email as instructor_email, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count,
              (SELECT COUNT(*) FROM course_assignments ca WHERE ca.course_id = c.id) as assignments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN course_category_children child ON c.course_category_child_id = child.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE ${whereClause}
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`
    )
    const courses = listStmt.all(...params, limit, offset) as CourseRecord[]

    return { courses, total }
  },

  findBySlug(slug: string): CourseRecord | undefined {
    const stmt = db.prepare<[string], CourseRecord>(
      `SELECT c.*, cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo, u.email as instructor_email,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE c.slug = ?`
    )
    return stmt.get(slug)
  },

  findById(id: number): CourseRecord | undefined {
    const stmt = db.prepare<[number], CourseRecord>(
      `SELECT c.*, cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE c.id = ?`
    )
    return stmt.get(id)
  },

  getCurriculum(courseId: number): (SectionRecord & { section_lessons?: any[]; section_quizzes?: any[] })[] {
    const sectionsStmt = db.prepare<[number], SectionRecord>(
      'SELECT id, title, sort, course_id FROM course_sections WHERE course_id = ? ORDER BY sort ASC, id ASC'
    )
    const sections = sectionsStmt.all(courseId)

    const lessonsStmt = db.prepare<[number], LessonRecord & { resources?: any[] }>(
      'SELECT id, title, sort, status, lesson_type, lesson_provider, lesson_src, duration, is_free, summary, description, course_section_id, course_id FROM section_lessons WHERE course_section_id = ? ORDER BY sort ASC, id ASC'
    )
    const quizzesStmt = db.prepare<[number], any>(
      'SELECT id, title, total_mark as total_marks, pass_mark, duration, hours, minutes, seconds, retake, summary, course_section_id, course_id FROM section_quizzes WHERE course_section_id = ? ORDER BY id ASC'
    )
    const resourcesStmt = db.prepare<[number], any>(
      'SELECT id, title, type, resource, section_lesson_id, created_at, updated_at FROM lesson_resources WHERE section_lesson_id = ? ORDER BY id ASC'
    )
    const questionsStmt = db.prepare<[number], any>(
      'SELECT id, title, type, options, answer, sort, section_quiz_id, created_at, updated_at FROM quiz_questions WHERE section_quiz_id = ? ORDER BY sort ASC, id ASC'
    )

    for (const sec of sections) {
      const lessons = lessonsStmt.all(sec.id)
      for (const les of lessons) {
        les.resources = resourcesStmt.all(les.id)
      }
      const quizzes = quizzesStmt.all(sec.id)
      for (const q of quizzes) {
        q.questions = questionsStmt.all(q.id)
      }

      sec.lessons = lessons
      ;(sec as any).section_lessons = lessons
      sec.quizzes = quizzes
      ;(sec as any).section_quizzes = quizzes
    }

    return sections
  },

  getLessonResources(lessonId: number): any[] {
    return db.prepare('SELECT * FROM lesson_resources WHERE section_lesson_id = ? ORDER BY id ASC').all(lessonId)
  },

  addLessonResource(data: { title: string; type: string; resource: string; section_lesson_id: number }): any {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      'INSERT INTO lesson_resources (title, type, resource, section_lesson_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const info = stmt.run(data.title, data.type, data.resource, data.section_lesson_id, now, now)
    return db.prepare('SELECT * FROM lesson_resources WHERE id = ?').get(info.lastInsertRowid)
  },

  updateLessonResource(id: number, data: { title?: string; type?: string; resource?: string }): any {
    const fields: string[] = []
    const values: any[] = []
    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.type !== undefined) {
      fields.push('type = ?')
      values.push(data.type)
    }
    if (data.resource !== undefined) {
      fields.push('resource = ?')
      values.push(data.resource)
    }
    if (fields.length > 0) {
      fields.push('updated_at = ?')
      values.push(new Date().toISOString())
      values.push(id)
      db.prepare(`UPDATE lesson_resources SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }
    return db.prepare('SELECT * FROM lesson_resources WHERE id = ?').get(id)
  },

  deleteLessonResource(id: number): boolean {
    const result = db.prepare('DELETE FROM lesson_resources WHERE id = ?').run(id)
    return result.changes > 0
  },

  getQuizQuestions(quizId: number): any[] {
    return db.prepare('SELECT * FROM quiz_questions WHERE section_quiz_id = ? ORDER BY sort ASC, id ASC').all(quizId)
  },

  addQuizQuestion(data: { title: string; type: string; options?: string; answer?: string; sort?: number; section_quiz_id: number }): any {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      'INSERT INTO quiz_questions (title, type, options, answer, sort, section_quiz_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    const info = stmt.run(data.title, data.type, data.options || '[]', data.answer || '', data.sort || 1, data.section_quiz_id, now, now)
    return db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(info.lastInsertRowid)
  },

  deleteQuizQuestion(id: number): boolean {
    const result = db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(id)
    return result.changes > 0
  },

  calculateApprovalStatus(courseId: number): {
    approve_able: boolean
    counts: {
      sections_count: number
      lessons_count: number
      quizzes_count: number
      total_content_count: number
    }
    has_requirements: {
      thumbnail: boolean
      min_sections: boolean
      min_lessons: boolean
      min_content: boolean
      outcomes: boolean
      requirements: boolean
    }
    validation_messages: string[]
  } {
    const course = this.findById(courseId)
    const sections = this.getCurriculum(courseId)
    const outcomes = this.getOutcomes(courseId)
    const requirements = this.getRequirements(courseId)

    const sectionsCount = sections.length
    const lessonsCount = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)
    const quizzesCount = sections.reduce((acc, s) => acc + (s.quizzes?.length || 0), 0)
    const totalContent = sectionsCount + lessonsCount

    const hasThumbnail = Boolean(course?.thumbnail)
    const hasMinSections = sectionsCount >= 1
    const hasMinLessons = lessonsCount >= 1
    const hasMinContent = totalContent >= 2
    const hasOutcomes = outcomes && outcomes.length > 0
    const hasRequirements = requirements && requirements.length > 0

    const isReadyForApproval = Boolean(
      hasThumbnail &&
      hasMinSections &&
      hasMinContent &&
      hasOutcomes &&
      hasRequirements
    )

    const validationMessages: string[] = []
    if (!hasThumbnail) {
      validationMessages.push('Course thumbnail is missing')
    }
    if (!hasMinSections) {
      validationMessages.push('Course needs at least 1 section')
    }
    if (!hasMinLessons) {
      validationMessages.push('Course needs at least 1 lesson')
    }
    if (!hasMinContent) {
      validationMessages.push('Course needs at least 2 content items (sections + section_lessons)')
    }
    if (!hasOutcomes) {
      validationMessages.push('Course outcomes are missing')
    }
    if (!hasRequirements) {
      validationMessages.push('Course requirements are missing')
    }

    return {
      approve_able: isReadyForApproval,
      counts: {
        sections_count: sectionsCount,
        lessons_count: lessonsCount,
        quizzes_count: quizzesCount,
        total_content_count: totalContent,
      },
      has_requirements: {
        thumbnail: hasThumbnail,
        min_sections: hasMinSections,
        min_lessons: hasMinLessons,
        min_content: hasMinContent,
        outcomes: hasOutcomes,
        requirements: hasRequirements,
      },
      validation_messages: validationMessages,
    }
  },

  getLiveClasses(courseId: number): any[] {
    return db.prepare('SELECT * FROM course_live_classes WHERE course_id = ? ORDER BY id DESC').all(courseId)
  },

  getFaqs(courseId: number): any[] {
    return db.prepare('SELECT * FROM course_faqs WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)
  },

  getRequirements(courseId: number): any[] {
    return db.prepare('SELECT * FROM course_requirements WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)
  },

  getOutcomes(courseId: number): any[] {
    return db.prepare('SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY sort ASC, id ASC').all(courseId)
  },

  isEnrolled(userId: number, courseId: number): boolean {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM course_enrollments WHERE user_id = ? AND course_id = ?'
    )
    const row = stmt.get(userId, courseId) as { count: number } | undefined
    return (row?.count ?? 0) > 0
  },

  enroll(userId: number, courseId: number, type: string = 'free'): boolean {
    if (this.isEnrolled(userId, courseId)) return true

    const now = new Date().toISOString()
    const stmt = db.prepare(
      `INSERT INTO course_enrollments (enrollment_type, entry_date, user_id, course_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    stmt.run(type, now, userId, courseId, now, now)
    return true
  },

  create(course: Partial<CourseRecord> & { course_category_child_id?: number | null }): CourseRecord {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      `INSERT INTO courses (title, slug, course_type, level, pricing_type, price, discount, discount_price, short_description, description, thumbnail, instructor_id, course_category_id, course_category_child_id, status, language, expiry_type, expiry_duration, drip_content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const result = stmt.run(
      course.title,
      course.slug,
      course.course_type || 'general',
      course.level || 'All Levels',
      course.pricing_type || 'free',
      course.price || 0,
      course.discount ? 1 : 0,
      course.discount_price || null,
      course.short_description || '',
      course.description || '',
      course.thumbnail || null,
      course.instructor_id || 1,
      course.course_category_id || 1,
      course.course_category_child_id || null,
      course.status || 'approved',
      course.language || 'English',
      course.expiry_type || 'lifetime',
      course.expiry_duration || null,
      course.drip_content === 1 || course.drip_content === '1' ? 1 : 0,
      now,
      now
    )
    return this.findById(Number(result.lastInsertRowid))!
  },

  update(id: number, updates: Record<string, unknown>): CourseRecord | undefined {
    const fields: string[] = []
    const values: (string | number | null)[] = []
    const allowed = [
      'title', 'slug', 'course_type', 'level', 'pricing_type', 'price', 'discount',
      'discount_price', 'short_description', 'description', 'thumbnail', 'banner',
      'preview', 'status', 'language', 'expiry_type', 'expiry_duration', 'drip_content',
      'meta_title', 'meta_keywords', 'meta_description', 'og_title', 'og_description',
      'course_category_id', 'course_category_child_id', 'instructor_id', 'mode'
    ]

    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = ?`)
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0)
        } else if (
          (key === 'course_category_child_id' || key === 'discount_price' || key === 'expiry_duration') &&
          (value === '' || value === undefined || value === null)
        ) {
          values.push(null)
        } else if (
          (key === 'course_category_id' || key === 'course_category_child_id' || key === 'instructor_id') &&
          value !== null &&
          value !== undefined &&
          value !== ''
        ) {
          values.push(Number(value))
        } else if ((key === 'price' || key === 'discount_price') && value !== null && value !== undefined && value !== '') {
          values.push(Number(value))
        } else if (key === 'drip_content') {
          values.push(value === 1 || value === '1' || value === true || value === 'enable' ? 1 : 0)
        } else {
          values.push(value as string | number | null)
        }
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?')
      values.push(new Date().toISOString())
      values.push(id)
      db.prepare(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }

    // Sync FAQs if provided
    if (Array.isArray(updates.faqs)) {
      db.prepare('DELETE FROM course_faqs WHERE course_id = ?').run(id)
      const insertFaq = db.prepare(
        'INSERT INTO course_faqs (course_id, question, answer, sort, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
      )
      updates.faqs.forEach((item: any, idx: number) => {
        if (item && item.question && item.answer) {
          insertFaq.run(id, item.question, item.answer, item.sort ?? idx)
        }
      })
    }

    // Sync Requirements if provided
    if (Array.isArray(updates.requirements)) {
      db.prepare('DELETE FROM course_requirements WHERE course_id = ?').run(id)
      const insertReq = db.prepare(
        'INSERT INTO course_requirements (course_id, requirement, sort, created_at, updated_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
      )
      updates.requirements.forEach((item: any, idx: number) => {
        const text = typeof item === 'string' ? item : item?.requirement
        if (text) {
          insertReq.run(id, text, item?.sort ?? idx)
        }
      })
    }

    // Sync Outcomes if provided
    if (Array.isArray(updates.outcomes)) {
      db.prepare('DELETE FROM course_outcomes WHERE course_id = ?').run(id)
      const insertOut = db.prepare(
        'INSERT INTO course_outcomes (course_id, outcome, sort, created_at, updated_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))'
      )
      updates.outcomes.forEach((item: any, idx: number) => {
        const text = typeof item === 'string' ? item : item?.outcome
        if (text) {
          insertOut.run(id, text, item?.sort ?? idx)
        }
      })
    }

    return this.findById(id)
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM courses WHERE id = ?').run(id)
    return result.changes > 0
  },
}
