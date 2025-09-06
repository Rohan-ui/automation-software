import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()
    const postId = params.id

    // Verify post exists and user has access
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        project: { include: { client: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user can comment on this post
    const canComment =
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER" ||
      post.createdById === session.user.id ||
      (session.user.role === "CLIENT" && post.project.client.email === session.user.email)

    if (!canComment) {
      return NextResponse.json({ error: "Cannot comment on this post" }, { status: 403 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    })

    // Create notification for post creator (if not commenting on own post)
    if (post.createdById !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: "New comment on your post",
          message: `${session.user.name} commented on "${post.title}".`,
          userId: post.createdById,
        },
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
