import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProjectForm from "@/components/forms/project-form"

interface EditProjectPageProps {
  params: { id: string }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      manager: true,
    },
  })

  if (!project) {
    notFound()
  }

  // Fetch clients and managers for the form
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  })

  const managers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-600">Update project details</p>
      </div>

      <div className="max-w-2xl">
        <ProjectForm clients={clients} managers={managers} project={project} isEditing={true} />
      </div>
    </div>
  )
}
