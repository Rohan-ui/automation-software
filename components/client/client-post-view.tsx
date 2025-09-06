"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, Send, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ClientPostViewProps {
  post: any
  currentUser: any
}

export function ClientPostView({ post, currentUser }: ClientPostViewProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleAddComment = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        setComment("")
        toast.success("Comment added successfully")
        router.refresh()
      } else {
        toast.error("Failed to add comment")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproval = async (approved: boolean) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approved ? "APPROVED" : "REJECTED",
          comment: approved ? "Approved by client" : "Rejected by client",
        }),
      })

      if (response.ok) {
        toast.success(approved ? "Post approved successfully" : "Post rejected")
        router.refresh()
      } else {
        toast.error("Failed to update post status")
      }
    } catch (error) {
      toast.error("Failed to update post status")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client-portal">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="text-muted-foreground">{post.project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Post Details</CardTitle>
                <Badge
                  variant={
                    post.status === "APPROVED"
                      ? "default"
                      : post.status === "SUBMITTED"
                        ? "secondary"
                        : post.status === "SCHEDULED"
                          ? "outline"
                          : post.status === "POSTED"
                            ? "destructive"
                            : "secondary"
                  }
                >
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Caption</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{post.caption}</p>
              </div>

              {post.hashtags && (
                <div>
                  <h3 className="font-medium mb-2">Hashtags</h3>
                  <p className="text-sm text-blue-600">{post.hashtags}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {post.type}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(post.createdAt).toLocaleDateString()}
                </div>
                {post.scheduledAt && (
                  <div>
                    <span className="font-medium">Scheduled:</span> {new Date(post.scheduledAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {post.platforms.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Platforms</h3>
                  <div className="flex gap-2">
                    {post.platforms.map((platform: any) => (
                      <Badge key={platform.id} variant="outline">
                        {platform.platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assets */}
          {post.assets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {post.assets.map((asset: any) => (
                    <div key={asset.id} className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">{asset.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {asset.fileType} • {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Actions */}
          {post.status === "SUBMITTED" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Required</CardTitle>
                <CardDescription>Please review this post and provide your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button onClick={() => handleApproval(true)} disabled={isSubmitting} className="flex-1">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comments Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({post.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmitting}
                  size="sm"
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.image || "/placeholder.svg"} />
                        <AvatarFallback>{comment.user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {post.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
