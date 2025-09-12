import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Users, FileText, TrendingUp, Send, Eye, MousePointer, UserPlus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Email Marketing - Salesforce',
  description: 'Manage email campaigns, templates, and subscriber lists',
}

export default async function MarketingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and track email campaigns to engage your customers
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/marketing/campaigns">
            <Button>
              <Send className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="lists">Subscriber Lists</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +4 this month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">24.8%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-8 bg-gray-200 animate-pulse rounded"></div>}>
                  <div className="text-2xl font-bold">4.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.8% from last month
                  </p>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>
                  Your latest email campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Summer Sale Announcement', sent: '2 hours ago', openRate: '28.5%', status: 'sent' },
                    { name: 'Weekly Newsletter #42', sent: '2 days ago', openRate: '22.1%', status: 'sent' },
                    { name: 'Product Update Alert', sent: '1 week ago', openRate: '31.2%', status: 'sent' },
                    { name: 'Customer Survey', sent: 'Scheduled', openRate: '-', status: 'scheduled' }
                  ].map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <p className="text-xs text-gray-500">Sent {campaign.sent}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{campaign.openRate}</p>
                        <p className="text-xs text-gray-500 capitalize">{campaign.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>
                  New subscribers over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <TrendingUp className="w-8 h-8 mr-2" />
                  Subscriber growth chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Campaigns</h2>
            <Link href="/marketing/campaigns">
              <Button>View All Campaigns</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Create your first email campaign to get started</p>
            <Link href="/marketing/campaigns">
              <Button>Create Campaign</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscriber Lists</h2>
            <Link href="/marketing/lists">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                New List
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriber lists yet</h3>
            <p className="text-gray-500 mb-4">Create lists to organize your subscribers</p>
            <Link href="/marketing/lists">
              <Button>Create List</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Link href="/marketing/templates">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-4">Create reusable email templates</p>
            <Link href="/marketing/templates">
              <Button>Create Template</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
