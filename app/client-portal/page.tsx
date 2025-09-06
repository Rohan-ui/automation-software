import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Eye, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function ClientPortalPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin")
  }

  // Get client's projects and posts
  const client = await prisma.client.findFirst({
    where: { contactEmail: session.user.email },
    include: {
      projects: {
        include: {
          posts: {
            include: {
              assets: true,
              comments: {
                include: { user: true },
              },
              platforms: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!client) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>No client account found for your email address.</p>
        </div>
      </div>
    )
  }

  const allPosts = client.projects.flatMap((project) =>
    project.posts.map((post) => ({ ...post, projectName: project.name })),
  )

  const statusCounts = {
    draft: allPosts.filter((p) => p.status === "DRAFT").length,
    submitted: allPosts.filter((p) => p.status === "SUBMITTED").length,
    approved: allPosts.filter((p) => p.status === "APPROVED").length,
    scheduled: allPosts.filter((p) => p.status === "SCHEDULED").length,
    posted: allPosts.filter((p) => p.status === "POSTED").length,
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {client.name}</h1>
          <p className="text-muted-foreground">Review and approve your social media content</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statusCounts.draft}</div>
            <div className="text-sm text-muted-foreground">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.submitted}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{statusCounts.posted}</div>
            <div className="text-sm text-muted-foreground">Posted</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Your latest social media content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPosts.slice(0, 10).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge
                      variant={
                        post.status === "APPROVED"
                          ? "default"
                          : post.status === "SUBMITTED"
                            ? "secondary"
                            : post.status === "SCHEDULED"
                              ? "outline"
                              : post.status === "POSTED"
                                ? "destructive"
                                : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {post.projectName} • {post.type}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    {post.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(post.scheduledAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments.length} comments
                    </div>
                  </div>
                </div>
                <Link href={`/client-portal/posts/${post.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
