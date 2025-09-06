"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Instagram, Facebook, Settings, CheckCircle, AlertCircle } from "lucide-react"

interface PlatformIntegrationProps {
  postId: string
  platforms: string[]
  status: string
}

export function PlatformIntegration({ postId, platforms, status }: PlatformIntegrationProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [autoPost, setAutoPost] = useState(false)

  const handlePublish = async (platform: string) => {
    setIsPublishing(true)
    try {
      // Simulate API call to social media platform
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would:
      // 1. Call Instagram/Facebook Graph API
      // 2. Upload media assets
      // 3. Create the post with caption
      // 4. Update post status to POSTED
      // 5. Store platform-specific post IDs

      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      })

      if (response.ok) {
        alert(`Successfully published to ${platform}!`)
      } else {
        alert(`Failed to publish to ${platform}`)
      }
    } catch (error) {
      console.error("Error publishing:", error)
      alert("Error publishing post")
    } finally {
      setIsPublishing(false)
    }
  }

  const platformConfig = {
    INSTAGRAM: {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      connected: true,
    },
    FACEBOOK: {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      connected: true,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Platform Integration
        </CardTitle>
        <CardDescription>Publish your content to social media platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-publish setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-post">Auto-publish when scheduled</Label>
            <p className="text-sm text-gray-500">Automatically publish posts at scheduled time</p>
          </div>
          <Switch id="auto-post" checked={autoPost} onCheckedChange={setAutoPost} />
        </div>

        {/* Platform list */}
        <div className="space-y-3">
          {platforms.map((platform) => {
            const config = platformConfig[platform as keyof typeof platformConfig]
            if (!config) return null

            return (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${config.color}`}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <div className="flex items-center space-x-2">
                      {config.connected ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600">Not connected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {status === "POSTED" ? (
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  ) : status === "SCHEDULED" && config.connected ? (
                    <Badge className="bg-purple-100 text-purple-800">Scheduled</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(platform)}
                      disabled={!config.connected || isPublishing || status !== "APPROVED"}
                    >
                      {isPublishing ? "Publishing..." : "Publish Now"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {status !== "APPROVED" && status !== "SCHEDULED" && status !== "POSTED" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Post must be approved before it can be published to social media platforms.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
