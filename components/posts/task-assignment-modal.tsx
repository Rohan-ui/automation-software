"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Loader2 } from "lucide-react"

interface TaskAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  post: any
  onAssigned: () => void
}

export function TaskAssignmentModal({ isOpen, onClose, post, onAssigned }: TaskAssignmentModalProps) {
  const [designers, setDesigners] = useState([])
  const [selectedDesigner, setSelectedDesigner] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchDesigners()
    }
  }, [isOpen])

  const fetchDesigners = async () => {
    try {
      const response = await fetch("/api/users?role=DESIGNER")
      const data = await response.json()
      setDesigners(data || [])
    } catch (error) {
      console.error("Error fetching designers:", error)
    }
  }

  const handleAssign = async () => {
    if (!selectedDesigner) return

    setLoading(true)
    try {
      await fetch(`/api/posts/${post.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: selectedDesigner }),
      })

      onAssigned()
      onClose()
    } catch (error) {
      console.error("Error assigning task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Assign Task</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{post.title}</h4>
            <p className="text-sm text-gray-600">{post.project?.client?.name}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">{post.type}</Badge>
              <Badge variant="outline">
                {Array.isArray(post?.platforms)
                  ? post.platforms.map((p: any) => (typeof p === "string" ? p : p.platform)).filter(Boolean).join(", ")
                  : post?.platforms || "N/A"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Designer:</label>
            <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
              <SelectTrigger>
                <SelectValue placeholder="Select a designer" />
              </SelectTrigger>
              <SelectContent>
                {designers.map((designer: any) => (
                  <SelectItem key={designer.id} value={designer.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{designer.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{designer.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedDesigner || loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Task"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
