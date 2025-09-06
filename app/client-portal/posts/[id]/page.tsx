import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ClientPostView } from "@/components/client/client-post-view"

interface ClientPostPageProps {
  params: {
    id: string
  }
}

export default async function ClientPostPage({ params }: ClientPostPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin")
  }

  // Get client to verify access
  const client = await prisma.client.findFirst({
    where: { contactEmail: session.user.email },
  })

  if (!client) {
    redirect("/client-portal")
  }

  // Get post with all related data
  const post = await prisma.post.findFirst({
    where: {
      id: params.id,
      project: {
        clientId: client.id,
      },
    },
    include: {
      project: {
        include: { client: true },
      },
      assets: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      platforms: true,
      createdBy: true,
    },
  })

  if (!post) {
    redirect("/client-portal")
  }

  return <ClientPostView post={post} currentUser={session.user} />
}
