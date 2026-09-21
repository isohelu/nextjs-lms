/**
 * Sliding Window Token-Bucket Rate Limiter
 * Guards sensitive API routes and server actions against brute force and denial of service.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitRecord>()

interface RateLimitOptions {
  intervalMs?: number // Window duration in milliseconds (default: 60,000ms = 1 min)
  maxRequests?: number // Maximum requests allowed within window (default: 30)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const intervalMs = options.intervalMs ?? 60_000
  const maxRequests = options.maxRequests ?? 30
  const now = Date.now()

  const record = memoryStore.get(identifier)

  // Clean up expired entry or start new window
  if (!record || now > record.resetTime) {
    const resetTime = now + intervalMs
    memoryStore.set(identifier, { count: 1, resetTime })
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.ceil(resetTime / 1000),
    }
  }

  // Rate limit exceeded
  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    }
  }

  // Increment counter
  record.count += 1
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  }
}

// Periodically clean up stale records to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }, 300_000) // Cleanup every 5 minutes
}
