import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostDetail } from "@/components/posts/post-detail"

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
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
    },
  })

  if (!post) {
    notFound()
  }

  // Check permissions
  const canView =
    session.user.role === "ADMIN" ||
    session.user.role === "MANAGER" ||
    post.createdById === session.user.id ||
    (session.user.role === "CLIENT" && post.project.client.email === session.user.email)

  if (!canView) {
    redirect("/dashboard")
  }

  return <PostDetail post={post} currentUser={session.user} />
}
