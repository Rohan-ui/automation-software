import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Verify post exists and user has permission
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create asset records for uploaded files
    const assets = await Promise.all(
      files.map(async (file) => {
        // In a real app, you'd upload to cloud storage here
        // For now, we'll simulate with a placeholder URL
        const filename = file.name
        const url = `/uploads/${Date.now()}-${filename}` // Placeholder URL

        return prisma.asset.create({
          data: {
            filename,
            url,
            fileSize: file.size,
            mimeType: file.type,
            postId: params.id,
            uploadedById: session.user.id,
          },
        })
      }),
    )

    return NextResponse.json(assets)
  } catch (error) {
    console.error("Error uploading assets:", error)
    return NextResponse.json({ error: "Failed to upload assets" }, { status: 500 })
  }
}
