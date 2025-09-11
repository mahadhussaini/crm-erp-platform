"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  Play,
  Square,
  Coffee,
  LogOut,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

// Mock data - In real app, this would come from API
const mockAttendance = [
  {
    id: "1",
    user: {
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Sales Manager",
      image: ""
    },
    date: new Date(),
    clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    clockOut: new Date(),
    breakTime: 60, // 60 minutes
    notes: "",
    status: "present"
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Developer",
      image: ""
    },
    date: new Date(),
    clockIn: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    clockOut: null,
    breakTime: 45,
    notes: "",
    status: "active"
  },
  {
    id: "3",
    user: {
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Designer",
      image: ""
    },
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    clockIn: new Date(Date.now() - 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    clockOut: new Date(Date.now() - 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
    breakTime: 60,
    notes: "",
    status: "present"
  },
  {
    id: "4",
    user: {
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      role: "HR Manager",
      image: ""
    },
    date: new Date(),
    clockIn: null,
    clockOut: null,
    breakTime: 0,
    notes: "Sick leave",
    status: "absent"
  }
]

const getAttendanceStatus = (attendance: typeof mockAttendance[0]) => {
  if (attendance.status === "absent") return { status: "Absent", color: "bg-red-100 text-red-800" }
  if (attendance.clockOut) return { status: "Present", color: "bg-green-100 text-green-800" }
  if (attendance.clockIn) return { status: "Active", color: "bg-blue-100 text-blue-800" }
  return { status: "Not Started", color: "bg-gray-100 text-gray-800" }
}

const calculateWorkHours = (clockIn: Date | null, clockOut: Date | null, breakTime: number) => {
  if (!clockIn || !clockOut) return 0
  const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60)
  return Math.max(0, totalMinutes - breakTime) / 60
}

export default function AttendancePage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [attendance] = useState(mockAttendance)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  })

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredAttendance = attendance.filter(att =>
    att.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todayAttendance = attendance.filter(att =>
    att.date.toDateString() === new Date().toDateString()
  )

  const stats = {
    totalEmployees: new Set(attendance.map(att => att.user.email)).size,
    presentToday: todayAttendance.filter(att => att.clockOut || att.status === "active").length,
    absentToday: todayAttendance.filter(att => att.status === "absent" || (!att.clockIn && !att.clockOut)).length,
    activeNow: todayAttendance.filter(att => att.clockIn && !att.clockOut).length,
    averageHoursToday: todayAttendance
      .filter(att => att.clockOut)
      .reduce((sum, att) => sum + calculateWorkHours(att.clockIn, att.clockOut, att.breakTime), 0) /
      Math.max(todayAttendance.filter(att => att.clockOut).length, 1)
  }

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--"
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600 mt-1">
              Track employee attendance and working hours
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Time</p>
            <p className="text-lg font-semibold">{formatTime(currentTime)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Today's Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold">{stats.presentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold">{stats.activeNow}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-4 w-4 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absent Today</p>
                  <p className="text-2xl font-bold">{stats.absentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Hours</p>
                  <p className="text-2xl font-bold">{stats.averageHoursToday.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common attendance management actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Clock In
              </Button>
              <Button variant="outline">
                <Square className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
              <Button variant="outline">
                <Coffee className="mr-2 h-4 w-4" />
                Start Break
              </Button>
              <Button variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                End Break
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
            <CardDescription>
              Real-time attendance tracking for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAttendance.map((record) => {
                const statusInfo = getAttendanceStatus(record)
                const workHours = calculateWorkHours(record.clockIn, record.clockOut, record.breakTime)

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={record.user.image} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getInitials(record.user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {record.user.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {record.user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{record.user.email}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Clock Times */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Clock In</p>
                        <p className="font-medium">{formatTime(record.clockIn)}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-600">Clock Out</p>
                        <p className="font-medium">{formatTime(record.clockOut)}</p>
                      </div>

                      {/* Work Hours */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Work Hours</p>
                        <p className="font-medium">{workHours.toFixed(1)}h</p>
                      </div>

                      {/* Break Time */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Break</p>
                        <p className="font-medium">{formatDuration(record.breakTime)}</p>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <Badge className={statusInfo.color}>
                          {statusInfo.status}
                        </Badge>
                        {record.notes && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">{record.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-1">
                        {record.status === "active" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Square className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Coffee className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredAttendance.length === 0 && (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Attendance records will appear here as employees clock in and out.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
