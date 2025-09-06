"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (title: string) => {
    if (title.includes("approved")) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (title.includes("rejected")) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (title.includes("comment")) return <MessageSquare className="h-4 w-4 text-blue-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""}`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  {getNotificationIcon(notification.title)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>{notification.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 10 && (
          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
