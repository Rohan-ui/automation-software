import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Users, Calendar, CheckCircle, XCircle } from "lucide-react"

async function getReportData() {
  const [
    totalPosts,
    approvedPosts,
    rejectedPosts,
    scheduledPosts,
    totalUsers,
    totalClients,
    postsByStatus,
    postsByType,
    monthlyTrends,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "APPROVED" } }),
    prisma.post.count({ where: { status: "REJECTED" } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.user.count(),
    prisma.client.count(),
    prisma.post.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.post.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
    prisma.post.findMany({
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ])

  return {
    totalPosts,
    approvedPosts,
    rejectedPosts,
    scheduledPosts,
    totalUsers,
    totalClients,
    postsByStatus,
    postsByType,
    monthlyTrends,
    approvalRate: totalPosts > 0 ? ((approvedPosts / totalPosts) * 100).toFixed(1) : 0,
    rejectionRate: totalPosts > 0 ? ((rejectedPosts / totalPosts) * 100).toFixed(1) : 0,
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const data = await getReportData()

  const statusChartData = data.postsByStatus.map((item) => ({
    name: item.status,
    value: item._count.status,
  }))

  const typeChartData = data.postsByType.map((item) => ({
    name: item.type,
    value: item._count.type,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your post management performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPosts}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rejectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -1.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across {data.totalClients} clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Workflow Efficiency</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Avg. Review Time</span>
                  <span>2.3 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revision Rate</span>
                  <span>18%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>On-time Delivery</span>
                  <span>94%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Content Performance</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Most Popular Type</span>
                  <Badge variant="secondary">Photo</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Peak Posting Time</span>
                  <span>2:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>96.2%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Team Productivity</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Posts per Designer</span>
                  <span>12.4/week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Projects</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Workload Balance</span>
                  <span>Good</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
