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

  let projects = []
  try {
    projects = await prisma.project.findMany({
      where: { isActive: true },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Continue with empty projects array - form will handle this gracefully
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">Design and schedule your social media content across platforms</p>
      </div>

      {projects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No active projects found. You need at least one active project to create posts.
            <a href="/dashboard/projects" className="ml-2 text-yellow-900 underline hover:no-underline">
              Manage Projects
            </a>
          </p>
        </div>
      )}

      <PostForm projects={projects} />
    </div>
  )
}
