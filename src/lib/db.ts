import Database from 'better-sqlite3'
import path from 'path'

// Path to the SQLite database
const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db')

// Global cache to prevent multiple connections during dev hot-reloading
const globalForDb = global as unknown as { db: Database.Database | undefined }

export const db: Database.Database =
  globalForDb.db ||
  new Database(DB_PATH, {
    // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

// Enable Write-Ahead Logging for concurrency & performance
try {
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
} catch (err) {
  console.error('Error setting SQLite pragmas:', err)
}

export default db
