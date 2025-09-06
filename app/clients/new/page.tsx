import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ClientForm } from "@/components/forms/client-form"

export default async function NewClientPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
        <p className="text-gray-600">Create a new client profile</p>
      </div>

      <ClientForm />
    </div>
  )
}
