import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        manager: true,
        posts: {
          include: {
            creator: true,
            assignee: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, clientId, managerId, startDate, endDate, isActive } = body

    if (!name || !clientId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        clientId,
        managerId: managerId || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive,
      },
      include: {
        client: true,
        manager: true,
      },
    })

    await logAudit({
      action: "PROJECT_UPDATED",
      userId: session.user.id,
      details: `Updated project: ${project.name}`,
      metadata: { projectId: project.id },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { posts: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if project has posts
    if (project.posts.length > 0) {
      return NextResponse.json({ error: "Cannot delete project with existing posts" }, { status: 400 })
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    await logAudit({
      action: "PROJECT_DELETED",
      userId: session.user.id,
      details: `Deleted project: ${project.name}`,
      metadata: { projectId: project.id },
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
