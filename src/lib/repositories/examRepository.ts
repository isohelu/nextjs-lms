import db from '@/lib/db'

export interface ExamRecord {
  id: number
  title: string
  slug: string
  short_description?: string | null
  description?: string | null
  status?: string
  level?: string
  pricing_type?: 'free' | 'paid'
  price?: number
  discount?: number
  discount_price?: number | null
  duration_hours?: number
  duration_minutes?: number
  pass_mark?: number
  total_marks?: number
  max_attempts?: number
  total_questions?: number
  thumbnail?: string | null
  banner?: string | null
  expiry_type?: string
  expiry_duration?: string | null
  instructor_id?: number
  exam_category_id?: number
  created_at?: string
  updated_at?: string
  // Virtual / joined fields
  category_title?: string
  instructor_name?: string
  instructor_email?: string
  instructor_photo?: string
  enrollments_count?: number
  attempts_count?: number
}

export interface ExamQuestionRecord {
  id: number
  exam_id: number
  question_type: string
  title: string
  marks: number
  sort: number
  options: ExamQuestionOptionRecord[]
}

export interface ExamQuestionOptionRecord {
  id: number
  exam_question_id: number
  option_text: string
  is_correct?: number
  sort: number
}

export interface ExamAttemptRecord {
  id: number
  user_id: number
  exam_id: number
  attempt_number: number
  start_time: string
  end_time?: string | null
  total_marks: number
  obtained_marks: number
  correct_answers: number
  incorrect_answers: number
  is_passed: number
  status: 'in_progress' | 'completed' | 'timeout'
  created_at: string
}

export const examRepository = {
  listAll(options: {
    categorySlug?: string
    search?: string
    status?: string
    limit?: number
    offset?: number
    instructorId?: number
  } = {}): { exams: ExamRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.status) {
      whereClause += ' AND e.status = ?'
      params.push(options.status)
    }

    if (options.instructorId) {
      whereClause += ' AND e.instructor_id = ?'
      params.push(options.instructorId)
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      whereClause += ' AND cat.slug = ?'
      params.push(options.categorySlug)
    }

    if (options.search) {
      whereClause += ' AND (e.title LIKE ? OR e.short_description LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM exams e
       LEFT JOIN exam_categories cat ON e.exam_category_id = cat.id
       WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 20
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT e.id, e.title, e.slug, e.level, e.price, e.discount, e.discount_price,
              e.pricing_type, e.thumbnail, e.short_description, e.status, e.created_at,
              e.duration_hours, e.duration_minutes, e.pass_mark, e.total_marks, e.max_attempts, e.total_questions,
              cat.title as category_title,
              u.name as instructor_name, u.email as instructor_email, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM exam_enrollments en WHERE en.exam_id = e.id) as enrollments_count,
              (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.exam_id = e.id) as attempts_count
       FROM exams e
       LEFT JOIN exam_categories cat ON e.exam_category_id = cat.id
       LEFT JOIN instructors ins ON e.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE ${whereClause}
       ORDER BY e.id DESC
       LIMIT ? OFFSET ?`
    )

    const rows = listStmt.all(...params, limit, offset) as ExamRecord[]
    return { exams: rows, total }
  },

  findBySlug(slug: string): ExamRecord | null {
    const stmt = db.prepare(
      `SELECT e.*,
              cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM exam_enrollments en WHERE en.exam_id = e.id) as enrollments_count
       FROM exams e
       LEFT JOIN exam_categories cat ON e.exam_category_id = cat.id
       LEFT JOIN instructors ins ON e.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE e.slug = ?`
    )
    return (stmt.get(slug) as ExamRecord) || null
  },

  findById(id: number): ExamRecord | null {
    const stmt = db.prepare(
      `SELECT e.*,
              cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM exam_enrollments en WHERE en.exam_id = e.id) as enrollments_count
       FROM exams e
       LEFT JOIN exam_categories cat ON e.exam_category_id = cat.id
       LEFT JOIN instructors ins ON e.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE e.id = ?`
    )
    return (stmt.get(id) as ExamRecord) || null
  },

  getQuestions(examId: number, includeAnswers = false): ExamQuestionRecord[] {
    const qStmt = db.prepare(
      `SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY sort ASC, id ASC`
    )
    const questions = qStmt.all(examId) as (ExamQuestionRecord & { options: ExamQuestionOptionRecord[] })[]

    const optStmt = db.prepare(
      `SELECT id, exam_question_id, option_text, ${includeAnswers ? 'is_correct' : '0 as is_correct'}, sort 
       FROM exam_question_options 
       WHERE exam_question_id = ? 
       ORDER BY sort ASC, id ASC`
    )

    for (const q of questions) {
      q.options = optStmt.all(q.id) as ExamQuestionOptionRecord[]
    }

    return questions
  },

  isEnrolled(userId: number, examId: number): boolean {
    const stmt = db.prepare(
      `SELECT id FROM exam_enrollments WHERE user_id = ? AND exam_id = ? LIMIT 1`
    )
    return !!stmt.get(userId, examId)
  },

  enroll(userId: number, examId: number, enrollmentType = 'free'): boolean {
    if (this.isEnrolled(userId, examId)) return true

    const stmt = db.prepare(
      `INSERT INTO exam_enrollments (user_id, exam_id, enrollment_type, entry_date, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`
    )
    const result = stmt.run(userId, examId, enrollmentType)
    return result.changes > 0
  },

  startAttempt(userId: number, examId: number): number {
    const countStmt = db.prepare(
      `SELECT COUNT(*) as count FROM exam_attempts WHERE user_id = ? AND exam_id = ?`
    )
    const count = ((countStmt.get(userId, examId) as { count: number })?.count || 0) + 1

    const exam = this.findById(examId)
    const totalMarks = exam?.total_marks || 100

    const stmt = db.prepare(`
      INSERT INTO exam_attempts (
        user_id, exam_id, attempt_number, start_time, total_marks, obtained_marks,
        correct_answers, incorrect_answers, is_passed, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, datetime('now'), ?, 0, 0, 0, 0, 'in_progress', datetime('now'), datetime('now')
      )
    `)
    const result = stmt.run(userId, examId, count, totalMarks)
    return Number(result.lastInsertRowid)
  },

  submitAttempt(
    attemptId: number,
    answers: { questionId: number; selectedOptionId?: number }[]
  ): {
    attemptId: number
    obtainedMarks: number
    totalMarks: number
    correctCount: number
    incorrectCount: number
    isPassed: boolean
  } {
    const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(attemptId) as ExamAttemptRecord
    if (!attempt) {
      throw new Error('Attempt not found')
    }

    const exam = this.findById(attempt.exam_id)
    if (!exam) {
      throw new Error('Exam not found')
    }

    const questions = this.getQuestions(attempt.exam_id, true)
    let correctCount = 0
    let incorrectCount = 0
    let obtainedMarks = 0
    const totalMarks = exam.total_marks || 100

    const insertAnsStmt = db.prepare(`
      INSERT INTO exam_attempt_answers (
        exam_attempt_id, exam_question_id, answer_data, is_correct, marks_obtained, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const transaction = db.transaction(() => {
      for (const q of questions) {
        const userSubmission = answers.find(a => a.questionId === q.id)
        let isCorrect = 0
        let marksForQuestion = 0

        if (userSubmission?.selectedOptionId) {
          const matchedOpt = q.options.find(o => o.id === userSubmission.selectedOptionId)
          if (matchedOpt && matchedOpt.is_correct === 1) {
            isCorrect = 1
            marksForQuestion = q.marks || 10
            correctCount++
            obtainedMarks += marksForQuestion
          } else {
            incorrectCount++
          }
        } else {
          incorrectCount++
        }

        insertAnsStmt.run(
          attemptId,
          q.id,
          JSON.stringify({ selectedOptionId: userSubmission?.selectedOptionId || null }),
          isCorrect,
          marksForQuestion
        )
      }

      const passMark = exam.pass_mark || 60
      const scorePercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
      const isPassed = scorePercentage >= passMark ? 1 : 0

      const updateAttemptStmt = db.prepare(`
        UPDATE exam_attempts SET
          end_time = datetime('now'),
          obtained_marks = ?,
          correct_answers = ?,
          incorrect_answers = ?,
          is_passed = ?,
          status = 'completed',
          updated_at = datetime('now')
        WHERE id = ?
      `)
      updateAttemptStmt.run(obtainedMarks, correctCount, incorrectCount, isPassed, attemptId)

      return {
        attemptId,
        obtainedMarks,
        totalMarks,
        correctCount,
        incorrectCount,
        isPassed: isPassed === 1
      }
    })

    return transaction()
  },

  getAttempts(userId: number, examId?: number): ExamAttemptRecord[] {
    let sql = 'SELECT * FROM exam_attempts WHERE user_id = ?'
    const params: (string | number)[] = [userId]
    if (examId) {
      sql += ' AND exam_id = ?'
      params.push(examId)
    }
    sql += ' ORDER BY id DESC'
    return db.prepare(sql).all(...params) as ExamAttemptRecord[]
  },

  create(exam: Partial<ExamRecord>): number {
    const stmt = db.prepare(`
      INSERT INTO exams (
        title, slug, thumbnail, level, duration_hours, duration_minutes, pass_mark, total_marks,
        max_attempts, total_questions, price, discount, discount_price, pricing_type, status,
        short_description, description, instructor_id, exam_category_id, expiry_type, expiry_duration, created_at, updated_at
      ) VALUES (
        @title, @slug, @thumbnail, @level, @duration_hours, @duration_minutes, @pass_mark, @total_marks,
        @max_attempts, @total_questions, @price, @discount, @discount_price, @pricing_type, @status,
        @short_description, @description, @instructor_id, @exam_category_id, @expiry_type, @expiry_duration, datetime('now'), datetime('now')
      )
    `)
    const result = stmt.run({
      title: exam.title || '',
      slug: exam.slug || '',
      thumbnail: exam.thumbnail || null,
      level: exam.level || 'beginner',
      duration_hours: exam.duration_hours || 1,
      duration_minutes: exam.duration_minutes || 0,
      pass_mark: exam.pass_mark || 60,
      total_marks: exam.total_marks || 100,
      max_attempts: exam.max_attempts || 1,
      total_questions: exam.total_questions || 10,
      price: exam.price || 0,
      discount: exam.discount || 0,
      discount_price: exam.discount_price || null,
      pricing_type: exam.pricing_type || 'free',
      status: exam.status || 'draft',
      short_description: exam.short_description || null,
      description: exam.description || null,
      instructor_id: exam.instructor_id || 1,
      exam_category_id: exam.exam_category_id || 1,
      expiry_type: exam.expiry_type || 'lifetime',
      expiry_duration: exam.expiry_duration || null,
    })
    return Number(result.lastInsertRowid)
  },

  update(id: number, exam: Partial<ExamRecord>): boolean {
    const fields: string[] = []
    const params: Record<string, unknown> = { id }

    const updatableKeys = [
      'title', 'slug', 'level', 'pricing_type', 'price', 'discount', 'discount_price',
      'thumbnail', 'banner', 'short_description', 'description', 'status',
      'duration_hours', 'duration_minutes', 'pass_mark', 'total_marks', 'max_attempts', 'total_questions',
      'expiry_type', 'expiry_duration', 'meta_title', 'meta_keywords', 'meta_description',
      'og_title', 'og_description', 'exam_category_id'
    ]

    for (const key of updatableKeys) {
      if ((exam as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${key} = @${key}`)
        let val = (exam as Record<string, unknown>)[key]
        if (typeof val === 'boolean') val = val ? 1 : 0
        params[key] = val
      }
    }

    if (fields.length === 0) return false

    fields.push("updated_at = datetime('now')")
    const sql = `UPDATE exams SET ${fields.join(', ')} WHERE id = @id`
    const stmt = db.prepare(sql)
    const result = stmt.run(params)
    return result.changes > 0
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM exams WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
