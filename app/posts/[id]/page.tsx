import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostDetail } from "@/components/posts/post-detail"

export default async function PublicPostDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/posts/${params.id}`)
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
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
      },
      platforms: true,
    },
  })

  if (!post) {
    notFound()
  }

  const canView =
    session.user.role === "ADMIN" ||
    session.user.role === "MANAGER" ||
    post.createdById === session.user.id ||
    post.assignedToId === session.user.id ||
    (session.user.role === "CLIENT" && post.project.client.email === session.user.email) ||
    session.user.role === "DESIGNER"

  if (!canView) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <PostDetail post={post} currentUser={session.user} isPublicView={true} />
      </div>
    </div>
  )
}
