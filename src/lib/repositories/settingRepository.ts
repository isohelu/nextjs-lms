import db from '@/lib/db'

export interface SettingRecord {
  id: number
  type: string
  sub_type?: string | null
  title: string
  fields: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export const settingRepository = {
  getAll(): SettingRecord[] {
    const stmt = db.prepare('SELECT * FROM settings ORDER BY id ASC')
    const rows = stmt.all() as (Omit<SettingRecord, 'fields'> & { fields: string })[]
    return rows.map(r => ({
      ...r,
      fields: r.fields ? JSON.parse(r.fields) : {}
    }))
  },

  getByType(type: string, subType: string | null = null): Record<string, unknown> | null {
    let sql = 'SELECT fields FROM settings WHERE type = ?'
    const params: (string | null)[] = [type]
    if (subType !== undefined && subType !== null) {
      sql += ' AND sub_type = ?'
      params.push(subType)
    } else {
      sql += ' AND (sub_type IS NULL OR sub_type = "")'
    }
    sql += ' LIMIT 1'

    const row = db.prepare(sql).get(...params) as { fields: string } | undefined
    if (!row || !row.fields) return null

    try {
      return JSON.parse(row.fields)
    } catch {
      return {}
    }
  },

  updateByType(
    type: string,
    subType: string | null = null,
    fields: Record<string, unknown>
  ): boolean {
    let sqlSelect = 'SELECT id, fields FROM settings WHERE type = ?'
    const params: (string | null)[] = [type]
    if (subType !== undefined && subType !== null) {
      sqlSelect += ' AND sub_type = ?'
      params.push(subType)
    } else {
      sqlSelect += ' AND (sub_type IS NULL OR sub_type = "")'
    }

    const row = db.prepare(sqlSelect).get(...params) as { id: number; fields: string } | undefined

    if (row) {
      const currentFields = row.fields ? JSON.parse(row.fields) : {}
      const merged = { ...currentFields, ...fields }
      const updateStmt = db.prepare(`
        UPDATE settings SET fields = ?, updated_at = datetime('now') WHERE id = ?
      `)
      const res = updateStmt.run(JSON.stringify(merged), row.id)
      return res.changes > 0
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO settings (type, sub_type, title, fields, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      const title = `${type.toUpperCase()} Settings`
      const res = insertStmt.run(type, subType, title, JSON.stringify(fields))
      return res.changes > 0
    }
  },

  getSystemSettings(): {
    name: string
    title: string
    logo_dark: string
    logo_light: string
    favicon: string
    email: string
    phone: string
    selling_currency: string
    selling_tax: number
    instructor_revenue: number
  } {
    const raw = this.getByType('system', 'collaborative') || {}
    return {
      name: (raw.name as string) || 'Mentor Learning Management System',
      title: (raw.title as string) || 'Mentor Learning Management System',
      logo_dark: (raw.logo_dark as string) || '/assets/icons/logo-dark.png',
      logo_light: (raw.logo_light as string) || '/assets/icons/logo-light.png',
      favicon: (raw.favicon as string) || '/favicon.ico',
      email: (raw.email as string) || 'admin@yourdomain.com',
      phone: (raw.phone as string) || '+123 45 678 9201',
      selling_currency: (raw.selling_currency as string) || 'USD',
      selling_tax: Number(raw.selling_tax ?? 5),
      instructor_revenue: Number(raw.instructor_revenue ?? 70),
    }
  },

  getPaymentGateways(): Record<string, { active: boolean; test_mode?: boolean; [key: string]: unknown }> {
    const stmt = db.prepare("SELECT sub_type, fields FROM settings WHERE type = 'payment'")
    const rows = stmt.all() as { sub_type: string; fields: string }[]
    const gateways: Record<string, { active: boolean; [key: string]: unknown }> = {}
    for (const r of rows) {
      if (r.sub_type) {
        try {
          gateways[r.sub_type] = JSON.parse(r.fields)
        } catch {
          gateways[r.sub_type] = { active: false }
        }
      }
    }
    return gateways
  },

  getSmtpSettings(): Record<string, unknown> {
    return this.getByType('smtp') || {}
  }
}
