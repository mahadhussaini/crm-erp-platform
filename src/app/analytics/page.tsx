import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingCart, Calendar, FileText, PieChart } from 'lucide-react'
import Link from 'next/link'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'
import { SalesMetrics } from '@/components/analytics/sales-metrics'
import { RecentActivity } from '@/components/analytics/recent-activity'

export const metadata = {
  title: 'Analytics & Reports - Salesforce',
  description: 'Comprehensive analytics and reporting for your business data',
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            Gain insights into your business performance with comprehensive analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
          <Link href="/analytics/dashboards">
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboards
            </Button>
          </Link>
          <Link href="/analytics/reports">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">+2,350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">3.24%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.3% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>}>
              <AnalyticsOverview />
            </Suspense>
            <Suspense fallback={<div className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>}>
              <RecentActivity />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>}>
            <SalesMetrics />
          </Suspense>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>
                  Track new customer acquisition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="w-8 h-8 mr-2" />
                  Customer growth chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>
                  Breakdown of customers by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-8 h-8 mr-2" />
                  Customer segments chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>
                  Overview of active projects and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <Calendar className="w-8 h-8 mr-2" />
                  Project status overview will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>
                  Current stock levels and low inventory alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <TrendingUp className="w-8 h-8 mr-2" />
                  Inventory levels chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
