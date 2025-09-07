import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostForm } from "@/components/forms/post-form"

export default async function NewPostPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  // Get projects for the dropdown
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: { client: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">Design and schedule your social media content</p>
      </div>

      <PostForm projects={projects} />
    </div>
  )
}
