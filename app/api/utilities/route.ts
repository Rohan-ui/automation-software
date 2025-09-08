import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const utilities = await prisma.utility.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(utilities)
  } catch (error) {
    console.error("Failed to fetch utilities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, values } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const utility = await prisma.utility.create({
      data: {
        name,
        type,
        values: values || [],
      },
    })

    return NextResponse.json(utility)
  } catch (error) {
    console.error("Failed to create utility:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
