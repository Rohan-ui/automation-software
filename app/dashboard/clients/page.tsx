"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Building2, Mail, Phone, Search, Eye, Edit, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ClientsPageProps {
  clients?: any[] // Made clients optional to handle undefined case
  userRole?: string // Made userRole optional
}

export default function ClientsPage({ clients = [], userRole = "CLIENT" }: ClientsPageProps) {
  // Added default values
  const [searchTerm, setSearchTerm] = useState("")

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Active Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client?.id || Math.random()}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="font-medium">{client?.name || "Unknown Client"}</div>
                  </div>
                </TableCell>
                <TableCell>{client?.company || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{client?.email || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {client?.phone ? (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{client?.projects?.length || 0} Projects</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {client?.createdAt ? format(new Date(client.createdAt), "MMM dd, yyyy") : "N/A"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link href={`/clients/${client?.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/clients/${client?.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No clients match your search" : "No clients yet"}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Get started by adding your first client to the system."}
            </p>
            <Link href="/clients/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
