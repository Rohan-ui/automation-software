import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CalendarView } from "@/components/calendar/calendar-view"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Get posts with scheduled dates based on user role
  const whereClause =
    session.user.role === "CLIENT"
      ? { project: { client: { email: session.user.email } } }
      : session.user.role === "DESIGNER"
        ? { createdById: session.user.id }
        : {} // Admins and Managers see all posts

  const posts = await prisma.post.findMany({
    where: {
      ...whereClause,
      scheduledAt: { not: null },
    },
    include: {
      project: {
        include: { client: true },
      },
      createdBy: true,
    },
    orderBy: { scheduledAt: "asc" },
  })

  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: { client: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
        <p className="text-gray-600">Schedule and manage your social media posts</p>
      </div>

      <CalendarView posts={posts} projects={projects} currentUser={session.user} />
    </div>
  )
}
