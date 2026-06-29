import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logAuditAction } from "@/lib/audit"
import { getClientIp } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        roleId: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      role: user.roles?.name || "DESIGNER",
    }))

    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Only admins can create other admins
    if (role === "ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create admin users" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Find the role record by name
    const roleRecord = await prisma.roles.findUnique({
      where: { name: role },
    })

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(roleRecord ? { roleId: roleRecord.id } : {}),
      },
      include: {
        roles: true,
      },
    })

    // Log audit action
    await logAuditAction({
      userId: session.user.id,
      action: "CREATE",
      entityType: "User",
      entityId: String(user.id),
      newValues: JSON.stringify({ name, email, role }),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.roles?.name || role },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
