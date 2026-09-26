import db from '@/lib/db'

export interface BlogRecord {
  id: number
  uuid: string
  title: string
  slug: string
  description: string
  thumbnail?: string | null
  banner?: string | null
  keywords?: string | null
  status: string
  user_id: number
  blog_category_id: number
  created_at: string
  updated_at: string
  // Virtual / joined fields
  category_name?: string
  category_slug?: string
  author_name?: string
  author_photo?: string
  comments_count?: number
}

export interface BlogCommentRecord {
  id: number
  content: string
  blog_id: number
  user_id: number
  parent_id?: number | null
  created_at: string
  user_name?: string
  user_photo?: string
}

export const blogRepository = {
  listAll(options: {
    categorySlug?: string
    search?: string
    status?: string
    limit?: number
    offset?: number
  } = {}): { blogs: BlogRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.status) {
      whereClause += ' AND b.status = ?'
      params.push(options.status)
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      whereClause += ' AND cat.slug = ?'
      params.push(options.categorySlug)
    }

    if (options.search) {
      whereClause += ' AND (b.title LIKE ? OR b.description LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM blogs b
       LEFT JOIN blog_categories cat ON b.blog_category_id = cat.id
       WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 12
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT b.*,
              cat.name as category_name, cat.slug as category_slug,
              u.name as author_name, u.email as author_email, u.photo as author_photo,
              (SELECT COUNT(*) FROM blog_comments bc WHERE bc.blog_id = b.id) as comments_count
       FROM blogs b
       LEFT JOIN blog_categories cat ON b.blog_category_id = cat.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE ${whereClause}
       ORDER BY b.id DESC
       LIMIT ? OFFSET ?`
    )

    const blogs = listStmt.all(...params, limit, offset) as BlogRecord[]
    return { blogs, total }
  },

  findBySlug(slug: string): BlogRecord | null {
    const stmt = db.prepare(
      `SELECT b.*,
              cat.name as category_name, cat.slug as category_slug,
              u.name as author_name, u.photo as author_photo,
              (SELECT COUNT(*) FROM blog_comments bc WHERE bc.blog_id = b.id) as comments_count
       FROM blogs b
       LEFT JOIN blog_categories cat ON b.blog_category_id = cat.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.slug = ? LIMIT 1`
    )
    return (stmt.get(slug) as BlogRecord) || null
  },

  findByUuid(uuid: string): BlogRecord | null {
    const stmt = db.prepare(
      `SELECT b.*,
              cat.name as category_name, cat.slug as category_slug,
              u.name as author_name, u.photo as author_photo
       FROM blogs b
       LEFT JOIN blog_categories cat ON b.blog_category_id = cat.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.uuid = ? LIMIT 1`
    )
    return (stmt.get(uuid) as BlogRecord) || null
  },

  getComments(blogId: number): BlogCommentRecord[] {
    const stmt = db.prepare(`
      SELECT bc.*, u.name as user_name, u.photo as user_photo
      FROM blog_comments bc
      JOIN users u ON bc.user_id = u.id
      WHERE bc.blog_id = ?
      ORDER BY bc.id ASC
    `)
    return stmt.all(blogId) as BlogCommentRecord[]
  },

  addComment(blogId: number, userId: number, content: string, parentId?: number | null): number {
    const stmt = db.prepare(`
      INSERT INTO blog_comments (content, blog_id, user_id, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(content, blogId, userId, parentId || null)
    return Number(res.lastInsertRowid)
  },

  create(data: {
    userId: number
    title: string
    slug: string
    description: string
    blogCategoryId?: number
    thumbnail?: string
    status?: string
  }): number {
    const uuid = 'blog-' + Date.now()
    const stmt = db.prepare(`
      INSERT INTO blogs (uuid, user_id, title, slug, description, blog_category_id, thumbnail, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(
      uuid,
      data.userId,
      data.title,
      data.slug,
      data.description,
      data.blogCategoryId || 1,
      data.thumbnail || null,
      data.status || 'published'
    )
    return Number(res.lastInsertRowid)
  },

  findById(id: number): BlogRecord | null {
    const stmt = db.prepare(
      `SELECT b.*,
              cat.name as category_name, cat.slug as category_slug,
              u.name as author_name, u.photo as author_photo,
              (SELECT COUNT(*) FROM blog_comments bc WHERE bc.blog_id = b.id) as comments_count
       FROM blogs b
       LEFT JOIN blog_categories cat ON b.blog_category_id = cat.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ? LIMIT 1`
    )
    return (stmt.get(id) as BlogRecord) || null
  },

  update(id: number, data: Partial<BlogRecord>): boolean {
    const fields: string[] = []
    const params: Record<string, unknown> = { id }

    const updatableKeys: (keyof BlogRecord)[] = [
      'title', 'slug', 'description', 'thumbnail', 'banner', 'keywords', 'status', 'blog_category_id'
    ]

    for (const key of updatableKeys) {
      if (data[key] !== undefined) {
        fields.push(`${String(key)} = @${String(key)}`)
        params[key] = data[key]
      }
    }

    if (fields.length === 0) return false

    fields.push("updated_at = datetime('now')")
    const sql = `UPDATE blogs SET ${fields.join(', ')} WHERE id = @id`
    const stmt = db.prepare(sql)
    const result = stmt.run(params)
    return result.changes > 0
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM blogs WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
