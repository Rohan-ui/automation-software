"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { QuickScheduleModal } from "./quick-schedule-modal"
import { PlatformIntegration } from "../platform/platform-integration"
import { ArrowLeft, CheckCircle, XCircle, Send, Calendar, User, Building2, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

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
  CUSTOM: "✨",
}

interface PostDetailProps {
  post: any
  currentUser: {
    id: string
    role: string
    name: string
  }
  isPublicView?: boolean // Added optional prop for public view styling
}

export function PostDetail({ post, currentUser, isPublicView = false }: PostDetailProps) {
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const canApprove = ["ADMIN", "MANAGER"].includes(currentUser.role)
  const canSubmit = post.createdById === currentUser.id && post.status === "DRAFT"
  const canEdit = post.createdById === currentUser.id && ["DRAFT", "REJECTED"].includes(post.status)
  const canSchedule = ["ADMIN", "MANAGER"].includes(currentUser.role) || post.createdById === currentUser.id

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Error updating post status")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error updating post status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        setComment("")
        router.refresh()
      } else {
        alert("Error adding comment")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error adding comment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={isPublicView ? "/posts" : "/dashboard/posts"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <p className="text-gray-600">
              {post.project.client.name} • {post.project.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={statusColors[post.status]}>
            {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
          </Badge>
          {canSchedule && post.status === "APPROVED" && (
            <QuickScheduleModal
              postId={post.id}
              currentSchedule={post.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm") : undefined}
              onScheduleUpdate={handleScheduleUpdate}
            />
          )}
          {canEdit && (
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button variant="outline">Edit Post</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{typeIcons[post.type]}</div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{post.type} Post</span>
                  </CardTitle>
                  <CardDescription>
                    Platforms: {post.platforms?.map((p: any) => p.platform).join(", ") || "Not specified"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.caption && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Caption</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
                  </div>
                </div>
              )}

              {post.scheduledAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Scheduled for {format(new Date(post.scheduledAt), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              )}

              {post.assets.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assets ({post.assets.length})</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {post.assets.map((asset: any) => (
                      <div
                        key={asset.id}
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border"
                      >
                        {asset.url ? (
                          <img
                            src={asset.url || "/placeholder.svg"}
                            alt={asset.filename}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xs text-gray-600 text-center p-2">{asset.filename}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Integration */}
          {["APPROVED", "SCHEDULED", "POSTED"].includes(post.status) && (
            <PlatformIntegration
              postId={post.id}
              platforms={post.platforms?.map((p: any) => p.platform) || []}
              status={post.status}
            />
          )}

          {/* Action Buttons */}
          {(canSubmit || canApprove) && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  {canSubmit && (
                    <Button onClick={() => handleStatusChange("SUBMITTED")} disabled={isLoading}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                  )}

                  {canApprove && post.status === "SUBMITTED" && (
                    <>
                      <Button
                        onClick={() => handleStatusChange("APPROVED")}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button onClick={() => handleStatusChange("REJECTED")} disabled={isLoading} variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-gray-600">{post.createdBy.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm text-gray-600">{post.project.client.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">{format(new Date(post.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Comments ({post.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button type="submit" size="sm" disabled={isLoading || !comment.trim()}>
                  <Send className="mr-2 h-3 w-3" />
                  Add Comment
                </Button>
              </form>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{comment.user.name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(comment.createdAt), "MMM dd, HH:mm")}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {post.comments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No comments yet. Be the first to add feedback!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
