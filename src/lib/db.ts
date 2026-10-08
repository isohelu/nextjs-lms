// @ts-ignore
import { DatabaseSync, StatementSync } from 'node:sqlite'
import path from 'path'

// Path to the SQLite database
const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db')

export interface StatementWrapper {
  all<T = any>(...params: unknown[]): T[]
  get<T = any>(...params: unknown[]): T | undefined
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint }
}

export interface DbWrapper {
  prepare(sql: string): StatementWrapper
  exec(sql: string): void
  pragma(sql: string): void
  transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T
}

function createDatabase(): DbWrapper {
  const sqlite = new DatabaseSync(DB_PATH)

  try {
    sqlite.exec('PRAGMA journal_mode = WAL;')
    sqlite.exec('PRAGMA foreign_keys = ON;')
    sqlite.exec('PRAGMA busy_timeout = 5000;')
  } catch (err) {
    console.error('Error setting SQLite pragmas:', err)
  }

  const dbWrapper: DbWrapper = {
    prepare(sql: string): StatementWrapper {
      const stmt = sqlite.prepare(sql)
      return {
        all<T = any>(...params: unknown[]): T[] {
          if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
            return stmt.all(params[0] as Record<string, unknown>) as T[]
          }
          return stmt.all(...(params as (string | number | bigint | null | Uint8Array)[])) as T[]
        },
        get<T = any>(...params: unknown[]): T | undefined {
          if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
            return stmt.get(params[0] as Record<string, unknown>) as T | undefined
          }
          return stmt.get(...(params as (string | number | bigint | null | Uint8Array)[])) as T | undefined
        },
        run(...params: unknown[]) {
          if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
            const res = stmt.run(params[0] as Record<string, unknown>)
            return { changes: res.changes, lastInsertRowid: res.lastInsertRowid }
          }
          const res = stmt.run(...(params as (string | number | bigint | null | Uint8Array)[]))
          return { changes: res.changes, lastInsertRowid: res.lastInsertRowid }
        },
      }
    },
    exec(sql: string) {
      sqlite.exec(sql)
    },
    pragma(sql: string) {
      sqlite.exec(`PRAGMA ${sql};`)
    },
    transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
      return (...args: any[]) => {
        sqlite.exec('BEGIN')
        try {
          const result = fn(...args)
          sqlite.exec('COMMIT')
          return result
        } catch (error) {
          sqlite.exec('ROLLBACK')
          throw error
        }
      }
    },
  }

  return dbWrapper
}

// Global cache to prevent multiple connections during dev hot-reloading
const globalForDb = global as unknown as { db: DbWrapper | undefined }

export const db: DbWrapper = globalForDb.db || createDatabase()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

export default db
