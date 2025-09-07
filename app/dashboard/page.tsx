import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Clock, TrendingUp, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  console.log("Session:", session)
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

  const [
    totalPosts,
    pendingPosts,
    approvedPosts,
    rejectedPosts,
    recentPosts,
    scheduledPosts,
    postedThisWeek,
    activeProjects,
  ] = await Promise.all([
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
    prisma.post.count({ where: { ...whereClause, status: "SCHEDULED" } }),
    prisma.post.count({
      where: {
        ...whereClause,
        status: "POSTED",
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
    session.user.role === "CLIENT"
      ? prisma.project.count({ where: { client: { email: session.user.email } } })
      : prisma.project.count(),
  ])

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts.toString(),
      description: "All posts",
      icon: FileText,
      trend: "+12% from last month",
    },
    {
      title: "Pending Review",
      value: pendingPosts.toString(),
      description: "Awaiting approval",
      icon: Clock,
      color: "text-yellow-600",
      trend: pendingPosts > 5 ? "High priority" : "Normal",
    },
    {
      title: "Approved",
      value: approvedPosts.toString(),
      description: "Ready to publish",
      icon: CheckCircle,
      color: "text-green-600",
      trend: `${scheduledPosts} scheduled`,
    },
    {
      title: "This Week",
      value: postedThisWeek.toString(),
      description: "Posts published",
      icon: TrendingUp,
      color: "text-blue-600",
      trend: "+8% vs last week",
    },
  ]

  const additionalStats = [
    {
      title: "Active Projects",
      value: activeProjects.toString(),
      description: "Current projects",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Scheduled",
      value: scheduledPosts.toString(),
      description: "Upcoming posts",
      icon: Calendar,
      color: "text-indigo-600",
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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.trend && <p className="text-xs text-green-600 mt-1">{stat.trend}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {additionalStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/posts/new" className="block h-full">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <div className="text-2xl mb-2">➕</div>
              <p className="text-sm font-medium text-center">Create Post</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/calendar" className="block h-full">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm font-medium text-center">View Calendar</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest updates from your posts</CardDescription>
            </div>
            <Link href="/posts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {post.project.client.name} • by {post.createdBy.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {post.type} • {post?.platforms?.join(", ")}
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
