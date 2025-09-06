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

    const { scheduledAt } = await request.json()
    const postId = params.id

    // Get the post to check permissions
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { createdBy: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check permissions - only admins, managers, and post creators can reschedule
    const canSchedule = ["ADMIN", "MANAGER"].includes(session.user.role) || post.createdById === session.user.id

    if (!canSchedule) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Update scheduled date
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt && post.status === "APPROVED" ? "SCHEDULED" : post.status,
      },
      include: {
        project: { include: { client: true } },
        createdBy: true,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
