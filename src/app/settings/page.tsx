"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Shield,
  Mail,
  Bell,
  Database,
  Key,
  UserPlus,
  Edit,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"
import { Role } from "@prisma/client"

// Mock data - In real app, this would come from API
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "ADMIN" as Role,
    isActive: true,
    lastLogin: new Date("2024-01-20T10:30:00"),
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "MANAGER" as Role,
    isActive: true,
    lastLogin: new Date("2024-01-20T09:15:00"),
    createdAt: new Date("2024-01-16")
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "EMPLOYEE" as Role,
    isActive: false,
    lastLogin: new Date("2024-01-19T16:45:00"),
    createdAt: new Date("2024-01-17")
  }
]

const mockModules = [
  { id: "crm", name: "CRM", description: "Customer Relationship Management", enabled: true },
  { id: "leads", name: "Lead Management", description: "Lead tracking and pipeline", enabled: true },
  { id: "inventory", name: "Inventory", description: "Product and stock management", enabled: true },
  { id: "orders", name: "Orders", description: "Order processing and management", enabled: true },
  { id: "projects", name: "Projects", description: "Project management and tracking", enabled: true },
  { id: "attendance", name: "Attendance", description: "Employee attendance tracking", enabled: true },
  { id: "hr", name: "HR Management", description: "Human resources functions", enabled: false },
  { id: "reports", name: "Reports", description: "Analytics and reporting", enabled: false }
]

const roleConfig = {
  ADMIN: { label: "Administrator", color: "bg-red-100 text-red-800" },
  MANAGER: { label: "Manager", color: "bg-blue-100 text-blue-800" },
  EMPLOYEE: { label: "Employee", color: "bg-green-100 text-green-800" },
  CUSTOMER: { label: "Customer", color: "bg-purple-100 text-purple-800" }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState(mockUsers)
  const [modules, setModules] = useState(mockModules)
  const [activeTab, setActiveTab] = useState("users")

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  // Only admins can access settings
  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const handleUserStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ))
  }

  const handleModuleToggle = (moduleId: string) => {
    setModules(prev => prev.map(module =>
      module.id === moduleId ? { ...module, enabled: !module.enabled } : module
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage users, system configuration, and platform modules
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-500 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <Badge className={roleConfig[user.role].color}>
                              {roleConfig[user.role].label}
                            </Badge>
                            {!user.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Created: {formatDate(user.createdAt)}</span>
                            <span>Last login: {formatDate(user.lastLogin)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleUserStatusToggle(user.id)}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Management */}
          <TabsContent value="modules" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Module Management</h2>
              <p className="text-gray-600">Enable or disable platform modules</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        <Badge
                          variant={module.enabled ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {module.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <Switch
                        checked={module.enabled}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Module Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
              <p className="text-gray-600">Configure system-wide settings and preferences</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Settings
                  </CardTitle>
                  <CardDescription>
                    Configure email notifications and SMTP settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send system notifications via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Server</label>
                    <Input placeholder="smtp.gmail.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Port</label>
                    <Input placeholder="587" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Database Settings
                  </CardTitle>
                  <CardDescription>
                    Configure database connections and backups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-gray-600">Automatically backup database daily</p>
                    </div>
                    <Switch
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <Input placeholder="Daily" />
                  </div>

                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Manual Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              <p className="text-gray-600">Configure security policies and authentication</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and access control
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Duration (minutes)</label>
                    <Input placeholder="60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure system notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Send push notifications to users</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-gray-600">Alert on suspicious activities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-gray-600">Notify on new login attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  API Keys & Integrations
                </CardTitle>
                <CardDescription>
                  Manage API keys and third-party integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Stripe Integration</p>
                      <p className="text-sm text-gray-600">Payment processing</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Not Configured</Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Twilio Integration</p>
                      <p className="text-sm text-gray-600">SMS and communication</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Not Configured</Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Google OAuth</p>
                      <p className="text-sm text-gray-600">Social login</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Configured</Badge>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
