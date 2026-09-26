import db from '@/lib/db'

export interface UserRecord {
  id: number
  name: string
  role: 'student' | 'instructor' | 'admin'
  password?: string
  email: string
  status?: number
  photo?: string | null
  google_id?: string | null
  instructor_id?: number | null
  social_links?: string | null
  email_verified_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export const userRepository = {
  findByEmail(email: string): UserRecord | undefined {
    const stmt = db.prepare<[string], UserRecord>(
      'SELECT id, name, role, password, email, status, photo, instructor_id, social_links, email_verified_at FROM users WHERE email = ? COLLATE NOCASE'
    )
    return stmt.get(email.trim())
  },

  findById(id: number): UserRecord | undefined {
    const stmt = db.prepare<[number], UserRecord>(
      'SELECT id, name, role, email, status, photo, instructor_id, social_links, email_verified_at, created_at FROM users WHERE id = ?'
    )
    return stmt.get(id)
  },

  create(user: {
    name: string
    email: string
    password: string
    role?: 'student' | 'instructor' | 'admin'
    status?: number
    photo?: string | null
    instructor_id?: number | null
  }): UserRecord {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password, role, status, photo, instructor_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const result = stmt.run(
      user.name,
      user.email.toLowerCase().trim(),
      user.password,
      user.role || 'student',
      user.status ?? 1,
      user.photo || null,
      user.instructor_id || null,
      now,
      now
    )
    return this.findById(Number(result.lastInsertRowid))!
  },

  update(id: number, updates: Partial<UserRecord>): UserRecord | undefined {
    const fields: string[] = []
    const values: (string | number | null)[] = []

    for (const [key, value] of Object.entries(updates)) {
      if (['name', 'email', 'role', 'status', 'photo', 'password', 'instructor_id', 'social_links'].includes(key)) {
        fields.push(`${key} = ?`)
        values.push(value as string | number | null)
      }
    }

    if (fields.length === 0) return this.findById(id)

    fields.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return this.findById(id)
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
    return result.changes > 0
  },

  listAll(options: {
    role?: string
    search?: string
    limit?: number
    offset?: number
  } = {}): { users: UserRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.role) {
      whereClause += ' AND role = ?'
      params.push(options.role)
    }

    if (options.search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 20
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT id, name, role, email, status, photo, instructor_id, created_at
       FROM users WHERE ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`
    )
    const users = listStmt.all(...params, limit, offset) as UserRecord[]

    return { users, total }
  },
}
