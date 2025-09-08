"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Utility {
  id: string
  name: string
  type: "PLATFORM" | "POST_TYPE"
  values: string[]
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [utilities, setUtilities] = useState<Utility[]>([])
  const [loading, setLoading] = useState(true)
  const [newUtilityName, setNewUtilityName] = useState("")
  const [newUtilityType, setNewUtilityType] = useState<"PLATFORM" | "POST_TYPE">("PLATFORM")
  const [editingUtility, setEditingUtility] = useState<string | null>(null)
  const [newValue, setNewValue] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchUtilities()
  }, [])

  const fetchUtilities = async () => {
    try {
      const response = await fetch("/api/utilities")
      if (response.ok) {
        const data = await response.json()
        setUtilities(data)
      }
    } catch (error) {
      console.error("Failed to fetch utilities:", error)
      toast({
        title: "Error",
        description: "Failed to load utilities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createUtility = async () => {
    if (!newUtilityName.trim()) return

    try {
      const response = await fetch("/api/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUtilityName,
          type: newUtilityType,
          values: [],
        }),
      })

      if (response.ok) {
        const newUtility = await response.json()
        setUtilities([...utilities, newUtility])
        setNewUtilityName("")
        toast({
          title: "Success",
          description: "Utility created successfully",
        })
      }
    } catch (error) {
      console.error("Failed to create utility:", error)
      toast({
        title: "Error",
        description: "Failed to create utility",
        variant: "destructive",
      })
    }
  }

  const addValue = async (utilityId: string) => {
    if (!newValue.trim()) return

    try {
      const utility = utilities.find((u) => u.id === utilityId)
      if (!utility) return

      const updatedValues = [...utility.values, newValue]

      const response = await fetch(`/api/utilities/${utilityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: updatedValues }),
      })

      if (response.ok) {
        const updatedUtility = await response.json()
        setUtilities(utilities.map((u) => (u.id === utilityId ? updatedUtility : u)))
        setNewValue("")
        toast({
          title: "Success",
          description: "Value added successfully",
        })
      }
    } catch (error) {
      console.error("Failed to add value:", error)
      toast({
        title: "Error",
        description: "Failed to add value",
        variant: "destructive",
      })
    }
  }

  const removeValue = async (utilityId: string, valueToRemove: string) => {
    try {
      const utility = utilities.find((u) => u.id === utilityId)
      if (!utility) return

      const updatedValues = utility.values.filter((v) => v !== valueToRemove)

      const response = await fetch(`/api/utilities/${utilityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: updatedValues }),
      })

      if (response.ok) {
        const updatedUtility = await response.json()
        setUtilities(utilities.map((u) => (u.id === utilityId ? updatedUtility : u)))
        toast({
          title: "Success",
          description: "Value removed successfully",
        })
      }
    } catch (error) {
      console.error("Failed to remove value:", error)
      toast({
        title: "Error",
        description: "Failed to remove value",
        variant: "destructive",
      })
    }
  }

  const deleteUtility = async (utilityId: string) => {
    try {
      const response = await fetch(`/api/utilities/${utilityId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUtilities(utilities.filter((u) => u.id !== utilityId))
        toast({
          title: "Success",
          description: "Utility deleted successfully",
        })
      }
    } catch (error) {
      console.error("Failed to delete utility:", error)
      toast({
        title: "Error",
        description: "Failed to delete utility",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system utilities and configurations</p>
      </div>

      {/* Create New Utility */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Utility</CardTitle>
          <CardDescription>Add a new utility to manage dynamic values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="utility-name">Utility Name</Label>
              <Input
                id="utility-name"
                value={newUtilityName}
                onChange={(e) => setNewUtilityName(e.target.value)}
                placeholder="e.g., Social Platforms"
              />
            </div>
            <div>
              <Label htmlFor="utility-type">Type</Label>
              <select
                id="utility-type"
                value={newUtilityType}
                onChange={(e) => setNewUtilityType(e.target.value as "PLATFORM" | "POST_TYPE")}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="PLATFORM">Platform</option>
                <option value="POST_TYPE">Post Type</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={createUtility} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Utility
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Utilities */}
      <div className="grid gap-6">
        {utilities.map((utility) => (
          <Card key={utility.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {utility.name}
                  <Badge variant={utility.type === "PLATFORM" ? "default" : "secondary"}>{utility.type}</Badge>
                </CardTitle>
                <CardDescription>
                  {utility.values.length} values • Created {new Date(utility.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteUtility(utility.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Values Display */}
              <div className="flex flex-wrap gap-2">
                {utility.values.map((value, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {value}
                    <button onClick={() => removeValue(utility.id, value)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {utility.values.length === 0 && <p className="text-muted-foreground text-sm">No values added yet</p>}
              </div>

              {/* Add New Value */}
              <div className="flex gap-2">
                <Input
                  value={editingUtility === utility.id ? newValue : ""}
                  onChange={(e) => {
                    setNewValue(e.target.value)
                    setEditingUtility(utility.id)
                  }}
                  placeholder={`Add new ${utility.type.toLowerCase()} value...`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addValue(utility.id)
                      setEditingUtility(null)
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    addValue(utility.id)
                    setEditingUtility(null)
                  }}
                  disabled={!newValue.trim() || editingUtility !== utility.id}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {utilities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No utilities created yet. Create your first utility above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
