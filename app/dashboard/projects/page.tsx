import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Calendar, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const projects = await prisma.project.findMany({
    include: {
      client: true,
      manager: true,
      posts: {
        where: { status: { in: ["DRAFT", "SUBMITTED", "APPROVED"] } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your client projects</p>
        </div>
        {["ADMIN", "MANAGER"].includes(session.user.role) && (
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.client.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                Started {format(new Date(project.startDate), "MMM dd, yyyy")}
              </div>
              {project.manager && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  {project.manager.name}
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{project.posts.length} Posts</Badge>
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first project to start managing posts and content.
            </p>
            {["ADMIN", "MANAGER"].includes(session.user.role) && (
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
