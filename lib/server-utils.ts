import type { NextRequest } from "next/server"

/**
 * Extracts the real client IP address from request headers.
 * `request.ip` was removed in Next.js 15 — use this helper instead.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}
