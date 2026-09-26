import db from '@/lib/db'
import crypto from 'crypto'

export interface NotificationRecord {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: string
  read_at: string | null
  created_at: string | null
  updated_at: string | null
}

export const notificationRepository = {
  getForUser(userId: number, options?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    const limit = options?.limit ?? 20
    const offset = options?.offset ?? 0

    let sql = 'SELECT * FROM notifications WHERE notifiable_type = ? AND notifiable_id = ?'
    const params: (string | number)[] = ['App\\Models\\User', userId]

    if (options?.unreadOnly) {
      sql += ' AND read_at IS NULL'
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const list = db.prepare(sql).all(...params) as NotificationRecord[]

    const countSql = options?.unreadOnly
      ? 'SELECT COUNT(*) as count FROM notifications WHERE notifiable_type = ? AND notifiable_id = ? AND read_at IS NULL'
      : 'SELECT COUNT(*) as count FROM notifications WHERE notifiable_type = ? AND notifiable_id = ?'
    
    const total = (db.prepare(countSql).get('App\\Models\\User', userId) as { count: number }).count
    const unreadCount = (
      db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE notifiable_type = ? AND notifiable_id = ? AND read_at IS NULL'
      ).get('App\\Models\\User', userId) as { count: number }
    ).count

    return {
      notifications: list.map((n) => {
        let parsedData = {}
        try {
          parsedData = JSON.parse(n.data)
        } catch {
          parsedData = { message: n.data }
        }
        return {
          ...n,
          data: parsedData,
        }
      }),
      total,
      unreadCount,
    }
  },

  markAsRead(notificationId: string, userId: number): NotificationRecord | undefined {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      'UPDATE notifications SET read_at = ?, updated_at = ? WHERE id = ? AND notifiable_id = ? AND notifiable_type = ?'
    )
    stmt.run(now, now, notificationId, userId, 'App\\Models\\User')
    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId) as NotificationRecord | undefined
  },

  markAllAsRead(userId: number): number {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      'UPDATE notifications SET read_at = ?, updated_at = ? WHERE notifiable_id = ? AND notifiable_type = ? AND read_at IS NULL'
    )
    const res = stmt.run(now, now, userId, 'App\\Models\\User')
    return res.changes
  },

  create(userId: number, type: string, data: Record<string, unknown>): NotificationRecord {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const dataStr = JSON.stringify(data)

    const stmt = db.prepare(
      `INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    stmt.run(id, type, 'App\\Models\\User', userId, dataStr, now, now)

    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as NotificationRecord
  },
}
