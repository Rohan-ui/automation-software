"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  Users,
  Upload,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Post {
  id: string
  title: string
  caption?: string
  type: string
  status: string
  scheduledAt?: string
  postedAt?: string
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    client: {
      id: string
      name: string
    }
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  assets: Array<{
    id: string
    filename: string
    url: string
  }>
  platforms?: string[]
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SCHEDULED: "bg-purple-100 text-purple-800",
  POSTED: "bg-emerald-100 text-emerald-800",
}

const typeIcons = {
  PHOTO: "📷",
  REEL: "🎬",
  STORY: "📱",
  CAROUSEL: "🎠",
  VIDEO: "🎥",
  CUSTOM: "✨",
}

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"table" | "date" | "project">("table")
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})
  const [viewingAssets, setViewingAssets] = useState<string | null>(null)
  const [commentingPost, setCommentingPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [postComments, setPostComments] = useState<{ [key: string]: any[] }>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/posts")
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) {
      return []
    }

    return posts.filter((post) => {
      const matchesSearch =
        post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post?.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post?.project?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || post?.status === statusFilter.toUpperCase()
      const matchesType = typeFilter === "all" || post?.type === typeFilter.toUpperCase()
      const matchesProject = projectFilter === "all" || post?.project?.id === projectFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const postDate = new Date(post.createdAt)
        const today = new Date()
        const daysDiff = Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff === 0
            break
          case "week":
            matchesDate = daysDiff <= 7
            break
          case "month":
            matchesDate = daysDiff <= 30
            break
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesProject && matchesDate
    })
  }, [posts, searchTerm, statusFilter, typeFilter, projectFilter, dateFilter])

  const groupedPosts = useMemo(() => {
    if (viewMode === "date") {
      const groups: { [key: string]: Post[] } = {}
      filteredPosts.forEach((post) => {
        const date = format(new Date(post.createdAt), "yyyy-MM-dd")
        if (!groups[date]) groups[date] = []
        groups[date].push(post)
      })
      return groups
    } else if (viewMode === "project") {
      const groups: { [key: string]: Post[] } = {}
      filteredPosts.forEach((post) => {
        const projectName = post.project?.name || "Unknown Project"
        if (!groups[projectName]) groups[projectName] = []
        groups[projectName].push(post)
      })
      return groups
    }
    return { "All Posts": filteredPosts }
  }, [filteredPosts, viewMode])

  const uniqueProjects = useMemo(() => {
    const projects = posts.map((post) => post.project).filter(Boolean)
    return Array.from(new Set(projects.map((p) => p.id)))
      .map((id) => projects.find((p) => p.id === id))
      .filter(Boolean)
  }, [posts])

  const handleFileUpload = async (postId: string, files: FileList) => {
    if (!files.length) return

    setUploadingFiles((prev) => ({ ...prev, [postId]: true }))

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch(`/api/posts/${postId}/assets`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload files")
      }

      await fetchPosts() // Refresh posts to show new assets
    } catch (err) {
      console.error("Error uploading files:", err)
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const comments = await response.json()
        setPostComments((prev) => ({ ...prev, [postId]: comments }))
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        await fetchComments(postId)
      }
    } catch (err) {
      console.error("Error adding comment:", err)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (session?.user?.role !== "ADMIN") {
      alert("Only administrators can update post status")
      return
    }

    try {
      await Promise.all(
        selectedPosts.map((postId) =>
          fetch(`/api/posts/${postId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus.toUpperCase() }),
          }),
        ),
      )
      await fetchPosts()
      setSelectedPosts([])
    } catch (err) {
      console.error("Error updating posts:", err)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map((post) => post.id))
    } else {
      setSelectedPosts([])
    }
  }

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts((prev) => [...prev, postId])
    } else {
      setSelectedPosts((prev) => prev.filter((id) => id !== postId))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Posts</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={fetchPosts}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center max-w-[70vw] justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">Manage your social media content ({posts.length} total)</p>
        </div>
        {session?.user && ["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role) && (
          <Link href="/dashboard/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts, captions, or clients..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === "date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("date")}
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  By Date
                </Button>
                <Button
                  variant={viewMode === "project" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("project")}
                >
                  <Users className="mr-1 h-4 w-4" />
                  By Project
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPosts.length > 0 && session?.user?.role === "ADMIN" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{selectedPosts.length} posts selected</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("SUBMITTED")}>
                    Submit Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("APPROVED")}>
                    Approve Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("REJECTED")}>
                    Reject Selected
                  </Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPosts([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedPosts).map(([groupName, groupPosts]) => (
        <Card key={groupName}>
          {viewMode !== "table" && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {viewMode === "date" ? format(new Date(groupName), "MMMM dd, yyyy") : groupName}
              </h3>
              <p className="text-sm text-gray-600">{groupPosts.length} posts</p>
            </div>
          )}
          <Table  className=" overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={groupPosts.length > 0 && groupPosts.every((post) => selectedPosts.includes(post.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPosts((prev) => [...new Set([...prev, ...groupPosts.map((p) => p.id)])])
                      } else {
                        setSelectedPosts((prev) => prev.filter((id) => !groupPosts.map((p) => p.id).includes(id)))
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Post</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={(checked) => handleSelectPost(post.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{typeIcons[post.type as keyof typeof typeIcons] || "📄"}</div>
                      <div>
                        <div className="font-medium">{post.title || "Untitled"}</div>
                        {post.caption && <div className="text-sm text-gray-500 max-w-xs truncate">{post.caption}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{post.id}</code>
                  </TableCell>
                  <TableCell>{post.project?.client?.name || "Unknown Client"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.type || "UNKNOWN"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[post.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                    >
                      {post.status ? post.status.charAt(0) + post.status.slice(1).toLowerCase() : "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.platforms?.join(", ") || "N/A"}</TableCell>
                  <TableCell>{post.createdBy?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {post.scheduledAt ? (
                      <div className="text-sm">
                        <div>{format(new Date(post.scheduledAt), "MMM dd, yyyy")}</div>
                        <div className="text-gray-500">{format(new Date(post.scheduledAt), "HH:mm")}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setViewingAssets(post.id)}>
                          <Badge variant="secondary">{post.assets?.length || 0}</Badge>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Assets for {post.title}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {post.assets?.map((asset) => (
                            <div key={asset.id} className="border rounded-lg p-4">
                              {asset.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={asset.url || "/placeholder.svg"}
                                  alt={asset.filename}
                                  className="w-full h-32 object-cover rounded mb-2"
                                />
                              ) : (
                                <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <p className="text-sm font-medium truncate">{asset.filename}</p>
                              <div className="flex gap-1 mt-2">
                                <Button size="sm" variant="outline" asChild>
                                  <a href={asset.url} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-3 w-3" />
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={asset.url} download={asset.filename}>
                                    <Download className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {session?.user && ["ADMIN", "MANAGER", "DESIGNER"].includes(session.user.role) && (
                        <Link href={`/dashboard/posts/${post.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <label className="cursor-pointer flex items-center">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Files
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(post.id, e.target.files)}
                                disabled={uploadingFiles[post.id]}
                              />
                            </label>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCommentingPost(post.id)
                              fetchComments(post.id)
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comments
                          </DropdownMenuItem>
                          {session?.user?.role === "ADMIN" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleBulkStatusChange("APPROVED")}
                                className="text-green-600"
                              >
                                Approve Post
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBulkStatusChange("REJECTED")}
                                className="text-red-600"
                              >
                                Reject Post
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      <Dialog open={!!commentingPost} onOpenChange={() => setCommentingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {commentingPost &&
                postComments[commentingPost]?.map((comment) => (
                  <div key={comment.id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{comment.user?.name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => commentingPost && handleAddComment(commentingPost)} disabled={!newComment.trim()}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
