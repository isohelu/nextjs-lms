import db from '@/lib/db'

export interface ProductRecord {
  id: number
  title: string
  slug: string
  status?: string
  summary?: string | null
  description?: string | null
  pricing_type?: 'free' | 'paid'
  price?: number
  discount?: number
  discount_price?: number | null
  inventory?: number
  unlimited_inventory?: number
  featured?: number
  views?: number
  thumbnail?: string | null
  instructor_id?: number
  product_category_id?: number
  product_category_child_id?: number | null
  created_at?: string
  updated_at?: string
  meta_title?: string | null
  meta_keywords?: string | null
  meta_description?: string | null
  og_title?: string | null
  og_description?: string | null
  // Virtual / joined fields
  category_title?: string
  category_slug?: string
  instructor_name?: string
  instructor_email?: string
  instructor_photo?: string
  orders_count?: number
  reviews_count?: number
  average_rating?: number
}

export interface ProductSpecificationRecord {
  id: number
  product_id: number
  title: string
  value: string
  sort: number
}

export interface ProductFaqRecord {
  id: number
  product_id: number
  question: string
  answer: string
  sort: number
}

export interface ProductMediaFileRecord {
  id: number
  name: string
  file_name: string
  mime_type: string
  size: number
  disk: string
}

export interface ProductOrderRecord {
  id: number
  quantity: number
  unit_price: number
  subtotal: number
  discount: number
  tax: number
  total: number
  coupon_code?: string | null
  user_id: number
  product_id: number
  instructor_id: number
  created_at: string
}

export const productRepository = {
  listAll(options: {
    categorySlug?: string
    search?: string
    status?: string
    pricingType?: string
    featured?: boolean
    limit?: number
    offset?: number
    instructorId?: number
  } = {}): { products: ProductRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.status) {
      whereClause += ' AND p.status = ?'
      params.push(options.status)
    }

    if (options.pricingType) {
      whereClause += ' AND p.pricing_type = ?'
      params.push(options.pricingType)
    }

    if (options.featured !== undefined) {
      whereClause += ' AND p.featured = ?'
      params.push(options.featured ? 1 : 0)
    }

    if (options.instructorId) {
      whereClause += ' AND p.instructor_id = ?'
      params.push(options.instructorId)
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      whereClause += ' AND cat.slug = ?'
      params.push(options.categorySlug)
    }

    if (options.search) {
      whereClause += ' AND (p.title LIKE ? OR p.summary LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM products p
       LEFT JOIN product_categories cat ON p.product_category_id = cat.id
       WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 20
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT p.id, p.title, p.slug, p.price, p.discount, p.discount_price,
              p.pricing_type, p.thumbnail, p.summary, p.status, p.created_at,
              p.featured, p.inventory, p.unlimited_inventory, p.views,
              cat.title as category_title, cat.slug as category_slug,
              u.name as instructor_name, u.email as instructor_email, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM product_orders po WHERE po.product_id = p.id) as orders_count,
              (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id) as reviews_count,
              (SELECT COALESCE(AVG(rating), 5.0) FROM product_reviews pr WHERE pr.product_id = p.id) as average_rating
       FROM products p
       LEFT JOIN product_categories cat ON p.product_category_id = cat.id
       LEFT JOIN instructors ins ON p.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE ${whereClause}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`
    )

    const rows = listStmt.all(...params, limit, offset) as ProductRecord[]
    return { products: rows, total }
  },

  findBySlug(slug: string): (ProductRecord & {
    specifications: ProductSpecificationRecord[]
    faqs: ProductFaqRecord[]
    files: ProductMediaFileRecord[]
  }) | null {
    const stmt = db.prepare(
      `SELECT p.*,
              cat.title as category_title, cat.slug as category_slug,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM product_orders po WHERE po.product_id = p.id) as orders_count,
              (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id) as reviews_count,
              (SELECT COALESCE(AVG(rating), 5.0) FROM product_reviews pr WHERE pr.product_id = p.id) as average_rating
       FROM products p
       LEFT JOIN product_categories cat ON p.product_category_id = cat.id
       LEFT JOIN instructors ins ON p.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE p.slug = ?`
    )
    const product = stmt.get(slug) as ProductRecord | undefined
    if (!product) return null

    const specs = db.prepare(
      'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY sort ASC'
    ).all(product.id) as ProductSpecificationRecord[]

    const faqs = db.prepare(
      'SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort ASC'
    ).all(product.id) as ProductFaqRecord[]

    const files = this.getFiles(product.id)

    return {
      ...product,
      specifications: specs,
      faqs,
      files
    }
  },

  findById(id: number): (ProductRecord & {
    specifications: ProductSpecificationRecord[]
    faqs: ProductFaqRecord[]
    files: ProductMediaFileRecord[]
    images: { id: number; name: string; url: string }[]
  }) | null {
    const stmt = db.prepare(
      `SELECT p.*,
              cat.title as category_title, cat.slug as category_slug,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM product_orders po WHERE po.product_id = p.id) as orders_count
       FROM products p
       LEFT JOIN product_categories cat ON p.product_category_id = cat.id
       LEFT JOIN instructors ins ON p.instructor_id = ins.id
       LEFT JOIN users u ON ins.user_id = u.id
       WHERE p.id = ?`
    )
    const product = stmt.get(id) as ProductRecord | undefined
    if (!product) return null

    const specs = db.prepare(
      'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY sort ASC'
    ).all(product.id) as ProductSpecificationRecord[]

    const faqs = db.prepare(
      'SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort ASC'
    ).all(product.id) as ProductFaqRecord[]

    const files = this.getFiles(product.id)

    const galleryRows = db.prepare(`
      SELECT id, name, file_name
      FROM media
      WHERE model_id = ? AND collection_name IN ('gallery-images', 'images')
      ORDER BY id ASC
    `).all(product.id) as { id: number; name: string; file_name: string }[]

    const images = galleryRows.map(r => ({
      id: r.id,
      name: r.name,
      url: `/uploads/${r.file_name}`
    }))

    return {
      ...product,
      specifications: specs,
      faqs,
      files,
      images
    }
  },

  addSpecification(productId: number, title: string, value: string): number {
    const stmt = db.prepare('INSERT INTO product_specifications (product_id, title, value, sort) VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM product_specifications WHERE product_id = ?))')
    const res = stmt.run(productId, title, value, productId)
    return Number(res.lastInsertRowid)
  },

  deleteSpecification(id: number): boolean {
    const res = db.prepare('DELETE FROM product_specifications WHERE id = ?').run(id)
    return res.changes > 0
  },

  addFaq(productId: number, question: string, answer: string): number {
    const stmt = db.prepare('INSERT INTO product_faqs (product_id, question, answer, sort) VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM product_faqs WHERE product_id = ?))')
    const res = stmt.run(productId, question, answer, productId)
    return Number(res.lastInsertRowid)
  },

  deleteFaq(id: number): boolean {
    const res = db.prepare('DELETE FROM product_faqs WHERE id = ?').run(id)
    return res.changes > 0
  },

  getFiles(productId: number): ProductMediaFileRecord[] {
    const stmt = db.prepare(`
      SELECT id, name, file_name, mime_type, size, disk
      FROM media
      WHERE model_id = ? AND collection_name = 'downloadable-files'
      ORDER BY id ASC
    `)
    return stmt.all(productId) as ProductMediaFileRecord[]
  },

  getFileById(productId: number, mediaId: number): ProductMediaFileRecord | null {
    const stmt = db.prepare(`
      SELECT id, name, file_name, mime_type, size, disk
      FROM media
      WHERE id = ? AND model_id = ? AND collection_name = 'downloadable-files'
      LIMIT 1
    `)
    return (stmt.get(mediaId, productId) as ProductMediaFileRecord) || null
  },

  isPurchased(userId: number, productId: number): boolean {
    const stmt = db.prepare(
      `SELECT id FROM product_orders WHERE user_id = ? AND product_id = ? LIMIT 1`
    )
    return !!stmt.get(userId, productId)
  },

  createOrder(order: {
    userId: number
    productId: number
    instructorId: number
    unitPrice: number
    total: number
    discount?: number
    couponCode?: string | null
  }): number {
    const stmt = db.prepare(`
      INSERT INTO product_orders (
        quantity, unit_price, subtotal, discount, tax, total, coupon_code,
        user_id, product_id, instructor_id, created_at, updated_at
      ) VALUES (
        1, @unit_price, @subtotal, @discount, 0, @total, @coupon_code,
        @user_id, @product_id, @instructor_id, datetime('now'), datetime('now')
      )
    `)
    const result = stmt.run({
      unit_price: order.unitPrice,
      subtotal: order.unitPrice,
      discount: order.discount || 0,
      total: order.total,
      coupon_code: order.couponCode || null,
      user_id: order.userId,
      product_id: order.productId,
      instructor_id: order.instructorId
    })
    return Number(result.lastInsertRowid)
  },

  getUserPurchases(userId: number): (ProductRecord & { order_id: number; purchase_date: string; total?: number; order_number?: string })[] {
    const stmt = db.prepare(`
      SELECT p.id, p.title, p.slug, p.price, p.thumbnail, p.summary, p.status,
             po.id as order_id, po.created_at as purchase_date, po.total as total,
             'ORD-' || printf('%05d', po.id) as order_number,
             cat.title as category_title,
             u.name as instructor_name
      FROM product_orders po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN product_categories cat ON p.product_category_id = cat.id
      LEFT JOIN instructors ins ON p.instructor_id = ins.id
      LEFT JOIN users u ON ins.user_id = u.id
      WHERE po.user_id = ?
      ORDER BY po.id DESC
    `)
    return stmt.all(userId) as (ProductRecord & { order_id: number; purchase_date: string; total?: number; order_number?: string })[]
  },

  create(product: Partial<ProductRecord>): number {
    const stmt = db.prepare(`
      INSERT INTO products (
        title, slug, thumbnail, price, discount, discount_price, pricing_type, status,
        featured, unlimited_inventory, inventory, views, summary, description,
        instructor_id, product_category_id, product_category_child_id, created_at, updated_at
      ) VALUES (
        @title, @slug, @thumbnail, @price, @discount, @discount_price, @pricing_type, @status,
        @featured, @unlimited_inventory, @inventory, 0, @summary, @description,
        @instructor_id, @product_category_id, @product_category_child_id, datetime('now'), datetime('now')
      )
    `)
    const result = stmt.run({
      title: product.title || '',
      slug: product.slug || '',
      thumbnail: product.thumbnail || null,
      price: product.price || 0,
      discount: product.discount || 0,
      discount_price: product.discount_price || null,
      pricing_type: product.pricing_type || 'free',
      status: product.status || 'draft',
      featured: product.featured || 0,
      unlimited_inventory: product.unlimited_inventory || 1,
      inventory: product.inventory || 999,
      summary: product.summary || '',
      description: product.description || null,
      instructor_id: product.instructor_id || 1,
      product_category_id: product.product_category_id || 1,
      product_category_child_id: product.product_category_child_id || null,
    })
    return Number(result.lastInsertRowid)
  },

  update(id: number, product: Partial<ProductRecord>): boolean {
    const fields: string[] = []
    const params: Record<string, unknown> = { id }

    const updatableKeys: (keyof ProductRecord)[] = [
      'title', 'slug', 'pricing_type', 'price', 'discount', 'discount_price',
      'thumbnail', 'summary', 'description', 'status', 'featured', 'inventory', 'unlimited_inventory',
      'product_category_id', 'product_category_child_id',
      'meta_title', 'meta_keywords', 'meta_description', 'og_title', 'og_description'
    ]

    for (const key of updatableKeys) {
      if (product[key] !== undefined) {
        fields.push(`${String(key)} = @${String(key)}`)
        let val = product[key]
        if (typeof val === 'boolean') val = val ? 1 : 0
        params[key] = val
      }
    }

    if (fields.length === 0) return false

    fields.push("updated_at = datetime('now')")
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = @id`
    const stmt = db.prepare(sql)
    const result = stmt.run(params)
    return result.changes > 0
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
