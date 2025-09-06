import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { platform } = await request.json()
    const postId = params.id

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        project: { include: { client: true } },
        assets: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.status !== "APPROVED" && post.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Post must be approved before publishing" }, { status: 400 })
    }

    // Simulate platform API integration
    // In a real implementation, this would:
    // 1. Upload assets to the platform
    // 2. Create the post with caption and media
    // 3. Handle platform-specific formatting
    // 4. Store platform post IDs for tracking

    console.log(`[v0] Publishing post "${post.title}" to ${platform}`)
    console.log(`[v0] Caption: ${post.caption}`)
    console.log(`[v0] Assets: ${post.assets.length} files`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update post status to POSTED
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: "POSTED",
        postedAt: new Date(),
      },
    })

    // Create notification for post creator
    await prisma.notification.create({
      data: {
        title: "Post published successfully",
        message: `Your post "${post.title}" has been published to ${platform}.`,
        userId: post.createdById,
      },
    })

    return NextResponse.json({
      success: true,
      platform,
      postId: `${platform.toLowerCase()}_${Date.now()}`, // Simulated platform post ID
    })
  } catch (error) {
    console.error("Error publishing post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
