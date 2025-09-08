import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProjectForm from "@/components/forms/project-form"

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/dashboard")
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600">Add a new project for your client</p>
      </div>

      <div className="max-w-2xl">
        <ProjectForm clients={clients} managers={managers} />
      </div>
    </div>
  )
}
