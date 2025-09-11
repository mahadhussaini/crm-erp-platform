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
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Play,
  Pause,
  Square
} from "lucide-react"
import { formatCurrency, getInitials, formatDate } from "@/lib/utils"
import { ProjectStatus } from "@prisma/client"

// Mock data - In real app, this would come from API
const mockProjects = [
  {
    id: "1",
    name: "E-commerce Platform Redesign",
    description: "Complete overhaul of the company's e-commerce platform with modern UI/UX",
    status: "IN_PROGRESS" as ProjectStatus,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-04-15"),
    budget: 150000,
    manager: {
      name: "Sarah Johnson",
      image: ""
    },
    tasks: [
      { id: "1", title: "UI/UX Design", status: "COMPLETED", assignedTo: "Mike Chen" },
      { id: "2", title: "Frontend Development", status: "IN_PROGRESS", assignedTo: "Jane Smith" },
      { id: "3", title: "Backend API", status: "PENDING", assignedTo: "John Doe" },
      { id: "4", title: "Testing & QA", status: "PENDING", assignedTo: "Lisa Brown" }
    ],
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile application for iOS and Android platforms",
    status: "PLANNING" as ProjectStatus,
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-06-01"),
    budget: 200000,
    manager: {
      name: "Mike Chen",
      image: ""
    },
    tasks: [
      { id: "5", title: "Requirements Gathering", status: "COMPLETED", assignedTo: "Sarah Johnson" },
      { id: "6", title: "Technical Specification", status: "IN_PROGRESS", assignedTo: "Mike Chen" }
    ],
    createdAt: new Date("2024-01-20")
  },
  {
    id: "3",
    name: "Data Analytics Dashboard",
    description: "Business intelligence dashboard for executive reporting",
    status: "COMPLETED" as ProjectStatus,
    startDate: new Date("2023-11-01"),
    endDate: new Date("2024-01-31"),
    budget: 75000,
    manager: {
      name: "Jane Smith",
      image: ""
    },
    tasks: [
      { id: "7", title: "Data Pipeline Setup", status: "COMPLETED", assignedTo: "John Doe" },
      { id: "8", title: "Dashboard Design", status: "COMPLETED", assignedTo: "Lisa Brown" },
      { id: "9", title: "Implementation", status: "COMPLETED", assignedTo: "Mike Chen" }
    ],
    createdAt: new Date("2023-11-01")
  }
]

const statusConfig = {
  PLANNING: { label: "Planning", color: "bg-gray-100 text-gray-800", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Play },
  ON_HOLD: { label: "On Hold", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: Square }
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [projects] = useState(mockProjects)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.manager.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'PLANNING').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    cancelled: projects.filter(p => p.status === 'CANCELLED').length,
    totalBudget: projects.reduce((sum, project) => sum + (project.budget || 0), 0),
    averageCompletion: projects.length > 0 ?
      projects.reduce((sum, project) => {
        const totalTasks = project.tasks.length
        const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length
        return sum + (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0)
      }, 0) / projects.length : 0
  }

  const calculateProjectProgress = (tasks: typeof mockProjects[0]['tasks']) => {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
    return (completedTasks / tasks.length) * 100
  }

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage project portfolios and track progress
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
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
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold">{stats.averageCompletion.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
            <CardDescription>
              Distribution of projects across different stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = stats[status.toLowerCase() as keyof typeof stats] as number
                const IconComponent = config.icon

                return (
                  <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        <p className="text-xs text-gray-600">{count} projects</p>
                      </div>
                    </div>
                    <Badge className={config.color}>
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const progress = calculateProjectProgress(project.tasks)
            const daysRemaining = getDaysRemaining(project.endDate)
            const isOverdue = daysRemaining < 0 && project.status !== 'COMPLETED'
            const statusInfo = statusConfig[project.status]

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Manager */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={project.manager.image} />
                      <AvatarFallback className="text-sm">
                        {getInitials(project.manager.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{project.manager.name}</p>
                      <p className="text-xs text-gray-500">Project Manager</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{project.tasks.filter(t => t.status === 'COMPLETED').length} of {project.tasks.length} tasks</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <div className="flex items-center space-x-1">
                        <p className="font-medium">{formatDate(project.endDate)}</p>
                        {isOverdue && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  {project.budget && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="text-sm font-medium">{formatCurrency(project.budget)}</span>
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Team ({new Set(project.tasks.map(t => t.assignedTo)).size})</h4>
                    <div className="flex -space-x-2">
                      {Array.from(new Set(project.tasks.map(t => t.assignedTo))).slice(0, 4).map((member, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-xs">
                            {getInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {new Set(project.tasks.map(t => t.assignedTo)).size > 4 && (
                        <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          +{new Set(project.tasks.map(t => t.assignedTo)).size - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Update Status
                    </Button>
                  </div>

                  {/* Deadline Warning */}
                  {isOverdue && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Overdue by {Math.abs(daysRemaining)} days</span>
                    </div>
                  )}
                  {!isOverdue && daysRemaining <= 7 && project.status !== 'COMPLETED' && (
                    <div className="flex items-center space-x-2 text-orange-600 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{daysRemaining} days remaining</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first project.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
