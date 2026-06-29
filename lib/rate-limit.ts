import { type NextRequest, NextResponse } from "next/server"
import { getClientIp } from "./server-utils"

interface RateLimitStore {
  count: number
  resetTime: number
}

const tracker = new Map<string, RateLimitStore>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, store] of tracker.entries()) {
    if (now > store.resetTime) {
      tracker.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Simple in-memory sliding window rate limiter for API routes.
 * @param request NextRequest object
 * @param limit Maximum allowed requests in window
 * @param windowMs Window duration in milliseconds (default 15 minutes)
 * @returns NextResponse with 429 status if limit exceeded, or null if request is allowed.
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  const ip = getClientIp(request)
  const key = `${request.nextUrl.pathname}:${ip}`
  const now = Date.now()

  const record = tracker.get(key)

  if (!record || now > record.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return null
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      }
    )
  }

  record.count += 1
  return null
}
