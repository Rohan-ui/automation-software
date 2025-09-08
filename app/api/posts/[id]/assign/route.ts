import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignedToId } = await request.json()

    const post = await prisma.post.update({
      where: { id: params.id },
      data: { assignedToId },
      include: {
        project: { include: { client: true } },
        createdBy: true,
        assignedTo: true,
        assets: true,
      },
    })

    // Create notification for assigned designer
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          title: "New Task Assigned",
          message: `You have been assigned to work on "${post.title}"`,
          userId: assignedToId,
        },
      })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error assigning post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
