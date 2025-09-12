"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientOnly } from "@/components/client-only"
import {
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Target,
  Building,
  FileText
} from "lucide-react"

// Mock data - In real app, this would come from API
const mockActivities = [
  {
    id: "1",
    type: "CALL" as const,
    title: "Follow-up call with Acme Corp",
    date: new Date(),
    user: { name: "John Doe" }
  },
  {
    id: "2",
    type: "EMAIL" as const,
    title: "Sent proposal to Tech Solutions",
    date: new Date(Date.now() - 1000 * 60 * 30),
    user: { name: "Jane Smith" }
  },
  {
    id: "3",
    type: "MEETING" as const,
    title: "Product demo scheduled",
    date: new Date(Date.now() - 1000 * 60 * 60),
    user: { name: "Mike Johnson" }
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin")
    }
  })

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
    return null
  }

  const userRole = session.user?.role || "EMPLOYEE"

  return (
    <ClientOnly>
      <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Stats Grid - Role-based content */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {/* Common stats for all roles */}
          <StatsCard
            title="Total Customers"
            value="2,350"
            change={{ value: 12, label: "from last month" }}
            icon={<Users />}
          />
          
          {/* CRM focused stats for sales roles */}
          {(userRole === "ADMIN" || userRole === "MANAGER") && (
            <>
              <StatsCard
                title="Revenue"
                value="$45,231"
                change={{ value: 20, label: "from last month" }}
                icon={<DollarSign />}
              />
              <StatsCard
                title="Active Leads"
                value="573"
                change={{ value: 8, label: "from last week" }}
                icon={<Target />}
              />
              <StatsCard
                title="Conversion Rate"
                value="24.5%"
                change={{ value: 3, label: "from last month" }}
                icon={<TrendingUp />}
              />
            </>
          )}

          {/* Employee specific stats */}
          {userRole === "EMPLOYEE" && (
            <>
              <StatsCard
                title="My Tasks"
                value="12"
                change={{ value: -2, label: "from yesterday" }}
                icon={<FileText />}
              />
              <StatsCard
                title="Companies"
                value="89"
                icon={<Building />}
              />
              <StatsCard
                title="This Month Sales"
                value="$12,234"
                change={{ value: 15, label: "from last month" }}
                icon={<DollarSign />}
              />
            </>
          )}

          {/* ERP stats for admin/manager */}
          {(userRole === "ADMIN" || userRole === "MANAGER") && (
            <StatsCard
              title="Inventory Items"
              value="1,234"
              change={{ value: 5, label: "new this week" }}
              icon={<Package />}
            />
          )}
        </div>

        {/* Charts and Activities Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Sales Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Revenue trends for the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Sales Chart Placeholder</p>
                <p className="text-sm text-gray-400 ml-2">(Recharts integration coming next)</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <RecentActivities activities={mockActivities} />
        </div>

        {/* Role-specific widgets */}
        {userRole === "ADMIN" && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Response</span>
                    <span className="text-sm text-green-600">Fast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm text-yellow-600">75% Used</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Platform usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Signups</span>
                    <span className="text-sm font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Session Duration</span>
                    <span className="text-sm font-medium">24m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>System notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-red-600">•</span> Low inventory alert for Product A
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-600">•</span> Payment gateway maintenance scheduled
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">•</span> Backup completed successfully
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
    </ClientOnly>
  )
}
