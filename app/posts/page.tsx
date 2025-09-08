import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Calendar, User } from "lucide-react"
import { format } from "date-fns"

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SCHEDULED: "bg-purple-100 text-purple-800",
  POSTED: "bg-emerald-100 text-emerald-800",
}

const typeIcons = {
  PHOTO: "📷",
  REEL: "🎬",
  STORY: "📱",
  CAROUSEL: "🎠",
  CUSTOM: "✨",
}

export default async function PublicPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/posts")
  }

  const whereClause =
    session.user.role === "ADMIN" || session.user.role === "MANAGER"
      ? {} // Admins and managers can see all posts
      : session.user.role === "DESIGNER"
        ? {
            OR: [{ createdById: session.user.id }, { assignedToId: session.user.id }],
          }
        : session.user.role === "CLIENT"
          ? {
              project: {
                client: {
                  email: session.user.email,
                },
              },
            }
          : { createdById: session.user.id }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      project: {
        include: { client: true },
      },
      createdBy: true,
      assignedTo: true,
      assets: true,
      platforms: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600">Browse and view post details</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{typeIcons[post.type]}</span>
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>{post.project.client.name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={statusColors[post.status]}>{post.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.caption && <p className="text-sm text-gray-600 line-clamp-3">{post.caption}</p>}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.createdBy.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.createdAt), "MMM dd")}</span>
                  </div>
                </div>

                {post.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.platforms.map((platform: any) => (
                      <Badge key={platform.id} variant="outline" className="text-xs">
                        {platform.platform}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link href={`/posts/${post.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
