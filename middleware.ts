import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/posts/") && !pathname.startsWith("/posts/api")) {
    const postId = pathname.split("/posts/")[1]
    if (postId && !pathname.startsWith("/posts/dashboard")) {
      const dashboardUrl = new URL(`/dashboard/posts/${postId}`, request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })

  // Check if user is authenticated
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/posts/:path*", "/clients/:path*", "/calendar/:path*"],
}
