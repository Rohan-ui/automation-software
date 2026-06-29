"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Building2, Mail, Phone, Search, Eye, Edit, MoreHorizontal, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Project {
  id: string
  name: string
  isActive: boolean
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  avatar?: string | null
  createdAt: string
  projects?: Project[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/clients")
      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }
      const data = await response.json()
      setClients(data)
    } catch (err) {
      console.error("Error fetching clients:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) {
      return []
    }

    return clients.filter((client) => {
      const clientName = client?.name || ""
      const clientEmail = client?.email || ""
      const clientCompany = client?.company || ""
      const clientPhone = client?.phone || ""

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientPhone.includes(searchTerm)

      return matchesSearch
    })
  }, [clients, searchTerm])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full max-w-sm" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Clients</h3>
            <p className="text-gray-600 mb-4 text-sm max-w-md">{error}</p>
            <Button onClick={fetchClients} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your client relationships ({clients.length} total)</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients by name, email, company..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Active Projects</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {client.name || "Unknown Client"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700 dark:text-gray-300">{client.company || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{client.email || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {client.phone ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-xs px-2.5 py-0.5">
                    {client.projects?.length || 0} {client.projects?.length === 1 ? "Project" : "Projects"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-500">
                    {client.createdAt ? format(new Date(client.createdAt), "MMM dd, yyyy") : "—"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/projects?client=${client.id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" /> View Projects
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400/60 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {searchTerm ? "No clients match your search" : "No clients yet"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mb-5">
              {searchTerm
                ? "Try adjusting your search query or clear the search box."
                : "Get started by adding your first client to the system."}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/clients/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
