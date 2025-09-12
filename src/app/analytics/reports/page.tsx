// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, FileText, Download, Calendar, Clock, Filter } from 'lucide-react'
// import Link from 'next/link'

export const metadata = {
  title: 'Reports - Salesforce Analytics',
  description: 'Generate and manage business reports and scheduled analytics',
}

// Mock data for reports
const reports = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    description: 'Comprehensive sales performance analysis for the month',
    type: 'SALES',
    schedule: 'Monthly',
    lastRun: '2 days ago',
    nextRun: '28 days',
    status: 'active'
  },
  {
    id: '2',
    name: 'Lead Conversion Analysis',
    description: 'Track lead sources and conversion rates across channels',
    type: 'LEADS',
    schedule: 'Weekly',
    lastRun: '3 days ago',
    nextRun: '4 days',
    status: 'active'
  },
  {
    id: '3',
    name: 'Customer Satisfaction Survey',
    description: 'Customer feedback and satisfaction metrics',
    type: 'CUSTOMERS',
    schedule: 'Quarterly',
    lastRun: '1 week ago',
    nextRun: '11 weeks',
    status: 'paused'
  },
  {
    id: '4',
    name: 'Inventory Status Report',
    description: 'Stock levels, low inventory alerts, and reorder recommendations',
    type: 'PRODUCTS',
    schedule: 'Daily',
    lastRun: '1 hour ago',
    nextRun: '23 hours',
    status: 'active'
  },
  {
    id: '5',
    name: 'Project Progress Summary',
    description: 'Overview of project timelines, milestones, and resource allocation',
    type: 'PROJECTS',
    schedule: 'Weekly',
    lastRun: '5 days ago',
    nextRun: '2 days',
    status: 'active'
  }
]

const getTypeColor = (type: string) => {
  switch (type) {
    case 'SALES':
      return 'bg-green-100 text-green-800'
    case 'LEADS':
      return 'bg-blue-100 text-blue-800'
    case 'CUSTOMERS':
      return 'bg-purple-100 text-purple-800'
    case 'PRODUCTS':
      return 'bg-orange-100 text-orange-800'
    case 'PROJECTS':
      return 'bg-pink-100 text-pink-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate, schedule, and manage automated business reports
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scheduled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{report.name}</h3>
                        <Badge className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{report.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Schedule: {report.schedule}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Last run: {report.lastRun}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Next run: {report.nextRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Create custom reports with your own data selections and filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No custom reports yet</h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first custom report
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Sales Performance</CardTitle>
                <CardDescription>
                  Revenue, conversion rates, and sales team metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Customer Analytics</CardTitle>
                <CardDescription>
                  Customer acquisition, retention, and lifetime value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
                <CardDescription>
                  Revenue, expenses, profit margins, and financial health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Inventory Report</CardTitle>
                <CardDescription>
                  Stock levels, movement, and reorder recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Project Progress</CardTitle>
                <CardDescription>
                  Timeline, milestones, resource allocation, and deliverables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Lead Analysis</CardTitle>
                <CardDescription>
                  Lead sources, quality scores, and conversion funnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
