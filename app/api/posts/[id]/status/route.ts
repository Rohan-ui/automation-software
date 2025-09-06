import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const postId = params.id

    // Get the post to check permissions
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { createdBy: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check permissions based on status change
    if (status === "SUBMITTED") {
      // Only post creator can submit
      if (post.createdById !== session.user.id) {
        return NextResponse.json({ error: "Only post creator can submit" }, { status: 403 })
      }
    } else if (["APPROVED", "REJECTED"].includes(status)) {
      // Only admins and managers can approve/reject
      if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    // Update post status
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status },
      include: {
        project: { include: { client: true } },
        createdBy: true,
      },
    })

    // Create notification for status change
    await prisma.notification.create({
      data: {
        title: `Post ${status.toLowerCase()}`,
        message: `Your post "${post.title}" has been ${status.toLowerCase()}.`,
        userId: post.createdById,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
