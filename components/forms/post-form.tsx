"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X, AlertTriangle, CheckCircle, Calendar, Users } from "lucide-react"
import Link from "next/link"
import type { ValidationResult } from "@/lib/validation"

interface Project {
  id: string
  name: string
  client: {
    id: string
    name: string
    email?: string
  }
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

interface Utility {
  id: string
  name: string
  type: string
  values: string[]
}

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
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] })
  const [assetValidation, setAssetValidation] = useState<{ [key: number]: ValidationResult }>({})
  const [postTypes, setPostTypes] = useState<
    Array<{ value: string; label: string; icon: string; description: string }>
  >([])
  const [platforms, setPlatforms] = useState<Array<{ value: string; label: string; color: string }>>([])
  const [utilitiesLoading, setUtilitiesLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUtilities = async () => {
      try {
        const response = await fetch("/api/utilities")
        if (response.ok) {
          const utilities: Utility[] = await response.json()

          // Process post types
          const postTypeUtility = utilities.find((u) => u.type === "POST_TYPE")
          if (postTypeUtility) {
            const dynamicPostTypes = postTypeUtility.values.map((value, index) => ({
              value: value.toUpperCase().replace(/\s+/g, "_"),
              label: value,
              icon: getPostTypeIcon(value),
              description: getPostTypeDescription(value),
            }))
            setPostTypes(dynamicPostTypes)
          } else {
            // Fallback to default post types
            setPostTypes([
              { value: "PHOTO", label: "Photo Post", icon: "📷", description: "Single image post" },
              { value: "REEL", label: "Reel/Video", icon: "🎬", description: "Short video content" },
              { value: "STORY", label: "Story", icon: "📱", description: "24-hour story content" },
              { value: "CAROUSEL", label: "Carousel", icon: "🎠", description: "Multiple images/videos" },
              { value: "VIDEO", label: "Video", icon: "🎥", description: "Long-form video" },
              { value: "CUSTOM", label: "Custom", icon: "✨", description: "Custom content type" },
            ])
          }

          // Process platforms
          const platformUtility = utilities.find((u) => u.type === "PLATFORM")
          if (platformUtility) {
            const dynamicPlatforms = platformUtility.values.map((value) => ({
              value: value.toUpperCase().replace(/\s+/g, "_"),
              label: value,
              color: getPlatformColor(value),
            }))
            setPlatforms(dynamicPlatforms)
          } else {
            // Fallback to default platforms
            setPlatforms([
              { value: "INSTAGRAM", label: "Instagram", color: "bg-pink-100 text-pink-800" },
              { value: "FACEBOOK", label: "Facebook", color: "bg-blue-100 text-blue-800" },
              { value: "LINKEDIN", label: "LinkedIn", color: "bg-blue-100 text-blue-900" },
              { value: "YOUTUBE", label: "YouTube", color: "bg-red-100 text-red-800" },
            ])
          }
        }
      } catch (error) {
        console.error("Failed to fetch utilities:", error)
        // Use fallback values on error
        setPostTypes([
          { value: "PHOTO", label: "Photo Post", icon: "📷", description: "Single image post" },
          { value: "REEL", label: "Reel/Video", icon: "🎬", description: "Short video content" },
          { value: "STORY", label: "Story", icon: "📱", description: "24-hour story content" },
          { value: "CAROUSEL", label: "Carousel", icon: "🎠", description: "Multiple images/videos" },
          { value: "VIDEO", label: "Video", icon: "🎥", description: "Long-form video" },
          { value: "CUSTOM", label: "Custom", icon: "✨", description: "Custom content type" },
        ])
        setPlatforms([
          { value: "INSTAGRAM", label: "Instagram", color: "bg-pink-100 text-pink-800" },
          { value: "FACEBOOK", label: "Facebook", color: "bg-blue-100 text-blue-800" },
          { value: "LINKEDIN", label: "LinkedIn", color: "bg-blue-100 text-blue-900" },
          { value: "YOUTUBE", label: "YouTube", color: "bg-red-100 text-red-800" },
        ])
      } finally {
        setUtilitiesLoading(false)
      }
    }

    fetchUtilities()
  }, [])

  const getPostTypeIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      "Photo Post": "📷",
      Story: "📱",
      Reel: "🎬",
      Carousel: "🎠",
      Video: "🎥",
      "Live Stream": "📺",
      IGTV: "📹",
      Other: "✨",
    }
    return iconMap[type] || "📄"
  }

  const getPostTypeDescription = (type: string): string => {
    const descMap: { [key: string]: string } = {
      "Photo Post": "Single image post",
      Story: "24-hour story content",
      Reel: "Short video content",
      Carousel: "Multiple images/videos",
      Video: "Long-form video",
      "Live Stream": "Real-time streaming",
      IGTV: "Long-form vertical video",
      Other: "Custom content type",
    }
    return descMap[type] || "Custom content"
  }

  const getPlatformColor = (platform: string): string => {
    const colorMap: { [key: string]: string } = {
      Instagram: "bg-pink-100 text-pink-800",
      Facebook: "bg-blue-100 text-blue-800",
      LinkedIn: "bg-blue-100 text-blue-900",
      YouTube: "bg-red-100 text-red-800",
      Twitter: "bg-sky-100 text-sky-800",
      TikTok: "bg-gray-100 text-gray-800",
    }
    return colorMap[platform] || "bg-gray-100 text-gray-800"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validation.isValid || Object.keys(assetValidation).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "platforms") {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value as string)
        }
      })

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
        router.push("/dashboard/posts")
      } else {
        const errorData = await response.json()
        alert(`Error saving post: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Network error. Please try again.")
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
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter((file) => {
        const maxSize = 100 * 1024 * 1024 // 100MB
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 100MB.`)
          return false
        }
        return true
      })
      setAssets([...assets, ...validFiles])
    }
  }

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index))
  }

  const getCharacterCount = (text: string) => {
    const limits = {
      INSTAGRAM: 2200,
      FACEBOOK: 63206,
      LINKEDIN: 3000,
      YOUTUBE: 5000,
    }
    const maxLimit =
      formData.platforms.length > 0
        ? Math.min(...formData.platforms.map((p) => limits[p as keyof typeof limits] || 2200))
        : 2200

    return {
      current: text.length,
      max: maxLimit,
    }
  }

  const getHashtagCount = (text: string) => {
    return (text.match(/#\w+/g) || []).length
  }

  const selectedProject = projects.find((p) => p.id === formData.projectId)

  if (utilitiesLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle>{post ? "Edit Post" : "New Post"}</CardTitle>
            {selectedProject && (
              <p className="text-sm text-gray-600 mt-1">
                <Users className="inline h-4 w-4 mr-1" />
                {selectedProject.name} - {selectedProject.client.name}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No active projects available. You need to create a project before you can create posts.
              <Link href="/dashboard/projects/new" className="ml-2 text-blue-600 hover:underline">
                Create Project
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {validation.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title for your post"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                disabled={projects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={projects.length === 0 ? "No projects available" : "Select project"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-gray-500">{project.client.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Platform(s) * <span className="text-sm text-gray-500">(Multi-select)</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.platforms.includes(platform.value)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePlatformChange(platform.value, !formData.platforms.includes(platform.value))}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={formData.platforms.includes(platform.value)} readOnly />
                    <Label className="cursor-pointer">
                      <Badge className={platform.color} variant="secondary">
                        {platform.label}
                      </Badge>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="caption">Caption</Label>
              <div className="flex items-center space-x-2">
                {formData.caption && (
                  <>
                    <Badge
                      variant={
                        getCharacterCount(formData.caption).current > getCharacterCount(formData.caption).max
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {getCharacterCount(formData.caption).current}/{getCharacterCount(formData.caption).max}
                    </Badge>
                    <Badge variant="outline">#{getHashtagCount(formData.caption)} hashtags</Badge>
                  </>
                )}
              </div>
            </div>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Write your post caption... Use #hashtags to increase reach"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">
              <Calendar className="inline h-4 w-4 mr-1" />
              Schedule (Optional)
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500">
              Leave empty to save as draft. Scheduled posts will be published automatically.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assets">Assets</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="assets" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Upload images or videos</span>
                    <span className="text-xs text-muted-foreground">
                      Supported: JPG, PNG, MP4, MOV (Max 100MB each)
                    </span>
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

            {assets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {assets.map((asset, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      {asset.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(asset) || "/placeholder.svg"}
                          alt={asset.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-sm text-gray-600 text-center p-2">{asset.name}</span>
                      )}
                    </div>
                    {assetValidation[index] && (
                      <div className="absolute top-1 left-1">
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeAsset(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <Badge variant="secondary" className="text-xs w-full justify-center">
                        {(asset.size / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {Object.entries(assetValidation).map(([index, validation]) => (
              <Alert key={index} variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Asset {Number.parseInt(index) + 1}:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {validation.errors.map((error, errorIndex) => (
                      <li key={errorIndex}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/dashboard/posts">
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.title ||
                !formData.projectId ||
                formData.platforms.length === 0 ||
                !validation.isValid ||
                Object.keys(assetValidation).length > 0 ||
                projects.length === 0
              }
            >
              {!validation.isValid || Object.keys(assetValidation).length > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Fix Validation Issues
                </>
              ) : isLoading ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {post ? "Update Post" : "Create Post"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
