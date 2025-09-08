"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from "date-fns"
import Link from "next/link"

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

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/posts?assignedToMe=true")
      const data = await response.json()
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const thisWeekStart = startOfWeek(new Date())
  const thisWeekEnd = endOfWeek(new Date())
  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1))
  const nextWeekEnd = endOfWeek(addWeeks(new Date(), 1))

  const thisWeekTasks = tasks.filter(
    (task) =>
      task.scheduledAt &&
      isWithinInterval(new Date(task.scheduledAt), {
        start: thisWeekStart,
        end: thisWeekEnd,
      }),
  )

  const nextWeekTasks = tasks.filter(
    (task) =>
      task.scheduledAt &&
      isWithinInterval(new Date(task.scheduledAt), {
        start: nextWeekStart,
        end: nextWeekEnd,
      }),
  )

  const pendingTasks = tasks.filter((task) => task.status === "DRAFT")
  const submittedTasks = tasks.filter((task) => task.status === "SUBMITTED")

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">Your assigned design tasks and deadlines</p>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{thisWeekTasks.length}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{nextWeekTasks.length}</p>
                <p className="text-sm text-gray-600">Next Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{submittedTasks.length}</p>
                <p className="text-sm text-gray-600">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="thisweek" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thisweek">This Week ({thisWeekTasks.length})</TabsTrigger>
          <TabsTrigger value="nextweek">Next Week ({nextWeekTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="thisweek">
          <TaskGrid tasks={thisWeekTasks} title="This Week Tasks" />
        </TabsContent>

        <TabsContent value="nextweek">
          <TaskGrid tasks={nextWeekTasks} title="Next Week Tasks" />
        </TabsContent>

        <TabsContent value="pending">
          <TaskGrid tasks={pendingTasks} title="Pending Tasks" />
        </TabsContent>

        <TabsContent value="all">
          <TaskGrid tasks={tasks} title="All Tasks" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskGrid({ tasks, title }: { tasks: any[]; title: string }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No tasks found for this period.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  const handleUploadDesign = async () => {
    // This would open a file upload dialog
    console.log("Upload design for task:", task.id)
  }

  const handleSubmitTask = async () => {
    try {
      await fetch(`/api/posts/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUBMITTED" }),
      })
      window.location.reload()
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{typeIcons[task.type]}</span>
            <div>
              <CardTitle className="text-sm">{task.title}</CardTitle>
              <p className="text-xs text-gray-500">{task.project?.client?.name}</p>
            </div>
          </div>
          <Badge className={statusColors[task.status]}>
            {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">
          <p>
            <strong>Platform:</strong> {task.platforms?.join(", ") || "Not specified"}
          </p>
          {task.scheduledAt && (
            <p>
              <strong>Due:</strong> {format(new Date(task.scheduledAt), "MMM dd, yyyy")}
            </p>
          )}
        </div>

        {task.caption && <p className="text-sm text-gray-700 line-clamp-2">{task.caption}</p>}

        <div className="flex space-x-2">
          {task.status === "DRAFT" && (
            <>
              <Button size="sm" variant="outline" onClick={handleUploadDesign}>
                <Upload className="mr-1 h-3 w-3" />
                Upload
              </Button>
              <Button size="sm" onClick={handleSubmitTask}>
                Submit
              </Button>
            </>
          )}

          <Link href={`/dashboard/posts/${task.id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>

        {task.assets && task.assets.length > 0 && (
          <div className="text-xs text-green-600">✓ {task.assets.length} file(s) uploaded</div>
        )}
      </CardContent>
    </Card>
  )
}
