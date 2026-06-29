"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CalendarIcon, Filter, Plus } from "lucide-react"
import Link from "next/link"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  SCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
  POSTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const typeIcons = {
  PHOTO: "📷",
  REEL: "🎬",
  STORY: "📱",
  CAROUSEL: "🎠",
  CUSTOM: "✨",
}

interface CalendarViewProps {
  posts: any[]
  projects: any[]
  currentUser: {
    id: string
    role: string
  }
}

const getPlatformNames = (platforms: any) => {
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) return "No platforms"
  return platforms
    .map((p: any) => (typeof p === "string" ? p : p.platform))
    .filter(Boolean)
    .join(", ")
}

export function CalendarView({ posts, projects, currentUser }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [view, setView] = useState<"month" | "week">("month")

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const projectMatch = selectedProject === "all" || post.projectId === selectedProject
      const statusMatch = selectedStatus === "all" || post.status === selectedStatus
      return projectMatch && statusMatch
    })
  }, [posts, selectedProject, selectedStatus])

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {}
    filteredPosts.forEach((post) => {
      if (post.scheduledAt) {
        const dateKey = format(new Date(post.scheduledAt), "yyyy-MM-dd")
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(post)
      }
    })
    return grouped
  }, [filteredPosts])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const getPostsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return postsByDate[dateKey] || []
  }

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["ADMIN", "MANAGER", "DESIGNER"].includes(currentUser.role) && (
            <Link href="/posts/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            {format(currentDate, "MMMM yyyy")} Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-px border border-gray-200 rounded-lg overflow-hidden">
            {calendarDays.map((day) => {
              const dayPosts = getPostsForDay(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 bg-white border-r border-b border-gray-100 ${
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? "text-blue-600" : ""}`}>{format(day, "d")}</div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <div
                          className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${
                            statusColors[post.status as keyof typeof statusColors]
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{typeIcons[post.type]}</span>
                            <span className="truncate flex-1">{post.title}</span>
                          </div>
                          <div className="text-xs opacity-75 mt-1">{format(new Date(post.scheduledAt), "HH:mm")}</div>
                        </div>
                      </Link>
                    ))}

                    {dayPosts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPosts
              .filter((post) => new Date(post.scheduledAt) >= new Date())
              .slice(0, 10)
              .map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg">{typeIcons[post.type]}</div>
                    <div>
                      <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {post.project?.client?.name || "Unknown Client"} • {getPlatformNames(post.platforms)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(post.scheduledAt), "MMM dd, yyyy")}</p>
                      <p className="text-xs text-gray-500">{format(new Date(post.scheduledAt), "HH:mm")}</p>
                    </div>
                    <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                      {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}

            {filteredPosts.filter((post) => new Date(post.scheduledAt) >= new Date()).length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No upcoming scheduled posts.{" "}
                <Link href="/posts/new" className="text-blue-600 hover:underline">
                  Create a new post
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
