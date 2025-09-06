import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"
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

export default async function PostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Get posts based on user role
  const whereClause =
    session.user.role === "CLIENT"
      ? { project: { client: { email: session.user.email } } }
      : session.user.role === "DESIGNER"
        ? { createdById: session.user.id }
        : {} // Admins and Managers see all posts

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      project: {
        include: { client: true },
      },
      createdBy: true,
      assignedTo: true,
      assets: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">Manage your social media content</p>
        </div>
        {["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role) && (
          <Link href="/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Object.keys(statusColors).map((status) => {
          const count = posts.filter((post) => post.status === status).length
          return (
            <Badge key={status} variant="outline" className="whitespace-nowrap">
              {status.charAt(0) + status.slice(1).toLowerCase()} ({count})
            </Badge>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{typeIcons[post.type]}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
                    <CardDescription>{post.project.client.name}</CardDescription>
                  </div>
                </div>
                <Badge className={statusColors[post.status]}>
                  {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.caption && <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>}

              <div className="flex items-center text-sm text-gray-600">
                <FileText className="mr-2 h-4 w-4" />
                {post.type} • {post.platforms.join(", ")}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <User className="mr-2 h-4 w-4" />
                {post.createdBy.name}
              </div>

              {post.scheduledAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(post.scheduledAt), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Badge variant="outline">{post.assets.length} Assets</Badge>
                  <Badge variant="outline">{post.type}</Badge>
                </div>
                <Link href={`/posts/${post.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first post to start managing social media content.
            </p>
            {["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role) && (
              <Link href="/posts/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
