"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  client: { name: string }
}

interface PostFormProps {
  projects: Project[]
  post?: {
    id: string
    title: string
    caption?: string
    type: string
    platforms: string[]
    projectId: string
    scheduledAt?: string
  }
}

const postTypes = [
  { value: "PHOTO", label: "Photo Post", icon: "📷" },
  { value: "REEL", label: "Reel/Video", icon: "🎬" },
  { value: "STORY", label: "Story", icon: "📱" },
  { value: "CAROUSEL", label: "Carousel", icon: "🎠" },
  { value: "CUSTOM", label: "Custom", icon: "✨" },
]

const platforms = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
]

export function PostForm({ projects, post }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    caption: post?.caption || "",
    type: post?.type || "",
    platforms: post?.platforms || [],
    projectId: post?.projectId || "",
    scheduledAt: post?.scheduledAt || "",
  })
  const [assets, setAssets] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "platforms") {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value as string)
        }
      })

      // Add files
      assets.forEach((file, index) => {
        submitData.append(`asset-${index}`, file)
      })

      const url = post ? `/api/posts/${post.id}` : "/api/posts"
      const method = post ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      if (response.ok) {
        router.push("/posts")
      } else {
        alert("Error saving post")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error saving post")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platform],
      })
    } else {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter((p) => p !== platform),
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAssets([...assets, ...Array.from(e.target.files)])
    }
  }

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>{post ? "Edit Post" : "New Post"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Post Type */}
          <div className="space-y-2">
            <Label>Post Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {postTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label>Platforms *</Label>
            <div className="flex space-x-4">
              {platforms.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.value}
                    checked={formData.platforms.includes(platform.value)}
                    onCheckedChange={(checked) => handlePlatformChange(platform.value, checked as boolean)}
                  />
                  <Label htmlFor={platform.value}>{platform.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Write your post caption..."
              rows={4}
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            />
          </div>

          {/* Asset Upload */}
          <div className="space-y-2">
            <Label>Assets</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="assets" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Upload images or videos</span>
                    <Input
                      id="assets"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>

            {/* Asset Preview */}
            {assets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {assets.map((asset, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-600">{asset.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeAsset(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/posts">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.projectId || formData.platforms.length === 0}
            >
              {isLoading ? "Saving..." : post ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
