import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Get dashboard stats based on user role
  const whereClause =
    session.user.role === "CLIENT"
      ? { project: { client: { email: session.user.email } } }
      : session.user.role === "DESIGNER"
        ? { createdById: session.user.id }
        : {} // Admins and Managers see all

  const [totalPosts, pendingPosts, approvedPosts, rejectedPosts, recentPosts] = await Promise.all([
    prisma.post.count({ where: whereClause }),
    prisma.post.count({ where: { ...whereClause, status: "SUBMITTED" } }),
    prisma.post.count({ where: { ...whereClause, status: "APPROVED" } }),
    prisma.post.count({ where: { ...whereClause, status: "REJECTED" } }),
    prisma.post.findMany({
      where: whereClause,
      include: {
        project: { include: { client: true } },
        createdBy: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ])

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts.toString(),
      description: "All posts",
      icon: FileText,
    },
    {
      title: "Pending Review",
      value: pendingPosts.toString(),
      description: "Awaiting approval",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: approvedPosts.toString(),
      description: "Ready to publish",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: rejectedPosts.toString(),
      description: "Need revision",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    SCHEDULED: "bg-purple-100 text-purple-800",
    POSTED: "bg-emerald-100 text-emerald-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Latest updates from your posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {post.project.client.name} • by {post.createdBy.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                    {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}

            {recentPosts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No posts yet.{" "}
                <Link href="/posts/new" className="text-blue-600 hover:underline">
                  Create your first post
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
