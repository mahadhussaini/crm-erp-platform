// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Edit, Trash2, Share2 } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboards - Salesforce Analytics',
  description: 'Create and manage custom dashboards for your business metrics',
}

// Mock data for dashboards
const dashboards = [
  {
    id: '1',
    name: 'Sales Performance',
    description: 'Track sales metrics, revenue trends, and team performance',
    widgets: 6,
    lastUpdated: '2 hours ago',
    isPublic: false
  },
  {
    id: '2',
    name: 'Customer Analytics',
    description: 'Customer acquisition, retention, and satisfaction metrics',
    widgets: 4,
    lastUpdated: '1 day ago',
    isPublic: true
  },
  {
    id: '3',
    name: 'Operations Overview',
    description: 'Project status, inventory levels, and operational KPIs',
    widgets: 8,
    lastUpdated: '3 hours ago',
    isPublic: false
  },
  {
    id: '4',
    name: 'Executive Summary',
    description: 'High-level overview for leadership and stakeholders',
    widgets: 5,
    lastUpdated: '6 hours ago',
    isPublic: true
  }
]

export default async function DashboardsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
          <p className="text-gray-600 mt-1">
            Create and manage custom dashboards to visualize your business data
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Widgets</span>
                  <span className="font-medium">{dashboard.widgets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">{dashboard.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Visibility</span>
                  <span className={`font-medium ${dashboard.isPublic ? 'text-green-600' : 'text-blue-600'}`}>
                    {dashboard.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <Link href={`/analytics/dashboards/${dashboard.id}`}>
                  <Button className="w-full mt-4">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with pre-built dashboard templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>Sales Dashboard</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>Customer Dashboard</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>Operations Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
