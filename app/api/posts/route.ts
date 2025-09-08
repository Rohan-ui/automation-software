import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const caption = formData.get("caption") as string
    const type = formData.get("type") as string
    const platforms = JSON.parse(formData.get("platforms") as string)
    const projectId = formData.get("projectId") as string
    const scheduledAt = formData.get("scheduledAt") as string
    const assignedToId = formData.get("assignedToId") as string

    const post = await prisma.post.create({
      data: {
        title,
        caption: caption || null,
        type: type as any,
        platforms: platforms,
        projectId,
        createdById: session.user.id,
        assignedToId: assignedToId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        project: {
          include: { client: true },
        },
        createdBy: true,
        assignedTo: true,
        assets: true,
      },
    })

    // Handle file uploads (simplified for now)
    // In a real app, you'd upload to cloud storage and save URLs to assets table

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignedToMe = searchParams.get("assignedToMe") === "true"
    const status = searchParams.get("status")
    const projectId = searchParams.get("projectId")

    const whereClause: any = {}

    // Role-based filtering
    if (session.user.role === "CLIENT") {
      whereClause.project = { client: { email: session.user.email } }
    } else if (session.user.role === "DESIGNER" && assignedToMe) {
      whereClause.assignedToId = session.user.id
    }

    // Additional filters
    if (status) {
      whereClause.status = status
    }
    if (projectId) {
      whereClause.projectId = projectId
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        project: {
          include: { client: true },
        },
        createdBy: true,
        assignedTo: true,
        assets: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
