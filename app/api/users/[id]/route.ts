import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAuditAction } from "@/lib/audit"
import { getClientIp } from "@/lib/server-utils"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, role } = await request.json()
    const { id: userId } = await params

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { roles: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admins can modify admin users or assign admin role
    const currentRole = currentUser.roles?.name || ""
    if ((currentRole === "ADMIN" || role === "ADMIN") && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can modify admin users" }, { status: 403 })
    }

    // Check if email is already taken by another user
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser && String(existingUser.id) !== userId) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Find the role record by name
    const roleRecord = await prisma.roles.findUnique({
      where: { name: role },
    })

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        email,
        ...(roleRecord ? { roleId: roleRecord.id } : {}),
      },
      include: { roles: true },
    })

    // Log audit action
    await logAuditAction({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "User",
      entityId: userId,
      oldValues: JSON.stringify({ name: currentUser.name, email: currentUser.email, role: currentRole }),
      newValues: JSON.stringify({ name, email, role }),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      message: "User updated successfully",
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.roles?.name || role },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 })
    }

    const { id: userId } = await params

    // Prevent self-deletion
    if (userId === String(session.user.id)) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Get user data for audit log
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { roles: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(userId) },
    })

    // Log audit action
    await logAuditAction({
      userId: session.user.id,
      action: "DELETE",
      entityType: "User",
      entityId: userId,
      oldValues: JSON.stringify({ name: user.name, email: user.email, role: user.roles?.name }),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
